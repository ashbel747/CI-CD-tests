import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const newNotification = new this.notificationModel({
      userId: new Types.ObjectId(createDto.userId),
      message: createDto.message,
    });
    return newNotification.save();
  }

  async findByUser(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async update(id: string, updateDto: UpdateNotificationDto) {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async remove(id: string) {
    const notification = await this.notificationModel.findByIdAndDelete(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }
}
