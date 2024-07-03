import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AxiosError } from 'axios';
import { Response } from 'express';

@Catch()
export class RethrowAxiosExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!exception || !exception.isAxiosError) {
      return super.catch(exception, host);
    }

    const status =
      (exception as AxiosError).response?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    // Rethrow error
    const error = (exception as AxiosError).response?.data;

    return response.status(status).json(error);
  }
}
