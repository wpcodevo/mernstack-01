import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { excludedFields } from '../controller/auth.controller';
import { findUser } from '../service/user.service';
import AppError from '../utils/appError';
import { verifyJwt } from '../utils/jwt';
import client from '../utils/connectRedis';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the access token
    let accessToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      accessToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies['access-token']) {
      accessToken = req.cookies['access-token'];
    }

    if (!accessToken) {
      return next(new AppError('You are not logged in', 401));
    }

    // Validate the access token
    const decoded = verifyJwt<{ user: string; session: string; iat: number }>(
      accessToken,
      'accessPublicKey'
    );

    if (!decoded)
      return next(new AppError('Token is invalid or has expired', 401));

    // Check if the session is valid

    const session = await client.get(decoded.user);

    if (!session) return next();

    const user = await findUser({ _id: JSON.parse(session)._id });

    if (user?.passwordChangedAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password, please login again', 403)
      );
    }

    res.locals.user = {
      ...omit(user?.toJSON(), excludedFields),
    };

    return next();
  } catch (err: any) {
    next(err);
  }
};
