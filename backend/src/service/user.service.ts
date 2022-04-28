import userModel, { User } from '../model/user.model';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export const createUser = async (input: Partial<User>) => {
  return await userModel.create(input);
};

export const findUser = async (
  query: FilterQuery<User>,
  options?: QueryOptions
) => {
  return await userModel
    .findOne(query, {}, options)
    .select('+verified +password');
};

export const findUserByEmail = async ({ email }: { email: string }) => {
  return await userModel.findOne({ email }).select('+verified +password');
};

export const findAndUpdateUser = async (
  query: FilterQuery<User>,
  update: UpdateQuery<User>,
  options: QueryOptions
) => {
  return await userModel.findOneAndUpdate(query, update, options);
};

export const adminFindUserById = async (id: string) => {
  return await userModel.findById(id).select('+active +verified');
};

export const findUserByIdAndDelete = async (id: string) => {
  return await userModel.findByIdAndDelete(id).lean();
};
