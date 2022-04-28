import { createApi } from '@reduxjs/toolkit/query/react';
import customFetchBase from '../customFetchBase';
import { productsApi } from '../products/productsApi';
import {
  IOrderResponse,
  CreateOrderRequest,
  IOrder,
  IOrderPaidRequest,
} from './types';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: customFetchBase,
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getAllOrders: builder.query<IOrder[], void>({
      query() {
        return {
          url: 'orders',
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { orders: IOrder[] } }) =>
        response.data.orders,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Order' as const, id: _id })),

              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    createOrder: builder.mutation<IOrderResponse, CreateOrderRequest>({
      query(data) {
        return {
          url: 'orders',
          method: 'POST',
          credentials: 'include',
          body: data,
        };
      },
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        try {
          await cacheDataLoaded;
          dispatch(
            productsApi.util.invalidateTags([{ type: 'Products', id: 'LIST' }])
          );
        } catch (error) {}
        await cacheEntryRemoved;
      },
    }),
    getOrder: builder.query<IOrder, string>({
      query(id) {
        return `orders/${id}`;
      },
      transformResponse: (response: { data: { order: IOrder } }) =>
        response.data.order,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateOrderToPaid: builder.mutation<
      IOrder,
      { orderId: string; paymentResult: IOrderPaidRequest }
    >({
      query({ orderId, paymentResult }) {
        return {
          url: `orders/${orderId}/pay`,
          method: 'PATCH',
          credentials: 'include',
          body: paymentResult,
        };
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),
    getMyOrders: builder.query<IOrder[], void>({
      query() {
        return {
          url: 'orders/myOrders',
          credentials: 'include',
        };
      },
      transformResponse: (response: { data: { orders: IOrder[] } }) => {
        return response.data.orders;
      },
    }),
    updateOrderToDelivered: builder.mutation<IOrder, string>({
      query(id) {
        return {
          url: `orders/${id}/deliver`,
          method: 'PATCH',
          credentials: 'include',
        };
      },
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderQuery,
  useUpdateOrderToPaidMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderToDeliveredMutation,
} = orderApi;
