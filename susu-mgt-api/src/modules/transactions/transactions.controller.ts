import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Prisma } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto.js';
import { AdminDecisionDto } from './dto/admin-decision.dto.js';
import { TransactionsService } from './transactions.service.js';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('me')
  @UseGuards(SupabaseJwtGuard)
  @ApiOperation({ summary: 'Get current user transactions' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listMine(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.listMyTransactions(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('withdrawals')
  @UseGuards(SupabaseJwtGuard)
  @ApiOperation({ summary: 'Get current user withdrawals' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawals retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listMyWithdrawals(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.listMyWithdrawals(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('withdrawals')
  @UseGuards(SupabaseJwtGuard)
  createWithdrawal(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.transactionsService.createWithdrawalRequest({
      userId: user.id,
      amount: new Prisma.Decimal(dto.amount),
      method: dto.method,
    });
  }

  @Get(':id')
  @UseGuards(SupabaseJwtGuard)
  @ApiOperation({ summary: 'Get transaction details by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  getTransactionById(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
  ) {
    // Admins can view any transaction; customers can only view their own
    const userId = user.role === 'ADMIN' ? undefined : user.id;
    return this.transactionsService.findById(id, userId);
  }

  @Post(':id/approve')
  @Roles('ADMIN')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Approve withdrawal request' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal approved successfully',
  })
  approveWithdrawal(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminDecisionDto,
  ) {
    return this.transactionsService.approveWithdrawalRequest({
      adminId: user.id,
      transactionId: id,
      remarks: dto.remarks,
    });
  }

  @Post(':id/confirm-payment')
  @Roles('ADMIN')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Confirm withdrawal payment completion' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed and wallet deducted',
  })
  confirmWithdrawalPayment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminDecisionDto,
  ) {
    return this.transactionsService.confirmWithdrawalPayment({
      adminId: user.id,
      transactionId: id,
      remarks: dto.remarks,
    });
  }

  @Post(':id/worker-confirm-payment')
  @Roles('WORKER')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Worker confirms cash withdrawal payment' })
  @ApiResponse({
    status: 200,
    description: 'Cash payment confirmed and wallet deducted',
  })
  @ApiResponse({
    status: 403,
    description: 'Only cash withdrawals can be confirmed by workers',
  })
  workerConfirmWithdrawalPayment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminDecisionDto,
  ) {
    return this.transactionsService.workerConfirmWithdrawalPayment({
      workerId: user.id,
      transactionId: id,
      remarks: dto.remarks,
    });
  }

  @Post(':id/reject')
  @Roles('ADMIN')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @ApiOperation({ summary: 'Reject withdrawal request' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal rejected successfully',
  })
  rejectWithdrawal(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminDecisionDto,
  ) {
    return this.transactionsService.rejectWithdrawalRequest({
      adminId: user.id,
      transactionId: id,
      remarks: dto.remarks,
    });
  }
}
