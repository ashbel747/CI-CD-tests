import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto, UserRole } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mocked AuthService methods
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, // use mocked service
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should call authService.signup with correct DTO and return result', async () => {
      const dto: SignupDto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
        role: UserRole.BUYER,
      };
      const mockResponse = { success: true, message: 'User created', user: { id: '1', name: 'Alice' } };
      mockAuthService.signup.mockResolvedValue(mockResponse);

      const result = await authController.signUp(dto);
      expect(authService.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct credentials and return result', async () => {
      const dto: LoginDto = { email: 'alice@example.com', password: 'password123' };
      const mockResponse = { accessToken: 'token', refreshToken: 'refresh', userId: '1' };
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await authController.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with correct token and return result', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'refresh-token' };
      const mockResponse = { accessToken: 'newToken', refreshToken: 'newRefresh' };
      mockAuthService.refreshTokens.mockResolvedValue(mockResponse);

      const result = await authController.refreshTokens(dto);
      expect(authService.refreshTokens).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with correct params', async () => {
      const dto: ChangePasswordDto = { oldPassword: 'old', newPassword: 'new' };
      const req = { userId: '1' };
      mockAuthService.changePassword.mockResolvedValue({ success: true });

      const result = await authController.changePassword(dto, req);
      expect(authService.changePassword).toHaveBeenCalledWith(req.userId, dto.oldPassword, dto.newPassword);
      expect(result).toEqual({ success: true });
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct email', async () => {
      const dto = { email: 'alice@example.com' };
      const mockResponse = { message: 'Email sent' };
      mockAuthService.forgotPassword.mockResolvedValue(mockResponse);

      const result = await authController.forgotPassword(dto);
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct params', async () => {
      const dto = { newPassword: 'newPass', resetToken: 'token123' };
      const mockResponse = { success: true };
      mockAuthService.resetPassword.mockResolvedValue(mockResponse);

      const result = await authController.resetPassword(dto);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto.newPassword, dto.resetToken);
      expect(result).toEqual(mockResponse);
    });
  });
});
