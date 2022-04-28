export interface ICategory {
  _id: string;
  name: string;
  id: string;
  description: string;
  image: string;
}

export interface ICategoryRequest {
  name: string;
  description: string;
  image: string;
}
