import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkersService } from './workers.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { CashDepositDto } from './dto/cash-deposit.dto.js';
import { ClockInDto } from './dto/clock-in.dto.js';
import { Prisma } from '../../generated/prisma/client.js';

@ApiTags('Workers')
@ApiBearerAuth()
@Controller('workers')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class WorkersController {
  constructor(
    private readonly workersService: WorkersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('clock-in')
  @Roles('WORKER')
  @HttpCode(HttpStatus.OK)
  async clockIn(
    @CurrentUser() user: { id: string },
    @Body() clockInDto: ClockInDto,
    @Ip() ip: string,
  ) {
    const finalIp = clockInDto.ipAddress === 'detected-by-server' ? ip : (clockInDto.ipAddress || ip);
    return this.workersService.clockIn(
      user.id,
      clockInDto.deviceInfo,
      finalIp,
    );
  }

  @Post('clock-out')
  @Roles('WORKER')
  @HttpCode(HttpStatus.OK)
  async clockOut(@CurrentUser() user: { id: string }) {
    return this.workersService.clockOut(user.id);
  }

  @Get('session')
  @Roles('WORKER')
  async getActiveSession(@CurrentUser() user: { id: string }) {
    return this.workersService.getActiveSession(user.id);
  }

  @Post('cash-deposit')
  @Roles('WORKER')
  async createCashDeposit(
    @CurrentUser() user: { id: string },
    @Body() cashDepositDto: CashDepositDto,
  ) {
    return this.workersService.createCashDeposit({
      workerId: user.id,
      userId: cashDepositDto.userId,
      amount: new Prisma.Decimal(cashDepositDto.amount),
      description: cashDepositDto.description,
    });
  }

  @Get('collections')
  @Roles('WORKER')
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
  async listWorkerCollections(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.workersService.listWorkerCollections(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get('notifications')
  @Roles('WORKER')
  @ApiOperation({ summary: 'Get worker notifications (in-app only)' })
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
    description: 'Notifications retrieved successfully',
  })
  async listWorkerNotifications(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.listForUser(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('withdrawals')
  @Roles('WORKER')
  @ApiOperation({ summary: 'Get worker processed withdrawals' })
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
    description: 'Worker withdrawals retrieved successfully',
  })
  async listWorkerWithdrawals(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.workersService.listWorkerWithdrawals(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get('stats')
  @Roles('WORKER')
  @ApiOperation({ summary: 'Get worker daily stats' })
  @ApiResponse({
    status: 200,
    description: 'Worker stats retrieved successfully',
  })
  async getWorkerStats(@CurrentUser() user: { id: string }) {
    return this.workersService.getWorkerStats(user.id);
  }
}
