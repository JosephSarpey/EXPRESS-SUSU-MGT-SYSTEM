import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly http = axios.create({
    baseURL: 'https://api.paystack.co',
    timeout: 15000,
  });

  constructor(private readonly config: ConfigService) {}

  async initializeTransaction(params: {
    email: string;
    amountInKobo: number;
    reference: string;
    metadata: Record<string, unknown>;
    currency?: string;
    callbackUrl?: string;
  }): Promise<{
    status: boolean;
    message: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }> {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new UnauthorizedException('PAYSTACK_SECRET_KEY is not configured');
    }

    try {
      const { data } = await this.http.post(
        '/transaction/initialize',
        {
          email: params.email,
          amount: params.amountInKobo,
          reference: params.reference,
          metadata: params.metadata,
          currency: params.currency,
          callback_url: params.callbackUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return data as {
        status: boolean;
        message: string;
        data?: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      };
    } catch (error: any) {
      console.error(
        'Paystack Initialize Error:',
        error.response?.data || error.message,
      );
      return {
        status: false,
        message:
          error.response?.data?.message || 'Failed to initialize transaction',
      };
    }
  }

  async verifyTransaction(reference: string) {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new UnauthorizedException('PAYSTACK_SECRET_KEY is not configured');
    }

    const { data } = await this.http.get(`/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    return data as {
      status: boolean;
      message: string;
      data?: {
        status: string;
        reference: string;
        amount: number;
        metadata?: {
          userId?: string;
        };
      };
    };
  }
}
