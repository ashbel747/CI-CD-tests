import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockExecutionContext = (
    headers: Record<string, string>,
  ): Partial<ExecutionContext> => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as Partial<ExecutionContext> as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow request with valid token', () => {
    const payload = { userId: '123', role: 'admin' };
    mockJwtService.verify.mockReturnValue(payload);

    const context = mockExecutionContext({
      authorization: 'Bearer valid.jwt.token',
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
  });

  it('should throw UnauthorizedException if no token is provided', () => {
    const context = mockExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(mockJwtService.verify).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Invalid Token');
    });

    const context = mockExecutionContext({
      authorization: 'Bearer invalid.jwt.token',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(mockJwtService.verify).toHaveBeenCalledWith('invalid.jwt.token');
  });
});
