import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { prisma, getTenantPrisma } from '@ginie/database';
import { CreateLeadDto, UpdateLeadDto, CreateActivityDto } from '@ginie/common';

@Injectable()
export class LeadsService {
  async findAll(
    tenantId: string,
    query: {
      search?: string;
      statusId?: string;
      ownerId?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (query.statusId) {
      where.statusId = query.statusId;
    }
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { status: true, owner: true },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        status: true,
        owner: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Customer record not found.');
    }

    const activities = await prisma.activity.findMany({
      where: { tenantId, entityType: 'lead', entityId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return { ...lead, activities };
  }

  async create(tenantId: string, userId: string, dto: CreateLeadDto) {
    // Duplicate detection
    if (dto.phone) {
      const duplicatePhone = await prisma.lead.findFirst({
        where: { tenantId, phone: dto.phone, deletedAt: null },
      });
      if (duplicatePhone) {
        throw new BadRequestException('A potential customer with this phone number is already added.');
      }
    }

    if (dto.email) {
      const duplicateEmail = await prisma.lead.findFirst({
        where: { tenantId, email: dto.email.toLowerCase(), deletedAt: null },
      });
      if (duplicateEmail) {
        throw new BadRequestException('A potential customer with this email address is already added.');
      }
    }

    if (dto.googlePlaceId) {
      const duplicatePlace = await prisma.lead.findFirst({
        where: { tenantId, googlePlaceId: dto.googlePlaceId, deletedAt: null },
      });
      if (duplicatePlace) {
        throw new BadRequestException('This business is already in your customer list.');
      }
    }

    // Default status if not provided
    let statusId = dto.statusId;
    if (!statusId) {
      const defaultStatus = await prisma.leadStatus.findFirst({
        where: { tenantId, isDefault: true },
      });
      statusId = defaultStatus?.id;
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        createdBy: userId,
        statusId,
        name: dto.name,
        companyName: dto.companyName,
        phone: dto.phone,
        email: dto.email ? dto.email.toLowerCase() : undefined,
        website: dto.website,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'India',
        pincode: dto.pincode,
        source: dto.source || 'Direct',
        ownerId: dto.ownerId || userId,
        tags: dto.tags || [],
        googlePlaceId: dto.googlePlaceId,
        customFields: dto.customFields || {},
      },
      include: { status: true, owner: true },
    });

    // Add creation activity
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'lead',
        entityId: lead.id,
        type: 'note',
        content: dto.notes || 'Customer profile created.',
      },
    });

    return lead;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateLeadDto) {
    const existing = await prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Customer record not found.');
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email ? dto.email.toLowerCase() : undefined,
      },
      include: { status: true, owner: true },
    });

    return updated;
  }

  async remove(tenantId: string, id: string) {
    const existing = await prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Customer record not found.');
    }

    // Soft delete
    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Customer moved to bin.' };
  }

  async addActivity(tenantId: string, userId: string, leadId: string, dto: CreateActivityDto) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException('Customer record not found.');
    }

    return prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'lead',
        entityId: leadId,
        type: dto.type,
        content: dto.content,
        meta: dto.meta || {},
      },
      include: { user: true },
    });
  }

  async convertLead(
    tenantId: string,
    userId: string,
    leadId: string,
    opts: { createDeal?: boolean; dealValue?: number; dealTitle?: string; stageId?: string },
  ) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException('Customer record not found.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create or link Company
      let companyId: string | undefined;
      if (lead.companyName) {
        const company = await tx.company.create({
          data: {
            tenantId,
            name: lead.companyName,
            website: lead.website,
            address: lead.address,
            createdBy: userId,
          },
        });
        companyId = company.id;
      }

      // 2. Create Contact
      const contact = await tx.contact.create({
        data: {
          tenantId,
          companyId,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          createdBy: userId,
        },
      });

      // 3. Create Deal if requested
      let dealId: string | undefined;
      if (opts.createDeal) {
        const pipeline = await tx.pipeline.findFirst({
          where: { tenantId, isDefault: true },
          include: { stages: true },
        });
        const stageId = opts.stageId || pipeline?.stages[0]?.id;

        if (pipeline && stageId) {
          const deal = await tx.deal.create({
            data: {
              tenantId,
              pipelineId: pipeline.id,
              stageId,
              contactId: contact.id,
              companyId,
              ownerId: lead.ownerId || userId,
              title: opts.dealTitle || `${lead.companyName || lead.name} - Sale`,
              value: opts.dealValue || 0,
            },
          });
          dealId = deal.id;
        }
      }

      // Mark lead converted
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          convertedContactId: contact.id,
          convertedDealId: dealId,
        },
      });

      return { contactId: contact.id, companyId, dealId };
    });
  }

  async getStatuses(tenantId: string) {
    return prisma.leadStatus.findMany({
      where: { tenantId },
      orderBy: { orderIndex: 'asc' },
    });
  }
}
