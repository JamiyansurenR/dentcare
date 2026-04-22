import { SessionOptions } from 'iron-session';

export interface SessionUser {
  id: number;
  username: string;
  role: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_PASSWORD || 'complex_password_at_least_32_characters_long_12345',
  cookieName: 'dentist_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
};

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}
