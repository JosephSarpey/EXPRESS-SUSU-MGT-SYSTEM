import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { RolesGuard } from '../../common/auth/roles.guard.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateSettingDto } from './dto/update-setting.dto.js';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new staff account (WORKER or ADMIN)' })
  @ApiResponse({
    status: 201,
    description: 'Staff account created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createStaffAccount(
    @Request() req: { user: { id: string } },
    @Body() createStaffDto: CreateStaffDto,
  ) {
    return this.adminService.createStaffAccount(req.user.id, createStaffDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getRecentTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getRecentTransactions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
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
    description: 'Audit logs retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get admin notifications (in-app only)' })
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getNotifications(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.listForUser(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('worker-collections')
  @ApiOperation({ summary: 'Get all worker collections' })
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
  @ApiQuery({
    name: 'workerId',
    required: false,
    description: 'Filter by specific worker ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Worker collections retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getWorkerCollections(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.adminService.getWorkerCollections({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      workerId,
    });
  }

  @Get('customer-deposits')
  @ApiOperation({ summary: 'Get all customer deposits' })
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
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by specific customer ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer deposits retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getCustomerDeposits(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getCustomerDeposits({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      userId,
    });
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get all withdrawals' })
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
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by specific customer ID',
  })
  @ApiQuery({
    name: 'workerId',
    required: false,
    description: 'Filter by specific worker ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawals retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllWithdrawals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.adminService.getAllWithdrawals({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      userId,
      workerId,
    });
  }

  // ─── Phase 2: Wallet Controls ───────────────────────────────────────

  @Get('wallets/:userId')
  @ApiOperation({ summary: 'Get a specific user wallet' })
  @ApiParam({ name: 'userId', description: 'User ID to look up' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getUserWallet(@Param('userId') userId: string) {
    return this.adminService.getWalletByUserId(userId);
  }

  @Post('wallets/:userId/lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lock a user wallet' })
  @ApiParam({ name: 'userId', description: 'User ID whose wallet to lock' })
  @ApiResponse({
    status: 200,
    description: 'Wallet locked successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async lockWallet(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.adminService.lockWallet(userId, req.user.id);
  }

  @Post('wallets/:userId/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock a user wallet' })
  @ApiParam({ name: 'userId', description: 'User ID whose wallet to unlock' })
  @ApiResponse({
    status: 200,
    description: 'Wallet unlocked successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async unlockWallet(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.adminService.unlockWallet(userId, req.user.id);
  }

  // ─── Phase 3: System Settings ───────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
  })
  async getSettings() {
    return this.adminService.getSystemSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Create or update a system setting' })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully',
  })
  async updateSetting(@Body() dto: UpdateSettingDto) {
    return this.adminService.updateSystemSetting(
      dto.settingKey,
      dto.settingValue,
      dto.description,
    );
  }

  // ─── Phase 4: Worker Session Management ─────────────────────────────

  @Get('worker-sessions')
  @ApiOperation({ summary: 'Get worker sessions' })
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
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by session status (ACTIVE or ENDED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Worker sessions retrieved successfully',
  })
  async getWorkerSessions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getWorkerSessions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
  }

  @Post('worker-sessions/:id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force terminate a worker session' })
  @ApiParam({ name: 'id', description: 'Worker session ID' })
  @ApiResponse({
    status: 200,
    description: 'Session terminated successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async terminateWorkerSession(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.adminService.terminateWorkerSession(id, req.user.id);
  }

  // ─── Phase 5: Wallets & Workers Management ───────────────────────

  @Get('wallets')
  @ApiOperation({ summary: 'List all user wallets' })
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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by user email or full name',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallets retrieved successfully',
  })
  async listWallets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listWallets({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get('workers')
  @ApiOperation({ summary: 'List all workers' })
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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by email or full name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by account status',
  })
  @ApiResponse({
    status: 200,
    description: 'Workers retrieved successfully',
  })
  async listWorkers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listWorkers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
    });
  }
}
