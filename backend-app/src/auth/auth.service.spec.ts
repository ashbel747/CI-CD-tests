import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { ResetToken } from './schemas/reset-token.schema';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';

// Mocking external modules to isolate AuthService
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => 'hashedPassword123'),
  compare: jest.fn(() => true),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4-token'),
}));
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-nanoid-token'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let refreshTokenModel: Model<RefreshToken>;
  let resetTokenModel: Model<ResetToken>;
  let jwtService: JwtService;
  let mailService: MailService;
  let rolesService: RolesService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    select: jest.fn().mockReturnThis(),
    toObject: jest.fn(),
  };

  const mockRefreshTokenModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockResetTokenModel = {
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockRolesService = {
    getRoleByName: jest.fn(),
    getRoleById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(RefreshToken.name), useValue: mockRefreshTokenModel },
        { provide: getModelToken(ResetToken.name), useValue: mockResetTokenModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    refreshTokenModel = module.get<Model<RefreshToken>>(getModelToken(RefreshToken.name));
    resetTokenModel = module.get<Model<ResetToken>>(getModelToken(ResetToken.name));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    rolesService = module.get<RolesService>(RolesService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = { name: 'Test User', email: 'test@example.com', password: 'password123', role: 'user' };
    const roleDoc = { _id: 'mockRoleId', name: 'user' };

    it('should successfully create a new user', async () => {
      // Mock dependencies to return successful values
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);
      (mockRolesService.getRoleByName as jest.Mock).mockResolvedValue(roleDoc);
      (mockUserModel.create as jest.Mock).mockResolvedValue({
        ...signupDto,
        toObject: () => ({ ...signupDto, _id: 'userId123' }),
      });

      const result = await service.signup(signupDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: signupDto.email });
      expect(mockRolesService.getRoleByName).toHaveBeenCalledWith(signupDto.role.toLowerCase());
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: signupDto.name,
        email: signupDto.email,
        password: 'hashedPassword123',
        roleId: 'mockRoleId',
        role: signupDto.role.toLowerCase(),
      });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if email is already in use', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue({ email: signupDto.email });

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
      await expect(service.signup(signupDto)).rejects.toThrow('Email already in use');
    });

    it('should throw BadRequestException if role is invalid', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);
      (mockRolesService.getRoleByName as jest.Mock).mockResolvedValue(null);

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
      await expect(service.signup(signupDto)).rejects.toThrow('Invalid role specified');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockUser = { _id: 'userId123', password: 'hashedPassword123', role: 'user' };

    it('should successfully log in a user and return tokens', async () => {
      // Mock dependencies
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service, 'generateUserTokens').mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

      const result = await service.login(loginDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(service.generateUserTokens).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh', userId: mockUser._id, role: mockUser.role });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Wrong credentials');
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Wrong credentials');
    });
  });

  describe('changePassword', () => {
    const userId = 'userId123';
    const oldPassword = 'oldPassword';
    const newPassword = 'newPassword';
    const initialPassword = 'hashedPassword'; // Store the initial password

    const mockUser = {
      _id: userId,
      password: initialPassword,
      save: jest.fn(() => Promise.resolve()),
    };

    it('should successfully change the user password', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      // The bcrypt mock is global, but we can confirm the hash input
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(userId, oldPassword, newPassword);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      // Now we assert against the initial password, not the mutated object.
      expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, initialPassword); 
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUser.password).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(NotFoundException);
      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow('User not found...');
    });

    it('should throw UnauthorizedException if old password is wrong', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(UnauthorizedException);
      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow('Wrong credentials');
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const mockUser = { _id: 'userId123' };

    it('should generate a reset token and send an email if user exists', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.forgotPassword(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockResetTokenModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser._id, token: 'mock-nanoid-token' }),
      );
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, 'mock-nanoid-token');
      expect(result).toEqual({ message: 'If this user exists, they will receive an email' });
    });

    it('should return a success message without doing anything if user does not exist', async () => {
      (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockResetTokenModel.create).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'If this user exists, they will receive an email' });
    });
  });

  describe('resetPassword', () => {
    const newPassword = 'newPassword123';
    const resetToken = 'mock-nanoid-token';
    const mockTokenDoc = { userId: 'userId123' };
    const mockUser = { password: 'oldPassword', save: jest.fn() };

    it('should successfully reset the password with a valid token', async () => {
      (mockResetTokenModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockTokenDoc);
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.resetPassword(newPassword, resetToken);

      expect(mockResetTokenModel.findOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({ token: resetToken }));
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockTokenDoc.userId);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUser.password).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token is invalid or expired', async () => {
      (mockResetTokenModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword(newPassword, resetToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.resetPassword(newPassword, resetToken)).rejects.toThrow('Invalid link');
    });

    it('should throw InternalServerErrorException if user is not found', async () => {
      (mockResetTokenModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockTokenDoc);
      (mockUserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword(newPassword, resetToken)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('refreshTokens', () => {
    const refreshToken = 'mock-uuid-v4-token';
    const mockTokenDoc = { userId: 'userId123' };

    it('should successfully refresh tokens', async () => {
      (mockRefreshTokenModel.findOne as jest.Mock).mockResolvedValue(mockTokenDoc);
      jest.spyOn(service, 'generateUserTokens').mockResolvedValue({ accessToken: 'newAccess', refreshToken: 'newRefresh' });

      const result = await service.refreshTokens(refreshToken);

      expect(mockRefreshTokenModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ token: refreshToken }));
      expect(service.generateUserTokens).toHaveBeenCalledWith(mockTokenDoc.userId);
      expect(result).toEqual({ accessToken: 'newAccess', refreshToken: 'newRefresh' });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      (mockRefreshTokenModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Refresh Token is invalid');
    });
  });

  describe('generateUserTokens', () => {
    const userId = 'userId123';
    const mockUser = { _id: userId, role: 'user' };

    it('should generate and store access and refresh tokens', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.sign as jest.Mock).mockReturnValue('mockedAccessToken');
      jest.spyOn(service, 'storeRefreshToken').mockResolvedValue(undefined);

      const result = await service.generateUserTokens(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId, role: mockUser.role }, expect.objectContaining({ expiresIn: '10h' }));
      expect(service.storeRefreshToken).toHaveBeenCalledWith('mock-uuid-v4-token', userId);
      expect(result).toEqual({ accessToken: 'mockedAccessToken', refreshToken: 'mock-uuid-v4-token' });
    });
  });

  describe('getUserPermissions', () => {
    const userId = 'userId123';
    const mockUser = { _id: userId, roleId: 'roleId123' };
    const mockRole = { permissions: ['read', 'write'] };

    it('should return user permissions', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockRolesService.getRoleById as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.getUserPermissions(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockRolesService.getRoleById).toHaveBeenCalledWith(mockUser.roleId.toString());
      expect(result).toEqual(mockRole.permissions);
    });

    it('should throw BadRequestException if user is not found', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserPermissions(userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserProfile', () => {
    const userId = 'userId123';
    const mockUser = { _id: userId, name: 'Test User', email: 'test@example.com' };

    it('should return the user profile with password excluded', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockUserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await service.getUserProfile(userId);
      
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user is not found', async () => {
      (mockUserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      await expect(service.getUserProfile(userId)).rejects.toThrow(NotFoundException);
      await expect(service.getUserProfile(userId)).rejects.toThrow('User not found');
    });
  });
});
