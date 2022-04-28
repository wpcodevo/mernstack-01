import productModel, { Product } from '../model/product.model';
import { FilterQuery, QueryOptions, UpdateQuery, Types } from 'mongoose';

export const createProduct = async (
  input: Partial<Omit<Product, 'category'>> & { category: string }
) => {
  const product = {
    category: new Types.ObjectId(input.category),
  };
  return await productModel.create({ ...input, ...product });
};

export const getProduct = async (
  query: FilterQuery<Product>,
  options: QueryOptions = { lean: true }
) => {
  return await productModel
    .findOne(query, {}, options)
    .populate({ path: 'reviews' });
};

export const updateProduct = async (
  query: FilterQuery<Product>,
  update: UpdateQuery<Product>,
  options: QueryOptions
) => {
  return await productModel.findOneAndUpdate(query, update, options);
};

export const deleteProduct = async (
  query: FilterQuery<Product>,
  options: QueryOptions = { lean: true }
) => {
  return await productModel.findOneAndDelete(query, options);
};
