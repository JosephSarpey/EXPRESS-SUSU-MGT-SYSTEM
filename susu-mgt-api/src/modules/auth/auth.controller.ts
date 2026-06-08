import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, CookieOptions } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseJwtGuard } from './supabase-jwt.guard.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseService } from './supabase.service.js';
import { SignUpDto } from './dto/signup.dto.js';
import { SignInDto } from './dto/signin.dto.js';
import {
  ResetPasswordDto,
  UpdatePasswordDto,
} from './dto/reset-password.dto.js';
import {
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/verify-email.dto.js';

/** Shared cookie options factory to keep settings DRY. */
function cookieOptions(maxAgeMs: number, isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: maxAgeMs,
    path: '/',
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('me')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: unknown) {
    return user;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.supabaseService.signUp(signUpDto.email, signUpDto.password, {
      fullName: signUpDto.fullName,
      phone: signUpDto.phone,
      redirectTo: signUpDto.redirectTo,
    });
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const data = await this.supabaseService.signIn(
      signInDto.email,
      signInDto.password,
    );

    if (data.session?.access_token) {
      // Short-lived access token (typically 1 hour)
      response.cookie(
        'sb-access-token',
        data.session.access_token,
        cookieOptions(data.session.expires_in * 1000, isProd),
      );
    }

    if (data.session?.refresh_token) {
      // Long-lived refresh token (7 days)
      response.cookie(
        'sb-refresh-token',
        data.session.refresh_token,
        cookieOptions(7 * 24 * 60 * 60 * 1000, isProd),
      );
    }

    // Do not expose raw tokens to the client — they live in httpOnly cookies
    return { user: data.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'No or invalid refresh token' })
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const refreshToken = req.cookies?.['sb-refresh-token'] as
      | string
      | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token cookie present');
    }

    const data = await this.supabaseService.refreshSession(refreshToken);

    if (data.session?.access_token) {
      response.cookie(
        'sb-access-token',
        data.session.access_token,
        cookieOptions(data.session.expires_in * 1000, isProd),
      );
    }

    // Rotate the refresh token if Supabase issued a new one
    if (data.session?.refresh_token) {
      response.cookie(
        'sb-refresh-token',
        data.session.refresh_token,
        cookieOptions(7 * 24 * 60 * 60 * 1000, isProd),
      );
    }

    return { message: 'Token refreshed successfully' };
  }

  @Post('signout')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const token: string | undefined =
      req.headers?.authorization?.split(' ')[1] ||
      req.cookies?.['sb-access-token'];

    if (token) {
      await this.supabaseService.signOut(token);
    }

    const clearOpts: CookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
    };
    response.clearCookie('sb-access-token', clearOpts);
    response.clearCookie('sb-refresh-token', clearOpts);

    return { message: 'Signed out successfully' };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or email' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.supabaseService.verifyOtp(
      verifyEmailDto.email,
      verifyEmailDto.token,
      verifyEmailDto.type || 'signup',
    );
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.supabaseService.resendConfirmationEmail(
      resendDto.email,
      resendDto.redirectTo,
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.supabaseService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.redirectTo,
    );
  }

  @Post('update-password')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @CurrentUser() user: { id: string },
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.supabaseService.updatePassword(
      user.id,
      updatePasswordDto.password,
    );
  }
}
