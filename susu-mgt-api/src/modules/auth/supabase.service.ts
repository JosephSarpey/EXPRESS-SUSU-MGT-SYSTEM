import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    private config: ConfigService,
    private usersService: UsersService,
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

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async signUp(
    email: string,
    password: string,
    options?: {
      fullName?: string;
      phone?: string;
      redirectTo?: string;
    },
  ) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: options?.fullName,
          phone: options?.phone,
        },
        emailRedirectTo:
          options?.redirectTo ?? `${frontendUrl}/auth/verify-email`,
      },
    });

    if (error) {
      // Map known Supabase errors to appropriate HTTP exceptions
      if (
        error.message?.includes('already registered') ||
        error.message?.includes('already been registered')
      ) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    // Supabase returns a fake success for duplicate emails (to prevent
    // email enumeration).  The tell-tale sign is an empty identities array.
    if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      throw new ConflictException(
        'Email address already exists, please try again..',
      );
    }

    // Create local user record if signup was successful
    if (data.user) {
      const claims = {
        sub: data.user.id,
        email: data.user.email,
        phone: options?.phone,
        user_metadata: {
          full_name: options?.fullName,
        },
      };

      await this.usersService.getOrCreateFromSupabaseClaims(claims);
    }

    return data;
  }

  async adminCreateUser(
    email: string,
    password?: string,
    options?: {
      fullName?: string;
      phone?: string;
      role?: string;
    },
  ) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      phone_confirm: !!options?.phone,
      phone: options?.phone,
      user_metadata: {
        full_name: options?.fullName,
        role: options?.role,
      },
    });

    if (error) {
      if (error.message?.includes('already') || error.status === 422) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`Login failed for ${email}: ${error.message}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    return data;
  }

  async signOut(jwt: string) {
    const { error } = await this.supabase.auth.admin.signOut(jwt);

    if (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async verifyOtp(
    email: string,
    token: string,
    type: 'signup' | 'recovery' | 'email_change' = 'signup',
  ) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Update local user's emailVerified status if verification successful
    if (data.user && type === 'signup') {
      await this.usersService.updateEmailVerificationStatus(data.user.id, true);
    }

    return data;
  }

  /**
   * Called after Supabase's email verification redirect.
   *
   * Supabase has already verified the email on its side and returned an
   * access_token in the URL hash.  We validate that token server-side,
   * then sync our local DB (emailVerified = true, status = ACTIVE).
   */
  async confirmEmailVerification(accessToken: string) {
    // Validate the access token with Supabase to get the user
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException(
        error?.message || 'Invalid or expired access token',
      );
    }

    // Only update if the email is actually confirmed in Supabase
    if (!user.email_confirmed_at) {
      throw new BadRequestException('Email has not been confirmed in Supabase');
    }

    // Sync our local database
    await this.usersService.updateEmailVerificationStatus(user.id, true);

    return { message: 'Email verification confirmed', userId: user.id };
  }

  async resetPassword(email: string, redirectTo?: string) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectTo ?? `${frontendUrl}/auth/reset-password`,
      },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updatePassword(userId: string, password: string) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      { password },
    );

    if (error) {
      console.error(`Password update failed for ${userId}: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    // Invalidate all sessions for this user so the recovery token can't be reused
    await this.supabase.auth.admin.signOut(userId, 'global');

    return data;
  }

  async resendConfirmationEmail(email: string, redirectTo?: string) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo ?? `${frontendUrl}/auth/verify-email`,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async getUser(jwt: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(jwt);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return user;
  }

  async updateUser(
    userId: string,
    attributes: {
      email?: string;
      phone?: string;
      user_metadata?: Record<string, any>;
    },
  ) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      attributes,
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async deleteUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }
}
