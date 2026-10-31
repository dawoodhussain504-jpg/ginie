import { Controller, Get } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('contacts')
  async getContacts(@CurrentTenant() tenantId: string) {
    return this.contactsService.findAllContacts(tenantId);
  }

  @Get('companies')
  async getCompanies(@CurrentTenant() tenantId: string) {
    return this.contactsService.findAllCompanies(tenantId);
  }
}
