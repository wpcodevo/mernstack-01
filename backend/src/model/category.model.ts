import {
  getModelForClass,
  modelOptions,
  pre,
  prop,
  Severity,
} from '@typegoose/typegoose';
import slugify from 'slugify';

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
@pre<Category>('save', function () {
  this.slug = slugify(this.name, { lower: true });
})
export class Category {
  @prop({ unique: true, required: true })
  name: string;

  @prop()
  slug: string;

  @prop()
  description?: string;

  @prop()
  image: string;

  @prop({ required: true })
  subcategories?: string[];
}

const categoryModel = getModelForClass(Category);

export default categoryModel;
