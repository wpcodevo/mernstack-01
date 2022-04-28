export interface IUser {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: string;
  provider?: string;
  active?: boolean;
  verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  id: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  status: string;
  accessToken: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface IRegisterResponse {
  status: string;
  message: string;
}

export interface IVerifyEmailRequest {
  verificationCode: string;
}

export interface IVerifyEmailResponse {
  status: string;
  message: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IForgotPasswordResponse {
  status: string;
  message: string;
}

export interface IResetPasswordRequest {
  resetToken: string;
  password: string;
  passwordConfirm: string;
}
