import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

// Lets you write @CurrentUser() user: AuthenticatedUser in controller params
// instead of @Req() req and then req.user.
// AuthenticatedUser = User entity + the resolved tenantId for this session.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
