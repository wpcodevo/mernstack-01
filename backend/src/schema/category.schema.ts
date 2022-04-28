import { array, object, string, TypeOf } from 'zod';

export const createCategorySchema = object({
  body: object({
    name: string({
      required_error: 'Category name is required',
    }),
    description: string({}).optional(),
    image: string({
      required_error: 'Category must have an image',
    }),
    subcategories: array(string()).optional(),
  }),
});

const params = {
  categoryId: string(),
};

export const updateCategorySchema = object({
  params: object({
    ...params,
  }),
  body: object({
    name: string(),
    description: string(),
    image: string(),
    subcategories: array(string()),
  }).partial(),
});

export const getCategorySchema = object({
  params: object({
    ...params,
  }),
});

export const deleteCategorySchema = object({
  params: object({
    ...params,
  }),
});

export type CreateCategoryInput = TypeOf<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = TypeOf<typeof updateCategorySchema>;
export type GetCategoryInput = TypeOf<typeof getCategorySchema>['params'];
export type DeleteCategoryInput = TypeOf<typeof deleteCategorySchema>['params'];
