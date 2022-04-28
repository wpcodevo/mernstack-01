import qs from 'qs';
import { DocumentType } from '@typegoose/typegoose';
import config from 'config';
import { User } from '../model/user.model';
import { signJwt, verifyJwt } from '../utils/jwt';
import { findUser } from './user.service';
import redisClient from '../utils/connectRedis';
import log from '../utils/logger';
import axios from 'axios';

const ACCESS_TOKEN_EXPIRES_IN = config.get<number>('accessTokenExpiresIn');
const REFRESH_TOKEN_EXPIRES_IN = config.get<number>('refreshTokenExpiresIn');

export const signTokens = async (user: DocumentType<User>) => {
  redisClient.set(user._id, JSON.stringify(user), {
    EX: 60 * 60,
  });

  const accessToken = signJwt({ user: user._id }, 'accessPrivateKey', {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}m`,
  });

  const refreshToken = signJwt({ user: user._id }, 'refreshPrivateKey', {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}m`,
  });

  return { accessToken, refreshToken };
};

export const reIssueNewAccessToken = async (refreshToken: string) => {
  const decoded = verifyJwt<{ user: string }>(refreshToken, 'refreshPublicKey');
  if (!decoded) return false;

  const session = await redisClient.get(decoded.user);
  if (!session) return false;

  const user = await findUser({ _id: JSON.parse(session)._id });
  if (!user) return false;

  return signJwt({ user: user._id }, 'accessPrivateKey', {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}m`,
  });
};

interface GoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

export const getGoogleOauthToken = async ({
  code,
}: {
  code: string;
}): Promise<GoogleOauthToken> => {
  const rootURl = 'https://oauth2.googleapis.com/token';

  const options = {
    code,
    client_id: config.get<string>('googleClientId'),
    client_secret: config.get<string>('googleClientSecret'),
    redirect_uri: config.get<string>('googleOauthRedirect'),
    grant_type: 'authorization_code',
  };
  try {
    const { data } = await axios.post<GoogleOauthToken>(
      rootURl,
      qs.stringify(options),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return data;
  } catch (err: any) {
    log.error('Failed to fetch Google Oauth Tokens');
    throw new Error(err);
  }
};

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUserResult> {
  try {
    const { data } = await axios.get<GoogleUserResult>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    log.error(err);
    throw Error(err);
  }
}

type GitHubOauthToken = {
  access_token: string;
};

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: null;
  email: string;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

export const getGithubOathToken = async ({
  code,
}: {
  code: string;
}): Promise<GitHubOauthToken> => {
  const rootUrl = 'https://github.com/login/oauth/access_token';
  const options = {
    client_id: config.get<string>('githubClientId'),
    client_secret: config.get<string>('githubClientSecret'),
    code,
  };

  const queryString = qs.stringify(options);

  try {
    const { data } = await axios.post(`${rootUrl}?${queryString}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const decoded = qs.parse(data) as GitHubOauthToken;

    return decoded;
  } catch (err: any) {
    log.error(err);
    throw Error(err);
  }
};

export const getGithubUser = async ({
  access_token,
}: {
  access_token: string;
}): Promise<GitHubUser> => {
  try {
    const { data } = await axios.get<GitHubUser>(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return data;
  } catch (err: any) {
    throw Error(err);
  }
};
