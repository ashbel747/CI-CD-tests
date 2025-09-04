import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { PERMISSIONS_KEY } from 'src/decorators/decorator';
import { Permission } from 'src/roles/dtos/role.dto';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    this.logger.debug(`Authorization check for userId: ${request.userId}`);

    if (!request.userId) {
      throw new UnauthorizedException('User Id not found');
    }

    const routePermissions: Permission[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    this.logger.debug(
      `Route permissions required: ${JSON.stringify(routePermissions)}`,
    );

    if (!routePermissions) {
      this.logger.debug('No permissions required for this route');
      return true;
    }

    try {
      const userPermissions = await this.authService.getUserPermissions(
        request.userId,
      );

      this.logger.debug(`User permissions: ${JSON.stringify(userPermissions)}`);

      for (const routePermission of routePermissions) {
        this.logger.debug(
          `Checking permission for resource: ${routePermission.resource}`,
        );

        const userPermission = userPermissions.find(
          (perm) => perm.resource === routePermission.resource,
        );

        if (!userPermission) {
          this.logger.debug(
            `User does not have permission for resource: ${routePermission.resource}`,
          );
          throw new ForbiddenException();
        }

        const allActionsAvailable = routePermission.actions.every(
          (requiredAction) => {
            const hasAction = userPermission.actions.includes(requiredAction);
            this.logger.debug(
              `Action ${requiredAction} required: ${hasAction}`,
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return hasAction;
          },
        );

        if (!allActionsAvailable) {
          this.logger.debug(
            `User missing required actions for resource: ${routePermission.resource}`,
          );
          throw new ForbiddenException();
        }
      }
      this.logger.debug('Authorization successful');
      return true;
    } catch (e) {
      this.logger.error(`Authorization failed: ${e.message}`);
      throw new ForbiddenException();
    }
  }
}
