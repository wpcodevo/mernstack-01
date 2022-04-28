import {
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import slugify from 'slugify';
import { Category } from './category.model';

@index({ price: 1, ratingsAverage: 1 })
@pre<ModelType<Product>>(/^find/, function () {
  this.populate({ path: 'category' });
})
@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@pre<Product>('save', function () {
  this.slug = slugify(this.name, { lower: true });
})
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Product {
  @prop({ required: true, unique: true, minLength: 10 })
  name: string;

  @prop({ lowercase: true })
  slug: string;

  @prop({
    min: 0,
    max: 5,
    default: 0,
    set: (val) => Math.round(val * 10) / 10,
  })
  avgRating?: number;

  @prop({ default: 0 })
  numRating?: number;

  @prop({ required: true })
  price: number;

  @prop({ trim: true })
  description?: string;

  @prop({ required: true, min: 0, default: 1 })
  countInStock: number;

  @prop({ required: true })
  imageCover: string;

  @prop()
  images?: string[];

  @prop({ ref: () => Category, required: true })
  category: Ref<Category>;

  @prop({
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
  })
  get reviews() {
    return undefined;
  }
}

const productModel = getModelForClass(Product);

export default productModel;
