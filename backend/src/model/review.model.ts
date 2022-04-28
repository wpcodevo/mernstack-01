import {
  getModelForClass,
  index,
  modelOptions,
  post,
  pre,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { updateProduct } from '../service/product.service';
import { Product } from './product.model';
import { User } from './user.model';

@index({ product: 1, user: 1 }, { unique: true })
@pre<ModelType<Review>>(/^find/, function (next) {
  this.populate({ path: 'user', select: 'firstName lastName email' });
  next();
})
@pre<ModelType<Review>>(/^findOneAnd/, async function (next) {
  // @ts-ignore
  this.r = await this.clone().findOne();
  next();
})
@post<Review>(/^findOneAnd/, function () {
  // @ts-ignore
  if (!this.r === null) return;
  // @ts-ignore
  this.r.constructor.calculateRating(this.r.product);
})
@post<Review>('save', function (doc) {
  // @ts-ignore
  this.constructor.calculateRating(doc.product);
})
@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
export class Review {
  @prop({ trim: true, minlength: 10 })
  review: string;

  @prop({ min: 1, max: 5, required: true })
  rating: number;

  @prop({ ref: () => User, required: true })
  user: Ref<User>;

  @prop({ ref: () => Product, required: true })
  product: Ref<Product>;

  static async calculateRating(this: ModelType<Review>, productId: string) {
    const stats = await this.aggregate([
      {
        $match: { product: productId },
      },
      {
        $group: {
          _id: '$product',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await updateProduct(
        { _id: productId },
        {
          avgRating: stats[0].avgRating,
          numRating: stats[0].nRating,
        },
        { runValidators: true, new: true, lean: true }
      );
    } else {
      await updateProduct(
        { _id: productId },
        {
          avgRating: 0,
          numRating: 0,
        },
        { runValidators: true, new: true, lean: true }
      );
    }
  }
}

const reviewModel = getModelForClass(Review);
export default reviewModel;
