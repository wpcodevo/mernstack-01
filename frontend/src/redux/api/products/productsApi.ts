import { createApi } from '@reduxjs/toolkit/dist/query/react';
import baseQueryWithReauth from '../customFetchBase';
import { IProduct } from './types';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query<IProduct[], void>({
      query() {
        return '/products';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Products' as const,
                id,
              })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
      transformResponse: (response: { data: { products: IProduct[] } }) =>
        response.data.products,
    }),
    getProduct: builder.query<IProduct, string>({
      query(id) {
        return `/products/${id}`;
      },
      transformResponse: (
        response: { data: { product: IProduct } },
        args,
        meta
      ) => response.data.product,
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation<IProduct, FormData>({
      query(data) {
        return {
          url: '/products',
          method: 'POST',
          credentials: 'include',
          body: data,
        };
      },
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
      transformResponse: (response: { data: { product: IProduct } }) =>
        response.data.product,
    }),
    updateProduct: builder.mutation<
      IProduct,
      { id: string; formData: FormData }
    >({
      query({ id, formData }) {
        return {
          url: `/products/${id}`,
          method: 'PATCH',
          credentials: 'include',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) =>
        result
          ? [
              { type: 'Products', id },
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
      transformResponse: (response: { data: { product: IProduct } }) =>
        response.data.product,
    }),
    deleteProduct: builder.mutation<null, string>({
      query(id) {
        return {
          url: `/products/${id}`,
          method: 'DELETE',
          credentials: 'include',
        };
      },
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  usePrefetch,
} = productsApi;
