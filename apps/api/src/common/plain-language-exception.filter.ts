import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PlainLanguageExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('AppError');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please check your internet and try again.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as any).message;
        message = Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
    } else {
      // Log technical error details on the server privately
      this.logger.error('Unexpected server error:', exception);
    }

    // Mask technical error terms if any leaked
    message = message
      .replace(/PrismaClientKnownRequestError/g, 'database error')
      .replace(/foreign key constraint/gi, 'connected record')
      .replace(/unique constraint/gi, 'already added');

    response.status(status).json({
      success: false,
      message,
    });
  }
}
