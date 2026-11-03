import { Controller, Get } from '@nestjs/common';
import { Public } from './common/tenant.guard';
import { KeepAliveService } from './common/keep-alive.service';

@Controller('api/health')
export class HealthController {
  constructor(private readonly keepAliveService: KeepAliveService) {}

  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'GINIE API',
      timestamp: new Date().toISOString(),
      antiSleep: this.keepAliveService.getStatus(),
    };
  }

  @Public()
  @Get('keep-alive')
  keepAliveStatus() {
    return {
      status: 'ok',
      service: 'GINIE Anti-Sleep Heartbeat Engine',
      antiSleep: this.keepAliveService.getStatus(),
    };
  }
}
