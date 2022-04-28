import { createApi } from '@reduxjs/toolkit/query/react';
import { userInfo } from '../features/authSlice';
import {
  IForgotPasswordRequest,
  IForgotPasswordResponse,
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
  IRegisterResponse,
  IResetPasswordRequest,
  IUser,
  IVerifyEmailRequest,
  IVerifyEmailResponse,
} from './types';
import baseQueryWithReauth from './customFetchBase';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserInfo'],
  endpoints: (builder) => ({
    getUserInfo: builder.query<IUser, null>({
      query() {
        return {
          url: `users/me`,
          credentials: 'include',
        };
      },
      keepUnusedDataFor: 0.0001,
      providesTags: ['UserInfo'],
      onQueryStarted: async (user, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(userInfo({ user: data }));
        } catch (error) {}
      },
      transformResponse: (response: { data: { user: IUser } }) =>
        response.data.user,
    }),
    loginUser: builder.mutation<ILoginResponse, ILoginRequest>({
      query(user) {
        return {
          url: 'users/login',
          method: 'POST',
          body: user,
          credentials: 'include',
        };
      },
      onQueryStarted: async (user, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          await dispatch(authApi.util.invalidateTags(['UserInfo']));
        } catch (error) {}
      },
    }),
    registerUser: builder.mutation<IRegisterResponse, IRegisterRequest>({
      query(credentials) {
        return {
          url: 'users/signup',
          method: 'POST',
          body: credentials,
        };
      },
    }),
    verifyEmail: builder.mutation<IVerifyEmailResponse, IVerifyEmailRequest>({
      query({ verificationCode }) {
        return {
          url: `users/verify/${verificationCode}`,
          method: 'GET',
        };
      },
    }),
    forgotPassword: builder.mutation<
      IForgotPasswordResponse,
      IForgotPasswordRequest
    >({
      query({ email }) {
        return {
          url: 'users/forgotPassword',
          method: 'POST',
          body: { email },
        };
      },
    }),
    resetPassword: builder.mutation<void, IResetPasswordRequest>({
      query({ resetToken, password, passwordConfirm }) {
        return {
          url: `users/resetPassword/${resetToken}`,
          method: 'PATCH',
          body: { password, passwordConfirm },
          credentials: 'include',
        };
      },
    }),
    refreshToken: builder.query<ILoginResponse, null>({
      query() {
        return {
          url: 'users/refresh',
          credentials: 'include',
        };
      },
    }),

    logoutUser: builder.mutation<null, void>({
      query() {
        return {
          url: 'users/logout',
          credentials: 'include',
        };
      },
    }),
    updateMe: builder.mutation<IUser, Partial<FormData>>({
      query(formData) {
        return {
          url: `/users/updateMe`,
          method: 'PATCH',
          credentials: 'include',
          body: formData,
        };
      },
      transformResponse: (response: { data: { user: IUser } }) => {
        return response.data.user;
      },
      onQueryStarted: async (formData, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(userInfo({ user: data }));
        } catch (error) {}
      },
    }),
    updatePassword: builder.mutation<
      { status: string },
      { password: string; passwordCurrent: string; passwordConfirm: string }
    >({
      query(passwordData) {
        return {
          url: `/users/updatePassword`,
          method: 'PATCH',
          credentials: 'include',
          body: passwordData,
        };
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegisterUserMutation,
  useVerifyEmailMutation,
  useUpdateMeMutation,
  useUpdatePasswordMutation,
  useGetUserInfoQuery,
} = authApi;
