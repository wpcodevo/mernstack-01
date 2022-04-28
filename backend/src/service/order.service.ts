import { Types, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import orderModel, { Order } from '../model/order.model';

export interface IOrderItem {
  _id: string;
  name: string;
  avgRating: number;
  numRating: number;
  price: number;
  description: string;
  countInStock: number;
  quantity: number;
  imageCover: string;
  images: string[];
  slug: string;
}

export const createOrder = async (
  input: Partial<Omit<Order, 'orderItems'> & { orderItems: IOrderItem[] }>
) => {
  const orderItems = input.orderItems?.map((el) => ({
    ...el,
    _id: new Types.ObjectId(el._id),
  }));

  return await orderModel.create({ ...input, orderItems });
};

export const getMyOrders = async (
  query: FilterQuery<Order>,
  options: QueryOptions = { lean: true }
) => {
  return await orderModel.find(query, {}, options);
};

export const findOrder = async (
  query: FilterQuery<Order>,
  options: QueryOptions = {}
) => {
  return await orderModel.findOne(query, {}, options);
};

export const findOrderById = async (id: string) => {
  return await orderModel.findById(id);
};

export const updateOrder = async (
  query: FilterQuery<Order>,
  update: UpdateQuery<Order>,
  options: QueryOptions = {}
) => {
  return await orderModel.findOneAndUpdate(query, update, options);
};

export const deleteOrder = async (id: string, options: QueryOptions = {}) => {
  return await orderModel.findByIdAndDelete(id, options);
};
