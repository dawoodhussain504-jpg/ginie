import {
  Controller,
  Post,
  Param,
  Body,
  Request,
  UsePipes,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  DraftMessageSchema,
  DraftMessageDto,
  SummarizeCallSchema,
  SummarizeCallDto,
} from '@ginie/common';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('score-customer/:id')
  async scoreCustomer(@Request() req: any, @Param('id') id: string) {
    return this.aiService.scoreCustomer(req.tenantId, id);
  }

  @Post('draft-message')
  @UsePipes(new ZodValidationPipe(DraftMessageSchema))
  async draftMessage(@Request() req: any, @Body() dto: DraftMessageDto) {
    return this.aiService.draftMessage(req.tenantId, dto);
  }

  @Post('summarize-call')
  @UsePipes(new ZodValidationPipe(SummarizeCallSchema))
  async summarizeCall(@Request() req: any, @Body() dto: SummarizeCallDto) {
    return this.aiService.summarizeCall(req.tenantId, dto);
  }
}
