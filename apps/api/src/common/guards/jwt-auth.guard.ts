import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Apply this to any controller or route that requires authentication.
// Usage: @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
