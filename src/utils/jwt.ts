import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES = (process.env.JWT_EXPIRES || '8h') as SignOptions['expiresIn'];

export const signJwt = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

export const verifyJwt = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
