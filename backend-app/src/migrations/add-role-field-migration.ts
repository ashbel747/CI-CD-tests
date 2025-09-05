// src/migrations/add-role-field-migration.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AddRoleFieldMigration {
  private readonly logger = new Logger(AddRoleFieldMigration.name);

  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private rolesService: RolesService,
  ) {}

  async run() {
    this.logger.log('Starting migration: Adding role field to existing users');

    try {
      // Find all users that don't have the role field
      const usersWithoutRole = await this.UserModel.find({
        role: { $exists: false },
      });

      this.logger.log(
        `Found ${usersWithoutRole.length} users without role field`,
      );

      if (usersWithoutRole.length === 0) {
        this.logger.log('No users need migration');
        return;
      }

      // Update each user
      for (const user of usersWithoutRole) {
        try {
          // Get the role document to extract the role name
          const roleDocument = await this.rolesService.getRoleById(
            user.roleId.toString(),
          );

          if (roleDocument) {
            // Update user with role name
            await this.UserModel.updateOne(
              { _id: user._id },
              { $set: { role: roleDocument.name } },
            );

            this.logger.log(
              `Updated user ${user.email} with role: ${roleDocument.name}`,
            );
          } else {
            this.logger.warn(
              `Role not found for user ${user.email}, roleId: ${user.roleId}`,
            );
          }
        } catch (error) {
          this.logger.error(`Failed to update user ${user.email}:`, error);
        }
      }

      this.logger.log('Migration completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  // Alternative: Bulk update approach (faster for many users)
  async runBulk() {
    this.logger.log(
      'Starting bulk migration: Adding role field to existing users',
    );

    try {
      // Get all roles for mapping
      const buyerRole = await this.rolesService.getRoleByName('buyer');
      const sellerRole = await this.rolesService.getRoleByName('seller');

      if (!buyerRole || !sellerRole) {
        throw new Error('Required roles not found in database');
      }

      // Bulk update buyers
      const buyerUpdateResult = await this.UserModel.updateMany(
        { roleId: buyerRole._id, role: { $exists: false } },
        { $set: { role: 'buyer' } },
      );

      // Bulk update sellers
      const sellerUpdateResult = await this.UserModel.updateMany(
        { roleId: sellerRole._id, role: { $exists: false } },
        { $set: { role: 'seller' } },
      );

      this.logger.log(`Updated ${buyerUpdateResult.modifiedCount} buyers`);
      this.logger.log(`Updated ${sellerUpdateResult.modifiedCount} sellers`);
      this.logger.log('Bulk migration completed successfully');
    } catch (error) {
      this.logger.error('Bulk migration failed:', error);
      throw error;
    }
  }
}
