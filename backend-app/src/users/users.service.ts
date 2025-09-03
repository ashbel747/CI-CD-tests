import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOrCreate(profile: {
    email: string;
    name?: string;
    image?: string;
  }) {
    let user = await this.userModel.findOne({ email: profile.email });
    if (!user) {
      user = await this.userModel.create({
        email: profile.email,
        name: profile.name,
        image: profile.image,
      });
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
