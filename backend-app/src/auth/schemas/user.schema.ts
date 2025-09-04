import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema'; // import Role schema

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  roleId: Types.ObjectId; // Keep for permissions lookup

  @Prop({ required: true, enum: ['buyer', 'seller'] })
  role: string; // Add for quick access
}

export const UserSchema = SchemaFactory.createForClass(User);
