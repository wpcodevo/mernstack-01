import {
  getModelForClass,
  modelOptions,
  post,
  pre,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { IOrderItem } from '../service/order.service';
import { updateProduct } from '../service/product.service';
import productModel, { Product } from './product.model';
import { User } from './user.model';

class OrderItem {
  @prop({ ref: () => Product })
  product: Ref<Product>;

  @prop()
  quantity: number;
}

class ShippingAddress {
  @prop({ required: true })
  address: string;
  @prop()
  address2?: string;
  @prop({ required: true })
  city: string;
  @prop({ required: true })
  zipCode: string;
  @prop({ required: true })
  country: string;
}

class PaymentResult {
  @prop()
  id: string;
  @prop()
  status: string;
  @prop()
  update_time: string;
  @prop()
  email_address: string;
}

@pre<ModelType<Order>>(/^find/, function () {
  this.populate({ path: 'user' });
})
@pre<ModelType<Order>>(/^findOneAnd/, async function (next) {
  // @ts-ignore
  this.order = await this.clone().findOne();
  // @ts-ignore
  if (this.order) {
    await Promise.all(
      // @ts-ignore
      this.order.orderItems?.map(async (item: IOrderItem) => {
        const product = await productModel.findById(item._id);
        if (product) {
          await productModel.updateOne(
            { _id: item._id },
            { countInStock: product.countInStock + item.quantity },
            { lean: true, new: true }
          );
        }
      })
    );
  }

  next();
})
@post<Order>(/^findOneAndUpdate/, function (doc) {
  // @ts-ignore
  if (this.order === null) return;
  // @ts-ignore
  this.order.constructor.updateProductQuantity(doc.orderItems);
})
@post<Order>('save', function (doc) {
  // @ts-ignore
  this.constructor.updateProductQuantity(doc.orderItems);
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
export class Order {
  @prop({ ref: User, required: true })
  user: Ref<User>;

  @prop()
  orderItems: OrderItem[];

  @prop()
  totalQuantity: number;

  @prop()
  shippingAddress: ShippingAddress;

  @prop()
  paymentMethod: string;

  @prop()
  paymentResult: PaymentResult;

  @prop({ default: 0.0, set: (val) => Math.round(val * 10) / 10 })
  taxPrice: number;

  @prop({ default: 0.0, set: (val) => Math.round(val * 10) / 10 })
  shippingPrice: number;

  @prop({ default: 0.0, set: (val) => Math.round(val * 10) / 10 })
  itemsTotalPrice: number;

  @prop({ default: 0.0, set: (val) => Math.round(val * 10) / 10 })
  totalAmount: number;

  @prop({ default: false })
  isPaid: boolean;

  @prop()
  paidAt: Date;

  @prop({ default: false })
  isDelivered: boolean;

  @prop()
  deliveredAt: Date;

  static async updateProductQuantity(
    this: ModelType<Order>,
    orderItems: IOrderItem[]
  ) {
    orderItems.map(async (item) => {
      const productInDB = await productModel.findById(item._id).lean();
      if (productInDB) {
        await updateProduct(
          { _id: item._id },
          { countInStock: productInDB?.countInStock - item.quantity },
          { lean: true }
        );
      }
    });
  }
}

const orderModel = getModelForClass(Order);
export default orderModel;
