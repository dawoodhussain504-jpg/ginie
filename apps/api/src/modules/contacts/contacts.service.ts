import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class ContactsService {
  async findAllContacts(tenantId: string) {
    return prisma.contact.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
  }

  async findAllCompanies(tenantId: string) {
    return prisma.company.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { contacts: true, deals: true },
    });
  }
}
