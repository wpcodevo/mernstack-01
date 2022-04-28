import { createApi } from '@reduxjs/toolkit/dist/query/react';
import baseQueryWithReauth from '../customFetchBase';
import { ICategory } from './types';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<ICategory[], void>({
      query() {
        return {
          url: 'categories',
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { categories: ICategory[] } }) =>
        response.data.categories,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: 'Category' as const,
                id: _id,
              })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    getCategory: builder.query<ICategory, string>({
      query(id) {
        return {
          url: `categories/${id}`,
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { category: ICategory } }) =>
        response.data.category,
    }),
    createCategory: builder.mutation<ICategory, FormData>({
      query(data) {
        return {
          url: 'categories',
          method: 'POST',
          credentials: 'include',
          body: data,
        };
      },
      transformResponse: (response: { data: { category: ICategory } }) =>
        response.data.category,
    }),
    updateCategory: builder.mutation<
      ICategory,
      { id: string; formData: FormData }
    >({
      query({ id, formData }) {
        return {
          url: `categories/${id}`,
          method: 'PATCH',
          body: formData,
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { category: ICategory } }) =>
        response.data.category,
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} = categoryApi;
