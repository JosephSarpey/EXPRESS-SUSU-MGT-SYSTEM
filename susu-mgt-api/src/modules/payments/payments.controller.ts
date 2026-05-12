import { Body, Controller, Post, Get, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Prisma } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { PaystackInitializeDto } from './dto/paystack-initialize.dto.js';
import { PaystackService } from './paystack.service.js';

@ApiBearerAuth()
@Controller('payments/paystack')
export class PaymentsController {
  constructor(
    private readonly paystack: PaystackService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('initialize')
  @UseGuards(SupabaseJwtGuard)
  async initialize(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: PaystackInitializeDto,
  ) {
    const amount = new Prisma.Decimal(dto.amount);

    const { tx, currency } =
      await this.transactionsService.createOrReusePendingPaystackDeposit({
        userId: user.id,
        amount,
      });

    const init = await this.paystack.initializeTransaction({
      email: user.email,
      amountInKobo: Math.round(dto.amount * 100),
      reference: tx.referenceId,
      metadata: { userId: user.id },
      currency,
    });

    console.log(`Paystack init for ${user.email}: amount=${dto.amount}, currency=${currency}, status=${init.status}`);

    if (!init.status || !init.data) {
      console.error(`Paystack initialization failed: ${init.message}`);
      return {
        status: 'failed',
        message: init.message,
      };
    }

    return {
      referenceId: tx.referenceId,
      authorizationUrl: init.data.authorization_url,
      accessCode: init.data.access_code,
      currency,
    };
  }

  @Get('verify/:reference')
  @UseGuards(SupabaseJwtGuard)
  async verifyTransaction(
    @CurrentUser() user: { id: string },
    @Param('reference') reference: string,
  ) {
    const verifyResult = await this.paystack.verifyTransaction(reference);

    if (!verifyResult.status || !verifyResult.data) {
      throw new BadRequestException('Transaction verification failed');
    }

    const data = verifyResult.data;
    if (data.status !== 'success') {
      return { status: 'pending_or_failed', message: 'Transaction is not yet successful' };
    }

    const amountInMainUnit = data.amount / 100;

    const tx = await this.transactionsService.applyPaystackSuccessWebhook({
      referenceId: data.reference,
      userId: data.metadata?.userId || user.id, // Fallback to user.id just in case
      amount: amountInMainUnit,
      gatewayResponse: verifyResult as any,
    });

    return {
      status: 'success',
      transactionId: tx.id,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
    };
  }
}
