import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let model: Model<Notification>;

  // Mock a single notification document
  const mockNotificationDoc: any = {
    _id: new Types.ObjectId('60c72b2f9b1e8e001c9c4b7c'),
    userId: new Types.ObjectId('60c72b2f9b1e8e001c9c4b7b'),
    message: 'Test message',
    read: false, // ✅ matches schema
    save: jest.fn(),
  };

  // Make save resolve to the same document
  mockNotificationDoc.save.mockResolvedValue(mockNotificationDoc);

  // Mock model constructor
  const mockNotificationModel: any = jest.fn(() => mockNotificationDoc);

  // Attach static methods
  Object.assign(mockNotificationModel, {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockNotificationDoc]),
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockNotificationDoc),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockNotificationDoc),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    model = module.get<Model<Notification>>(getModelToken(Notification.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const createDto: CreateNotificationDto = {
        userId: '60c72b2f9b1e8e001c9c4b7b',
        message: 'Test message',
      };

      const result = await service.create(createDto);

      expect(mockNotificationModel).toHaveBeenCalledWith({
        userId: new Types.ObjectId(createDto.userId),
        message: createDto.message,
      });
      expect(mockNotificationDoc.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotificationDoc);
    });
  });

  describe('findByUser', () => {
    it('should return all notifications for a user', async () => {
      const userId = '60c72b2f9b1e8e001c9c4b7b';
      const result = await service.findByUser(userId);

      expect(result).toEqual([mockNotificationDoc]);
      expect(model.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(model.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const id = '60c72b2f9b1e8e001c9c4b7c';
      const updateDto: UpdateNotificationDto = { read: true };

      const result = await service.update(id, updateDto);

      expect(result).toEqual(mockNotificationDoc);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(id, updateDto, {
        new: true,
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      await expect(
        service.update('non-existent-id', { read: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      const id = '60c72b2f9b1e8e001c9c4b7c';
      const result = await service.remove(id);

      expect(result).toEqual(mockNotificationDoc);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if notification not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
