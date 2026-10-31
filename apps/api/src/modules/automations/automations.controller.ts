import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UsePipes,
} from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateWorkflowSchema, CreateWorkflowDto } from '@ginie/common';

@Controller('api/automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  async listWorkflows(@Request() req: any) {
    return this.automationsService.listWorkflows(req.tenantId);
  }

  @Get('runs')
  async listRuns(@Request() req: any) {
    return this.automationsService.listRuns(req.tenantId);
  }

  @Get(':id')
  async getWorkflow(@Request() req: any, @Param('id') id: string) {
    return this.automationsService.getWorkflow(req.tenantId, id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateWorkflowSchema))
  async createWorkflow(@Request() req: any, @Body() dto: CreateWorkflowDto) {
    return this.automationsService.createWorkflow(req.tenantId, dto);
  }

  @Patch(':id')
  async updateWorkflow(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkflowDto>,
  ) {
    return this.automationsService.updateWorkflow(req.tenantId, id, dto);
  }

  @Delete(':id')
  async deleteWorkflow(@Request() req: any, @Param('id') id: string) {
    return this.automationsService.deleteWorkflow(req.tenantId, id);
  }

  @Post(':id/test')
  async testWorkflow(@Request() req: any, @Param('id') id: string) {
    return this.automationsService.testWorkflow(req.tenantId, id);
  }
}
