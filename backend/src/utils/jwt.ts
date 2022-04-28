import jwt, { SignOptions } from 'jsonwebtoken';
import config from 'config';

export const signJwt = (
  object: Record<string, unknown>,
  keyName: 'refreshPrivateKey' | 'accessPrivateKey',
  options?: SignOptions
) => {
  const privateKey = Buffer.from(
    config.get<string>(keyName),
    'base64'
  ).toString('ascii');
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
  });
};

export const verifyJwt = <T>(
  token: string,
  keyName: 'refreshPublicKey' | 'accessPublicKey'
): T | null => {
  try {
    const publicKey = Buffer.from(
      config.get<string>(keyName),
      'base64'
    ).toString('ascii');
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (err: any) {
    return null;
  }
};
