import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { WalletsService } from './wallets.service.js';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @UseGuards(SupabaseJwtGuard)
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyWallet(@CurrentUser() user: { id: string }) {
    return this.walletsService.getWalletByUserId(user.id);
  }
}
