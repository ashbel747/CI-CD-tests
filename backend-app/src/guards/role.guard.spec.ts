import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './role.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }) as any, // Fix typing
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access when role matches', () => {
    guard = new RolesGuard('admin');
    const context = mockExecutionContext({ role: 'admin' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if no user is found', () => {
    guard = new RolesGuard('admin');
    const context = mockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if role does not match', () => {
    guard = new RolesGuard('admin');
    const context = mockExecutionContext({ role: 'user' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
