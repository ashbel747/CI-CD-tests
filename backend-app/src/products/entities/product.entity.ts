import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

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

