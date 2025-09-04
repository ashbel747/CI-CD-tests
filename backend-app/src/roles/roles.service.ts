import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dtos/role.dto';
import { Resource } from './enums/resource.enum';
import { Action } from './enums/action.enum';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(@InjectModel(Role.name) private RoleModel: Model<Role>) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  async createRole(role: CreateRoleDto) {
    //TODO: Validate unique names
    return this.RoleModel.create(role);
  }

  async getRoleById(roleId: string) {
    return this.RoleModel.findById(roleId);
  }

  async getRoleByName(roleName: string) {
    return this.RoleModel.findOne({ name: roleName });
  }

  async seedRoles() {
    try {
      // Check if roles already exist
      const existingRoles = await this.RoleModel.countDocuments();
      if (existingRoles > 0) {
        this.logger.log('Roles already exist, skipping seed');
        return;
      }

      // Create Buyer Role
      const buyerRole = {
        name: 'buyer',
        permissions: [
          {
            resource: Resource.products,
            actions: [Action.read],
          },
          {
            resource: Resource.orders,
            actions: [Action.create, Action.read],
          },
          {
            resource: Resource.profiles,
            actions: [Action.read, Action.update],
          },
        ],
      };

      // Create Seller Role
      const sellerRole = {
        name: 'seller',
        permissions: [
          {
            resource: Resource.products,
            actions: [Action.create, Action.read, Action.update, Action.delete],
          },
          {
            resource: Resource.listings,
            actions: [Action.create, Action.read, Action.update, Action.delete],
          },
          {
            resource: Resource.orders,
            actions: [Action.read],
          },
          {
            resource: Resource.profiles,
            actions: [Action.read, Action.update],
          },
          {
            resource: Resource.users,
            actions: [Action.read],
          },
        ],
      };

      // Insert roles into database
      await this.RoleModel.insertMany([buyerRole, sellerRole]);
      this.logger.log('Default roles seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding roles:', error);
    }
  }
}
