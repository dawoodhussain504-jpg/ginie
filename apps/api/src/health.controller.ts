import { Controller, Get } from '@nestjs/common';
import { Public } from './common/tenant.guard';

@Controller('api/health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'GINIE API',
      timestamp: new Date().toISOString(),
    };
  }
}
