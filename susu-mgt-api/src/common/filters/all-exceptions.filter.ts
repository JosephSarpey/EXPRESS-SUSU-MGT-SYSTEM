import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error details internally
    const errMessage =
      exception instanceof Error ? exception.message : String(exception);
    const errStack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `HTTP Status: ${status} | Method: ${request.method} | URL: ${request.url} | Message: ${errMessage}`,
      errStack,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    let responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      responseBody = {
        ...responseBody,
        ...exceptionResponse,
      };
    } else {
      responseBody.message = exceptionResponse;
    }

    // In case of non-HttpException, ensure we don't leak database or internal error details
    if (!(exception instanceof HttpException)) {
      responseBody.message = 'Internal server error';
    }

    // Add stack trace only in development
    if (!isProduction && exception instanceof Error) {
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
