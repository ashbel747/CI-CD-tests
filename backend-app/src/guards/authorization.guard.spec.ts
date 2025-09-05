import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { AuthorizationGuard } from './authorization.guard';
import { PERMISSIONS_KEY } from 'src/decorators/decorator';
import { Permission } from 'src/roles/dtos/role.dto';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let reflector: Reflector;
  let authService: AuthService;

  const mockAuthService = {
    getUserPermissions: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        userId: 'someUserId',
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationGuard,
        Reflector,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<AuthorizationGuard>(AuthorizationGuard);
    reflector = module.get<Reflector>(Reflector);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no permissions are required for the route', async () => {
      // Mock the reflector to return null, simulating no permissions required
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      // eslint-disable-next-line prettier/prettier
      const result = await guard.canActivate(mockExecutionContext as unknown as ExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
        // eslint-disable-next-line prettier/prettier
        mockExecutionContext.getHandler(),
       mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return true if the user has all the required permissions', async () => {
      const requiredPermissions: Permission[] = [
        { resource: 'users', actions: ['read', 'write'] },
      ];
      const userPermissions: Permission[] = [
        { resource: 'users', actions: ['read', 'write', 'delete'] },
      ];

      // eslint-disable-next-line prettier/prettier
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);
      mockAuthService.getUserPermissions.mockResolvedValue(userPermissions);

      // eslint-disable-next-line prettier/prettier
      const result = await guard.canActivate(mockExecutionContext as unknown as ExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
        // eslint-disable-next-line prettier/prettier
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(mockAuthService.getUserPermissions).toHaveBeenCalledWith('someUserId');
      expect(result).toBe(true);
    });
    
    it('should throw UnauthorizedException if userId is not present in the request', async () => {
      // Mock the request to have no userId
      const mockRequest = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      };
      // eslint-disable-next-line prettier/prettier
      await expect(guard.canActivate(mockRequest as unknown as ExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if the user is missing a required resource', async () => {
      // eslint-disable-next-line prettier/prettier
      const requiredPermissions: Permission[] = [{ resource: 'users', actions: ['read'] }];
      const userPermissions: Permission[] = [{ resource: 'products', actions: ['read'] }];

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);
      mockAuthService.getUserPermissions.mockResolvedValue(userPermissions);

      await expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if the user is missing a required action', async () => {
      const requiredPermissions: Permission[] = [{ resource: 'users', actions: ['read', 'write'] }];
      // eslint-disable-next-line prettier/prettier
      const userPermissions: Permission[] = [{ resource: 'users', actions: ['read'] }];

      // eslint-disable-next-line prettier/prettier
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);
      mockAuthService.getUserPermissions.mockResolvedValue(userPermissions);

      // eslint-disable-next-line prettier/prettier
      await expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if the authService.getUserPermissions call fails', async () => {
      // eslint-disable-next-line prettier/prettier
      const requiredPermissions: Permission[] = [{ resource: 'users', actions: ['read'] }];
      
      // eslint-disable-next-line prettier/prettier
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);
      mockAuthService.getUserPermissions.mockRejectedValue(new Error('DB error'));

      // eslint-disable-next-line prettier/prettier
      await expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException);
    });
  });
});
