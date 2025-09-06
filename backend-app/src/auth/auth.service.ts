import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {}

  async signup(signupData: SignupDto) {
    const { email, password, name, role } = signupData;

    // Check if email is in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    // eslint-disable-next-line prettier/prettier
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the role document by name
    const roleDocument = await this.rolesService.getRoleByName(
      role.toLowerCase(),
    );
    if (!roleDocument) {
      throw new BadRequestException('Invalid role specified');
    }

    // Create user document and save in MongoDB
    const createdUser = await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      roleId: roleDocument._id,
      role: role.toLowerCase(), // Store role name for quick access
    });

    // Return safe user info (exclude password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userSafe } = createdUser.toObject();

    return {
      success: true,
      message: 'User created successfully',
      user: userSafe,
    };
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      role: user.role, // Include role in login response
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    // Include role in JWT payload for authorization
    const user = await this.UserModel.findById(userId);
    const accessToken = this.jwtService.sign(
      {
        userId,
        role: user.role,
      },
      { expiresIn: '10h' },
    )
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);
    console.log('Found user:', user);

    if (!user) throw new BadRequestException();

    console.log('User roleId:', user.roleId);
    const role = await this.rolesService.getRoleById(user.roleId.toString());
    console.log('Found role:', role);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return role.permissions;
  }

  async getUserProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select('-password -__v'); // exclude password
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user; // Now includes the role field automatically
  }

  async updateUserProfile(userId: string, updateData: UpdateUserDto) {
  const user = await this.UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (updateData.name) {
    user.name = updateData.name;
  }

  if (updateData.email) {
    // Check if email is already taken by another user
    const emailInUse = await this.UserModel.findOne({ email: updateData.email, _id: { $ne: userId } });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    user.email = updateData.email;
  }

  if (updateData.role) {
    user.role = updateData.role;
  }

  await user.save();

  // Exclude sensitive fields before returning
  const { password, __v, ...safeUser } = user.toObject();
  return {
    success: true,
    message: 'Profile updated successfully',
    user: safeUser,
  };
}
}