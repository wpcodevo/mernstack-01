import { IShippingAddress } from '../../../pages/Checkout/shipping-address.page';
import { IProduct } from '../products/types';

interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
}

export interface IOrderPaidRequest {
  id: string;
  status: string;
  update_time: string;
  payer: {
    email_address: string;
  };
}

export interface IOrder {
  user: IUser;
  orderItems: IProduct[];
  totalQuantity: number;
  shippingAddress: IShippingAddressResponse;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  itemsTotalPrice: number;
  totalAmount: number;
  isPaid: boolean;
  isDelivered: boolean;
  _id: string;
  __v: number;
  deliveredAt: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingAddressResponse {
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  shippingAddress: IShippingAddress;
  totalAmount: number;
  orderItems: IProduct[];
  paymentMethod: string;
  itemsTotalPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalQuantity: number;
}

export interface IOrderResponse {
  status: string;
  data: {
    order: IOrder;
  };
}
