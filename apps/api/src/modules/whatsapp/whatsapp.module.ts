import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { BaileysService } from './baileys.service';

@Module({
  controllers: [WhatsAppController],
  providers: [WhatsAppService, BaileysService],
  exports: [WhatsAppService, BaileysService],
})
export class WhatsAppModule {}
