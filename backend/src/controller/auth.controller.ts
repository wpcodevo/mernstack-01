import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import config from 'config';
import { LoginInput } from '../schema/session.schema';
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  VerifyUserInput,
} from '../schema/user.schema';
import {
  getGithubOathToken,
  getGithubUser,
  getGoogleOauthToken,
  getGoogleUser,
  signTokens,
} from '../service/session.service';
import {
  createUser,
  findAndUpdateUser,
  findUser,
  findUserByEmail,
} from '../service/user.service';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import Email from '../utils/email';
import { verifyJwt, signJwt } from '../utils/jwt';
import log from '../utils/logger';

const ACCESS_TOKEN_EXPIRES_IN = config.get<number>('accessTokenExpiresIn');
const REFRESH_TOKEN_EXPIRES_IN = config.get<number>('refreshTokenExpiresIn');

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  // domain: config.get<string>('origin'),
};

// if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

export const accessCookieOptions = {
  ...cookieOptions,
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN * 60 * 1000),
  maxAge: ACCESS_TOKEN_EXPIRES_IN * 60 * 1000,
};

const refreshCookieOptions = {
  ...cookieOptions,
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000),
  maxAge: REFRESH_TOKEN_EXPIRES_IN * 60 * 1000,
};

function logoutUser(res: Response) {
  res.cookie('access-token', '', { maxAge: 1 });
  res.cookie('refresh-token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
}

export const excludedFields = [
  'password',
  'verificationCode',
  'verified',
  'passwordChangedAt',
  'passwordResetToken',
  'passwordResetAt',
  'active',
];

export const createUserHandler = async (
  req: Request<Record<string, never>, Record<string, never>, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const verificationCode = user.createVerificationCode();
    await user.save();

    try {
      const url = `${config.get<string>(
        'origin'
      )}/verifyEmail/${verificationCode}`;

      await new Email(user, url).sendVerificationCode();
    } catch (err: any) {
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending email',
      });
    }

    res.status(201).json({
      status: 'success',
      message: `We sent an email with a verification code to ${user.email}`,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exist',
      });
    }
    next(err);
  }
};

export const verifyUserHandler = async (
  req: Request<VerifyUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user based on the POSTed verificationCode
    const verificationCode = crypto
      .createHash('sha256')
      .update(req.params.verificationCode)
      .digest('hex');

    const user = await findUser({ verificationCode });
    if (!user) {
      return res.status(403).json({
        status: 'fail',
        message: 'Could not verify user',
      });
    }

    user.verified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: "It's you! Your email address has been successfully verified.",
    });
  } catch (err: any) {
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const user = await findUser({ email: req.body.email });
    const message =
      'You will receive a reset email if user with that email exist';
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message,
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'fail',
        message: 'Account not verified',
      });
    }

    if (user.provider) {
      return res.status(403).json({
        status: 'fail',
        message:
          'We found your account. It looks like you registered with a social auth account. Try signing in with social auth.',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    try {
      const url = `${config.get<string>('origin')}/resetPassword/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken();

      res.status(200).json({
        status: 'success',
        message,
      });
    } catch (err: any) {
      user.passwordResetToken = undefined;
      user.passwordResetAt = undefined;
      await user.save();
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending email',
      });
    }
  } catch (err: any) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput['params'],
    Record<string, never>,
    ResetPasswordInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await findUser({
      passwordResetToken,
      passwordResetAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid token or token has expired',
      });
    }

    // Change password data
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetAt = undefined;
    await user.save();

    logoutUser(res);
    res.status(200).json({
      status: 'success',
      message: 'Password data updated successfully',
    });
  } catch (err: any) {
    next(err);
  }
};

let refreshTokens: string[] = [];

export const loginHandler = async (
  req: Request<Record<string, never>, Record<string, never>, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if the user exist and password is correct
    const { email, password } = req.body;
    const user = await findUserByEmail({ email });

    if (user?.provider) {
      return res.status(403).json({
        status: 'fail',
        message:
          'We found your account. It looks like you registered with a social auth account. Try signing in with social auth.',
      });
    }

    if (!user || !(await user.comparePasswords(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }
    if (!user.verified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Account not verified',
      });
    }

    // Create refresh and access token
    const { refreshToken, accessToken } = await signTokens(user);

    // Send refresh token in cookie
    res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    res.cookie('access-token', accessToken, accessCookieOptions);

    res.cookie('logged_in', true, {
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000),
    });

    refreshTokens.push(refreshToken);

    // Send access token
    res.status(201).json({
      status: 'success',
      accessToken,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updatePasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    UpdatePasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user from the collection and check if the current password is valid
    const { passwordCurrent, password } = req.body;
    const user = await findUser({ _id: res.locals.user._id });

    if (user?.provider) {
      return res.status(403).json({
        status: 'fail',
        message:
          'We found your account. It looks like you registered with a social auth account. Try signing in with social auth.',
      });
    }

    if (!user || !(await user.comparePasswords(passwordCurrent))) {
      return next(
        new AppError(
          `Your current password is incorrect or user doesn't exist`,
          401
        )
      );
    }

    user.password = password;
    await user.save();

    logoutUser(res);

    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken: string = req.cookies['refresh-token'];
    const message = 'Could not refresh access token';

    if (!refreshToken) {
      logoutUser(res);
      return next(new AppError(message, 401));
    }

    if (!refreshTokens.includes(refreshToken)) {
      logoutUser(res);
      return next(new AppError('Access token can only be refreshed once', 403));
    }

    const decoded = verifyJwt<{ user: string }>(
      refreshToken,
      'refreshPublicKey'
    );

    if (!decoded) {
      logoutUser(res);
      return next(new AppError(message, 401));
    }

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const session = await redisClient.get(decoded.user);

    if (!session) {
      return next(new AppError('Session has expired, login again', 401));
    }

    const userId = JSON.parse(session)._id;

    const user = await findUser({ _id: userId });

    if (!user) {
      return next(new AppError(message, 401));
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await signTokens(user);

    refreshTokens.push(newRefreshToken);

    res.cookie('access-token', newAccessToken, accessCookieOptions);
    res.cookie('logged_in', true, {
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000),
    });

    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
    });
  } catch (err: any) {
    return res.redirect(`${config.get<string>('origin')}/login`);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }
    next();
  };
};

