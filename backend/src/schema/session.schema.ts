import { object, string, TypeOf } from 'zod';

export const loginSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Invalid email or password'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Invalid email or password'),
  }),
});

export type LoginInput = TypeOf<typeof loginSchema>['body'];
