import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user || !request.user.isSuperAdmin) {
      throw new ForbiddenException(
        'Access denied. Only platform administrators have permission to access the Owner Control Panel.',
      );
    }
    return true;
  }
}
