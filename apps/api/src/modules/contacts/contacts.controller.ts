import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentTenant } from '../../common/current-user.decorator';
import { ImportCustomersDto } from '@ginie/common';

@Controller('api')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('contacts')
  async getContacts(@CurrentTenant() tenantId: string) {
    return this.contactsService.findAllContacts(tenantId);
  }

  @Post('contacts')
  async createContact(
    @CurrentTenant() tenantId: string,
    @Body() body: { name: string; phone?: string; email?: string; companyName?: string; designation?: string; notes?: string },
  ) {
    return this.contactsService.createContact(tenantId, body);
  }

  @Post('contacts/import')
  async importContacts(
    @CurrentTenant() tenantId: string,
    @Body() dto: ImportCustomersDto,
  ) {
    return this.contactsService.importContacts(tenantId, dto);
  }

  @Get('contacts/:id/timeline')
  async getTimeline(
    @CurrentTenant() tenantId: string,
    @Param('id') customerId: string,
  ) {
    return this.contactsService.getCustomerTimeline(tenantId, customerId);
  }

  @Get('companies')
  async getCompanies(@CurrentTenant() tenantId: string) {
    return this.contactsService.findAllCompanies(tenantId);
  }
}
