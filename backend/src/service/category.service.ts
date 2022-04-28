import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import categoryModel, { Category } from '../model/category.model';

export const createCategory = async (input: Partial<Category>) => {
  return await categoryModel.create(input);
};

export const getCategory = async (
  query: FilterQuery<Category>,
  options?: QueryOptions
) => {
  return await categoryModel.findOne(query, {}, options);
};

export const updateCategory = async (
  query: FilterQuery<Category>,
  update: UpdateQuery<Category>,
  options: QueryOptions = { lean: true }
) => {
  return await categoryModel.findOneAndUpdate(query, update, options);
};

export const deleteCategory = async (
  query: FilterQuery<Category>,
  options: QueryOptions = { lean: true }
) => {
  return await categoryModel.findOneAndDelete(query, options);
};
