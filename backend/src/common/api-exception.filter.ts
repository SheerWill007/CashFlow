import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

/** Every error leaves the API as `{ error: "message" }`, which the frontend shows as-is. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Api');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (res.headersSent) return;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      let message = exception.message;
      if (typeof body === 'string') message = body;
      else if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message: unknown }).message;
        message = Array.isArray(m) ? String(m[0]) : String(m);
      }
      res.status(exception.getStatus()).json({ error: message });
      return;
    }

    // Errors thrown by Express' body parser (bad JSON, body too large) carry their own status.
    const err = exception as { status?: number; type?: string } | undefined;
    if (err && typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
      const message =
        err.type === 'entity.parse.failed' ? 'Invalid JSON' : err.type === 'entity.too.large' ? 'Request too large' : 'Bad request';
      res.status(err.status).json({ error: message });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    res.status(500).json({ error: 'Something went wrong' });
  }
}
