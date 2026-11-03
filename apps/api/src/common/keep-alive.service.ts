import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastPingAt: Date | null = null;
  private lastPingResults: { url: string; status: number | string; time: string }[] = [];

  onModuleInit() {
    this.logger.log('Anti-Sleep KeepAlive Service initialized. Interval: 8 minutes.');
    // First ping after 20 seconds to allow services to boot
    setTimeout(() => this.executePing(), 20000);
    // Recurring ping every 8 minutes (480,000 ms) - Prevents Render 15-minute idle sleep
    this.timer = setInterval(() => this.executePing(), 8 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async executePing() {
    const urlsToPing = [
      'https://ginie-api-ga5t.onrender.com/api/health',
      'https://ginie.space/api/health',
    ];

    if (process.env.WHATSAPP_BRIDGE_URL) {
      const bridgeHealth = `${process.env.WHATSAPP_BRIDGE_URL.replace(/\/$/, '')}/health`;
      urlsToPing.push(bridgeHealth);
    }

    const uniqueUrls = Array.from(new Set(urlsToPing.filter(Boolean)));
    const results: { url: string; status: number | string; time: string }[] = [];

    for (const url of uniqueUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
        results.push({ url, status: res.status, time: new Date().toISOString() });
        this.logger.log(`[KeepAlive] Heartbeat ping -> ${url} (HTTP ${res.status})`);
      } catch (err: any) {
        results.push({ url, status: err.message, time: new Date().toISOString() });
        this.logger.warn(`[KeepAlive] Heartbeat ping error -> ${url}: ${err.message}`);
      }
    }

    this.lastPingAt = new Date();
    this.lastPingResults = results;
  }

  getStatus() {
    return {
      active: true,
      antiSleepIntervalMinutes: 8,
      lastPingAt: this.lastPingAt,
      lastPingResults: this.lastPingResults,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
