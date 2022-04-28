import { ICategory } from '../category/types';

export interface ICreateProduct {
  name: string;
  price: number;
  description: string;
  countInStock: number;
  imageCover: string;
  images?: string[];
  category: string;
}

export interface ICartItem extends IProduct {
  numQuantity: number;
}

export interface IProduct {
  _id: string;
  name: string;
  avgRating: number;
  numRating: number;
  price: number;
  description: string;
  countInStock: number;
  quantity?: number;
  imageCover: string;
  images: string[];
  category: ICategory;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  id: string;
}
