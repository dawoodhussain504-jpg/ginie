import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  CreateCustomFieldDto,
  SubmitWebFormDto,
} from '@ginie/common';

@Injectable()
export class FormsService {
  // Custom Fields
  async getCustomFields(tenantId: string, entityType?: string) {
    const where: any = { tenantId };
    if (entityType) where.entityType = entityType;

    return prisma.customFieldDefinition.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCustomField(tenantId: string, dto: CreateCustomFieldDto) {
    return prisma.customFieldDefinition.create({
      data: {
        tenantId,
        entityType: dto.entityType,
        key: dto.key,
        label: dto.label,
        fieldType: dto.fieldType,
        options: dto.options,
        isRequired: dto.isRequired,
      },
    });
  }

  // Web Forms
  async getWebForms(tenantId: string) {
    return prisma.webForm.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWebForm(tenantId: string, data: { title: string; description?: string; fields?: any }) {
    return prisma.webForm.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        fields: data.fields || [
          { name: 'name', label: 'Full Name', required: true },
          { name: 'phone', label: 'Phone Number', required: false },
          { name: 'email', label: 'Email Address', required: false },
          { name: 'message', label: 'Message / Inquiries', required: false },
        ],
      },
    });
  }

  // Public Form Submission: automatically creates new Potential Customer
  async submitPublicForm(formId: string, dto: SubmitWebFormDto) {
    const form = await prisma.webForm.findFirst({
      where: { id: formId, isActive: true },
    });
    if (!form) throw new NotFoundException('Form not found or no longer active.');

    const defaultStatus = await prisma.leadStatus.findFirst({
      where: { tenantId: form.tenantId, isDefault: true },
    });

    const lead = await prisma.lead.create({
      data: {
        tenantId: form.tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        source: 'Website Form',
        statusId: defaultStatus?.id,
        customFields: {
          ...dto.customFields,
          formId: form.id,
          formTitle: form.title,
          submittedMessage: dto.message,
        },
      },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        tenantId: form.tenantId,
        entityType: 'lead',
        entityId: lead.id,
        type: 'note',
        content: `Lead submitted via public form: "${form.title}"${dto.message ? `. Message: ${dto.message}` : ''}`,
      },
    });

    return { success: true, message: 'Thank you! Your information has been submitted successfully.' };
  }
}
