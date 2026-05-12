import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService, type SupabaseClaims } from '../users/users.service.js';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.config.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token = '';
    const authHeader = request.headers?.authorization as string | undefined;
    
    if (authHeader) {
      const [scheme, credentials] = authHeader.split(' ');
      if (scheme === 'Bearer' && credentials) {
        token = credentials;
      }
    }

    if (!token && request.cookies?.['sb-access-token']) {
      token = request.cookies['sb-access-token'];
    }

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // Validate the token using Supabase client
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Convert user to claims format
    const claims: SupabaseClaims = {
      sub: user.id,
      email: user.email || '',
      phone: user.phone || undefined,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
      aud: 'authenticated',
      role: 'authenticated',
    };

    const userRecord =
      await this.usersService.getOrCreateFromSupabaseClaims(claims);
    request.user = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      role: userRecord.role,
      status: userRecord.status,
      claims,
    };

    return true;
  }
}
