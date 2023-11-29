import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    const { user } = context.switchToHttp().getRequest();

    return user.permissions.some(permission => requiredPermissions.includes(permission));
  }
}