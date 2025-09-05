// Mock ALL imports BEFORE any real imports to prevent dependency loading
jest.mock('./auth.service', () => ({
  AuthService: class MockAuthService {
    signup = jest.fn();
    login = jest.fn();
    refreshTokens = jest.fn();
    changePassword = jest.fn();
    getUserProfile = jest.fn();
    forgotPassword = jest.fn();
    resetPassword = jest.fn();
  },
}));

jest.mock('../guards/authentication.guard', () => ({
  AuthenticationGuard: class MockAuthGuard {
    canActivate = jest.fn(() => true);
  },
}));

// Now safe to import
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticationGuard } from '../guards/authentication.guard';

describe('AuthController - Completely Isolated', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            refreshTokens: jest.fn(),
            changePassword: jest.fn(),
            getUserProfile: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(AuthenticationGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic setup test
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });

  // Test signup endpoint
  describe('signUp', () => {
    it('should call authService.signup and return success result', async () => {
      // Arrange
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
      };

      const mockResult = {
        success: true,
        message: 'User created successfully',
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      };

      authService.signup.mockResolvedValue(mockResult);

      // Act
      const result = await controller.signUp(signupDto);

      // Assert
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(authService.signup).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate signup errors', async () => {
      // Arrange
      const signupDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
      };

      const error = new Error('Email already in use');
      authService.signup.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signupDto)).rejects.toThrow('Email already in use');
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  // Test login endpoint
  describe('login', () => {
    it('should call authService.login and return tokens', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-uuid',
        userId: '507f1f77bcf86cd799439011',
        role: 'user'
      };

      authService.login.mockResolvedValue(mockResult);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should propagate login errors', async () => {
      // Arrange
      const loginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const error = new Error('Wrong credentials');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow('Wrong credentials');
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  // Test refresh tokens endpoint
  describe('refreshTokens', () => {
    it('should extract token from DTO and call authService.refreshTokens', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token-uuid'
      };

      const mockResult = {
        accessToken: 'new-jwt-token',
        refreshToken: 'new-refresh-uuid'
      };

      authService.refreshTokens.mockResolvedValue(mockResult);

      // Act
      const result = await controller.refreshTokens(refreshTokenDto);

      // Assert
      expect(authService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token-uuid');
      expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should handle invalid refresh token', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'invalid-token'
      };

      const error = new Error('Refresh Token is invalid');
      authService.refreshTokens.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshTokens(refreshTokenDto)).rejects.toThrow('Refresh Token is invalid');
      expect(authService.refreshTokens).toHaveBeenCalledWith('invalid-token');
    });
  });

  // Test change password endpoint (protected route)
  describe('changePassword', () => {
    it('should extract userId from request and call authService.changePassword', async () => {
      // Arrange
      const changePasswordDto = {
        oldPassword: 'currentPass123',
        newPassword: 'newSecurePass456'
      };

      const mockReq = { userId: '507f1f77bcf86cd799439011' };

      // changePassword returns void (no return value)
      authService.changePassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.changePassword(changePasswordDto, mockReq);

      // Assert
      expect(authService.changePassword).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'currentPass123',
        'newSecurePass456'
      );
      expect(authService.changePassword).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle wrong current password', async () => {
      // Arrange
      const changePasswordDto = {
        oldPassword: 'wrongCurrentPass',
        newPassword: 'newPass456'
      };

      const mockReq = { userId: '507f1f77bcf86cd799439011' };

      const error = new Error('Wrong credentials');
      authService.changePassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.changePassword(changePasswordDto, mockReq))
        .rejects.toThrow('Wrong credentials');
      
      expect(authService.changePassword).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'wrongCurrentPass',
        'newPass456'
      );
    });
  });

  // Test get user profile endpoint (protected route)
  describe('getMe', () => {
    it('should extract userId from request and return user profile', async () => {
      // Arrange
      const mockReq = { userId: '507f1f77bcf86cd799439011' };
      
      const mockUserProfile = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
        // Note: password should be excluded by the service
      };

      authService.getUserProfile.mockResolvedValue(mockUserProfile);

      // Act
      const result = await controller.getMe(mockReq);

      // Assert
      expect(authService.getUserProfile).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(authService.getUserProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserProfile);
    });

    it('should handle user not found', async () => {
      // Arrange
      const mockReq = { userId: 'nonexistent-user-id' };

      const error = new Error('User not found');
      authService.getUserProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getMe(mockReq)).rejects.toThrow('User not found');
      expect(authService.getUserProfile).toHaveBeenCalledWith('nonexistent-user-id');
    });
  });

  // Test forgot password endpoint (we'll skip implementation details)
  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with email', async () => {
      // Arrange
      const forgotPasswordDto = {
        email: 'test@example.com'
      };

      const mockResult = {
        message: 'If this user exists, they will receive an email'
      };

      authService.forgotPassword.mockResolvedValue(mockResult);

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  // Test reset password endpoint (we'll skip implementation details)
  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct parameters', async () => {
      // Arrange
      const resetPasswordDto = {
        newPassword: 'newSecurePassword123',
        resetToken: 'valid-reset-token'
      };

      // resetPassword returns void
      authService.resetPassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.resetPassword(resetPasswordDto);

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'newSecurePassword123',
        'valid-reset-token'
      );
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle invalid reset token', async () => {
      // Arrange
      const resetPasswordDto = {
        newPassword: 'newPassword123',
        resetToken: 'invalid-reset-token'
      };

      const error = new Error('Invalid link');
      authService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid link');
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'newPassword123',
        'invalid-reset-token'
      );
    });
  });

  // Test that the controller properly integrates with guards
  describe('Authentication Guard Integration', () => {
    it('should be properly set up for testing', () => {
      // This test just verifies our test setup is correct
      expect(controller).toBeDefined();
      expect(authService).toBeDefined();
      
      // Verify all service methods are mocked
      expect(typeof authService.signup).toBe('function');
      expect(typeof authService.login).toBe('function');
      expect(typeof authService.refreshTokens).toBe('function');
      expect(typeof authService.changePassword).toBe('function');
      expect(typeof authService.getUserProfile).toBe('function');
    });
  });
});