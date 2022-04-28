import { array, number, object, string, TypeOf } from 'zod';

const params = {
  params: object({
    productId: string(),
  }),
};

export const createProductSchema = object({
  body: object({
    name: string({
      required_error: 'Product name is required',
    }).min(10, 'Product name must be more than 10 characters'),
    price: number({
      required_error: 'Price is required',
    }).positive('Price must be positive'),
    description: string().optional(),
    imageCover: string({
      required_error: 'Image cover is required',
    }),
    images: array(string()).optional(),
    countInStock: number({
      required_error: 'Product must have countInStock',
    }).positive('CountInStock must be positive'),
    category: string({ required_error: 'Product must have a category' }),
  }),
});

export const getAllProductsSchema = object({
  query: object({
    page: string(),
    limit: string(),
    field: string(),
    sort: string(),
  }).partial(),
});

export const getProductSchema = object({
  ...params,
});

export const updateProductSchema = object({
  ...params,
  body: object({
    name: string().min(10, 'Product name must be more than 10 characters'),
    price: number().positive(),
    description: string(),
    imageCover: string(),
    images: array(string()),
    countInStock: number().positive(),
  }).partial(),
});

export const deleteProductSchema = object({
  ...params,
});

export type GetAllProductsInput = TypeOf<typeof getAllProductsSchema>['query'];
export type CreateProductInput = TypeOf<typeof createProductSchema>['body'];
export type GetProductInput = TypeOf<typeof getProductSchema>['params'];
export type UpdateProductInput = TypeOf<typeof updateProductSchema>;
export type DeleteProductInput = TypeOf<typeof deleteProductSchema>['params'];
