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
} from '@nestjs/common';
import type { Response } from 'express';
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
    const data = await this.supabaseService.signIn(
      signInDto.email,
      signInDto.password,
    );

    if (data.session?.access_token) {
      response.cookie('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in * 1000,
        path: '/',
      });
    }

    return data;
  }

  @Post('signout')
  @UseGuards(SupabaseJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Request() req: { headers: { authorization: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      (req as any).cookies?.['sb-access-token'];

    if (token) {
      await this.supabaseService.signOut(token);
    }

    response.clearCookie('sb-access-token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

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