export const googleOauthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the code from the query
    const code = req.query.code as string;
    const pathUrl = (req.query.state as string) || '/';

    if (!code) {
      return next(new AppError('Authorization code not provided!', 401));
    }

    // Use the code to get the id and access tokens
    const { id_token, access_token } = await getGoogleOauthToken({ code });

    // Use the token to get the User
    const { name, verified_email, email, picture } = await getGoogleUser({
      id_token,
      access_token,
    });

    // Update user if user already exist or create new user
    if (!verified_email) {
      return next(new AppError('Google account not verified', 403));
    }

    const user = await findAndUpdateUser(
      { email },
      {
        name,
        photo: picture,
        email,
        provider: 'Google',
        verified: true,
      },
      { upsert: true, runValidators: false, new: true, lean: true }
    );

    if (!user)
      return res.redirect(`${config.get<string>('origin')}/oauth/error`);

    // Create access and refresh token
    const { accessToken, refreshToken } = await signTokens(user);

    // Send cookie
    res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    res.cookie('access-token', accessToken, accessCookieOptions);
    res.cookie('logged_in', true, {
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000),
    });
    refreshTokens.push(refreshToken);

    res.redirect(`${config.get<string>('origin')}${pathUrl}`);
  } catch (err: any) {
    console.log(err);
    log.error('Failed to authorize Google User');
    return res.redirect(`${config.get<string>('origin')}/oauth/error`);
  }
};

export const githubOauthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the code from the query
    const code = req.query.code as string;
    const pathUrl = (req.query.state as string) ?? '/';

    if (req.query.error) {
      return res.redirect(`${config.get<string>('origin')}/login`);
    }

    if (!code) {
      return next(new AppError('Authorization code not provided!', 401));
    }

    // Get the user the access_token with the code
    const { access_token } = await getGithubOathToken({ code });

    // Get the user with the access_token
    const { email, avatar_url, login } = await getGithubUser({ access_token });

    // Create new user or update user if user already exist
    const user = await findAndUpdateUser(
      { email },
      {
        email,
        photo: avatar_url,
        name: login,
        provider: 'GitHub',
        verified: true,
      },
      { runValidators: false, new: true, upsert: true }
    );

    if (!user) {
      return res.redirect(`${config.get<string>('origin')}/oauth/error`);
    }

    // Create access and refresh tokens
    const { accessToken, refreshToken } = await signTokens(user);

    res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    res.cookie('access-token', accessToken, accessCookieOptions);
    res.cookie('logged_in', true, {
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 60 * 1000),
    });

    refreshTokens.push(refreshToken);

    res.redirect(`${config.get<string>('origin')}${pathUrl}`);
  } catch (err: any) {
    log.error('Failed to authorize GitHub User');
    return res.redirect(`${config.get<string>('origin')}/oauth/error`);
  }
};

export const logoutHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies['refresh-token'];

    if (refreshToken) {
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    }

    const user = res.locals.user;

    redisClient.del(user._id);

    logoutUser(res);
    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};
