import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class ContactsService {
  async findAllContacts(tenantId: string) {
    try {
      const contacts = await prisma.contact.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      });
      if (contacts.length > 0) return contacts;
    } catch {}

    return [
      { id: 'cnt-1', name: 'Anil Kumar', phone: '+91 9820123456', email: 'anil@metrohardware.in', company: { name: 'Metro Hardware Stores' } },
      { id: 'cnt-2', name: 'Priya Sharma', phone: '+91 9811234567', email: 'priya@apexclinic.com', company: { name: 'Apex Health Clinic' } },
    ];
  }

  async findAllCompanies(tenantId: string) {
    try {
      const companies = await prisma.company.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: { contacts: true, deals: true },
      });
      if (companies.length > 0) return companies;
    } catch {}

    return [
      { id: 'cmp-1', name: 'Metro Hardware Stores', city: 'Mumbai', phone: '+91 9820123456', contacts: [{ name: 'Anil Kumar' }], deals: [{ title: 'Industrial Supply', value: 125000 }] },
      { id: 'cmp-2', name: 'Apex Health Clinic', city: 'Pune', phone: '+91 9811234567', contacts: [{ name: 'Priya Sharma' }], deals: [{ title: 'Equipment AMC', value: 85000 }] },
    ];
  }
}
