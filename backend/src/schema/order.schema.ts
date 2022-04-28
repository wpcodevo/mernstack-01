import { array, number, object, string, TypeOf } from 'zod';

const orderItem = object({
  _id: string(),
  name: string().min(10, 'Product name must be more than 10 characters'),
  price: number().positive(),
  avgRating: number(),
  numRating: number(),
  description: string(),
  imageCover: string(),
  images: array(string()),
  countInStock: number().positive(),
  quantity: number().positive(),
  slug: string(),
});

export const createOrderSchema = object({
  body: object({
    shippingAddress: object({
      address: string({ required_error: 'Address is required' }).max(100),
      address2: string().max(100).optional(),
      city: string({ required_error: 'City is required' }),
      state: string({ required_error: 'State is required' }).length(2),
      zipCode: string({ required_error: 'Zip code is required' }).length(5),
      country: string({ required_error: 'Country is required' }).max(100),
    }),
    orderItems: array(orderItem).nonempty('Order Items must not be empty'),
    itemsTotalPrice: number({
      required_error: 'Items Total Price is required',
    }),
    totalQuantity: number(),
    totalAmount: number(),
    shippingPrice: number(),
    taxPrice: number(),
    paymentMethod: string({ required_error: 'Payment Method is required' }),
  }),
});

const params = {
  params: object({
    orderId: string(),
  }),
};

export const updateOrderSchema = object({
  ...params,
  body: object({
    shippingAddress: object({
      address: string({ required_error: 'Address is required' }).max(100),
      address2: string().max(100).optional(),
      city: string({ required_error: 'City is required' }),
      state: string({ required_error: 'State is required' }).length(2),
      zipCode: string({ required_error: 'Zip code is required' }).length(5),
      country: string({ required_error: 'Country is required' }).max(100),
    }),
    orderItems: array(orderItem),
    itemsTotalPrice: number(),
    totalQuantity: number(),
    totalAmount: number(),
    shippingPrice: number(),
    taxPrice: number(),
    paymentMethod: string(),
  }).partial(),
});

export const updateOrderToPaidSchema = object({
  ...params,
  body: object({
    id: string(),
    status: string(),
    update_time: string(),
    payer: object({
      email_address: string(),
    }),
  }),
});

export const getOrderSchema = object({
  ...params,
});

export const deleteOrderSchema = object({
  ...params,
});

export const updateOrderToDeliveredSchema = object({
  ...params,
});

export type CreateOrderInput = TypeOf<typeof createOrderSchema>['body'];
export type UpdateOrderInput = TypeOf<typeof updateOrderSchema>;
export type UpdateOrderToPaidInput = TypeOf<typeof updateOrderToPaidSchema>;
export type UpdateOrderToDeliveredInput = TypeOf<
  typeof updateOrderToDeliveredSchema
>['params'];
export type GetOrderInput = TypeOf<typeof getOrderSchema>['params'];
export type DeleteOrderInput = TypeOf<typeof deleteOrderSchema>['params'];
