import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string; // ✅ added reviewer’s name

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  initialPrice: number;

  @Prop({ required: true })
  discountPercent: number;

  @Prop()
  discountedPrice: number;

  @Prop()
  image: string;

  @Prop({ required: true })
  niche: string; // e.g. "living room", "kitchen"

  @Prop({ required: true })
  category: string; // e.g. "top-picks", "top-selling"

  @Prop({ required: true })
  createdBy: string; // store seller userId

  // ✅ reviews now include `name`
  @Prop({
    type: [
      {
        userId: String,
        name: String,
        comment: String,
        rating: Number,
        createdAt: Date,
      },
    ],
    default: [],
  })
  reviews: Review[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Auto-calculate discounted price before saving
ProductSchema.pre<Product>('save', function (next) {
  if (this.initialPrice && this.discountPercent) {
    this.discountedPrice =
      this.initialPrice - (this.discountPercent / 100) * this.initialPrice;
  }
  next();
});
