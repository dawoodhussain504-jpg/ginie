import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { FallbackAiProvider } from './providers/fallback-ai.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, FallbackAiProvider],
  exports: [AiService],
})
export class AiModule {}
