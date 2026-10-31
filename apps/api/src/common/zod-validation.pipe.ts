import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      const msg = error.errors?.[0]?.message || 'Please check the entered information.';
      throw new BadRequestException(msg);
    }
  }
}
