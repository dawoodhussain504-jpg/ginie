import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import {
  CreateCustomFieldSchema,
  SubmitWebFormSchema,
} from '@ginie/common';
import { CurrentTenant } from '../../common/current-user.decorator';
import { Public } from '../../common/tenant.guard';

@Controller('api')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // Custom Fields (Extra Details)
  @Get('custom-fields')
  async getCustomFields(
    @CurrentTenant() tenantId: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.formsService.getCustomFields(tenantId, entityType);
  }

  @Post('custom-fields')
  async createCustomField(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateCustomFieldSchema.parse(body);
    return this.formsService.createCustomField(tenantId, validated);
  }

  // Web Forms
  @Get('forms')
  async getWebForms(@CurrentTenant() tenantId: string) {
    return this.formsService.getWebForms(tenantId);
  }

  @Post('forms')
  async createWebForm(@CurrentTenant() tenantId: string, @Body() body: any) {
    return this.formsService.createWebForm(tenantId, body);
  }

  // Public Form Submission
  @Public()
  @Post('public/forms/:id/submit')
  async submitPublicForm(@Param('id') formId: string, @Body() body: any) {
    const validated = SubmitWebFormSchema.parse(body);
    return this.formsService.submitPublicForm(formId, validated);
  }
}
