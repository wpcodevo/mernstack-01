import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { IUser } from './types';
import baseQueryWithReauth from './customFetchBase';
import { updatedUser } from '../features/authSlice';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query<IUser, string>({
      query(id) {
        return {
          url: `users/${id}`,
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { user: IUser } }) =>
        response.data.user,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(updatedUser({ updatedUserInfo: data }));
        } catch (error) {}
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
      keepUnusedDataFor: 0.001,
    }),
    getAllUsers: builder.query<IUser[], void>({
      query() {
        return {
          url: 'users',
          credentials: 'include',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      transformResponse: (response: { data: { users: IUser[] } }) =>
        response.data.users,
    }),
    updateUser: builder.mutation<IUser, { id: string; userData: FormData }>({
      query({ id, userData }) {
        return {
          url: `users/${id}`,
          method: 'PATCH',
          credentials: 'include',
          body: userData,
        };
      },
      transformResponse: (response: { data: { user: IUser } }) =>
        response.data.user,
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'User', id: result._id },
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      onQueryStarted: async ({ userData }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(updatedUser({ updatedUserInfo: data }));
        } catch (error) {}
      },
    }),
    deleteUser: builder.mutation<void, string>({
      query(id) {
        return {
          url: `users/${id}`,
          method: 'DELETE',
          credentials: 'include',
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = userApi;
