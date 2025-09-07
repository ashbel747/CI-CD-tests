import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';
import { Product } from '../../products/entities/product.entity'; // Import Product

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  roleId: Types.ObjectId;

  @Prop({ required: true, enum: ['buyer', 'seller'] })
  role: string;

  // Cart array for transactional items
  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    default: [],
  })
  cart: { productId: string; quantity: number }[];

  // 🆕 Wishlist array for favorited products
  @Prop({
    type: [{ type: Types.ObjectId, ref: Product.name }],
    default: [],
  })
  wishlist: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
