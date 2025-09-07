import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Types } from 'mongoose';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
            findByUser: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  // Helper to generate a mock Notification, cast as any to weaken type checking
  function createMockNotification(
    override?: Partial<any>,
  ): any {
    return {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      message: 'Default message',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...override,
    };
  }

  it('should create a notification', async () => {
    const userId = new Types.ObjectId();
    const dto = { userId: userId.toHexString(), message: 'Hello' };
    const mockNotification = createMockNotification({
      userId,
      message: dto.message,
      read: false,
    });

    jest.spyOn(service, 'create').mockResolvedValue(mockNotification);

    const result = await controller.create(dto);
    expect(result).toEqual(mockNotification);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return notifications for a user', async () => {
    const userId = new Types.ObjectId();
    const mockNotifications = [
      createMockNotification({ userId, message: 'Test 1' }),
      createMockNotification({ userId, message: 'Test 2' }),
    ];

    jest.spyOn(service, 'findByUser').mockResolvedValue(mockNotifications);

    const result = await controller.findByUser(userId.toHexString());
    expect(result).toEqual(mockNotifications);
    expect(service.findByUser).toHaveBeenCalledWith(userId.toHexString());
  });

  it('should update a notification', async () => {
    const notificationId = new Types.ObjectId().toHexString();
    const updatedMessage = 'Updated message';

    const mockNotification = createMockNotification({
      _id: new Types.ObjectId(notificationId),
      message: updatedMessage,
      read: true,
    });

    jest.spyOn(service, 'update').mockResolvedValue(mockNotification);

    const result = await controller.update(notificationId, { message: updatedMessage });
    expect(result).toEqual(mockNotification);
    expect(service.update).toHaveBeenCalledWith(notificationId, { message: updatedMessage });
  });

  it('should delete a notification', async () => {
    const notificationId = new Types.ObjectId().toHexString();

    const mockNotification = createMockNotification({
      _id: new Types.ObjectId(notificationId),
      message: 'Deleted',
      read: true,
    });

    jest.spyOn(service, 'remove').mockResolvedValue(mockNotification);

    const result = await controller.remove(notificationId);
    expect(result).toEqual(mockNotification);
    expect(service.remove).toHaveBeenCalledWith(notificationId);
  });
});
