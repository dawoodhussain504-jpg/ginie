import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ErpService } from './erp.service';
import {
  CreateKhataAccountSchema,
  CreateKhataEntrySchema,
  CreateProductBatchSchema,
  CreateJobCardSchema,
  CreateDoctorPrescriptionSchema,
} from '@ginie/common';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  // ----------------------------------------------------
  // 1. Digital Udhari Khata & Party Ledger
  // ----------------------------------------------------
  @Get('khata/accounts')
  async getKhataAccounts(
    @CurrentTenant() tenantId: string,
    @Query('partyType') partyType?: string,
  ) {
    return this.erpService.getKhataAccounts(tenantId, partyType);
  }

  @Get('khata/accounts/:id')
  async getKhataAccountById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.erpService.getKhataAccountById(tenantId, id);
  }

  @Post('khata/accounts')
  async createKhataAccount(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateKhataAccountSchema.parse(body);
    return this.erpService.createKhataAccount(tenantId, validated);
  }

  @Post('khata/entries')
  async addKhataEntry(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateKhataEntrySchema.parse(body);
    return this.erpService.addKhataEntry(tenantId, validated);
  }

  @Post('khata/remind/:accountId')
  async sendKhataReminder(
    @CurrentTenant() tenantId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.erpService.sendKhataReminderWhatsApp(tenantId, accountId);
  }

  // ----------------------------------------------------
  // 2. Vendor Purchases & Stock Inward
  // ----------------------------------------------------
  @Get('purchases')
  async getPurchaseOrders(@CurrentTenant() tenantId: string) {
    return this.erpService.getPurchaseOrders(tenantId);
  }

  @Post('purchases')
  async createPurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.erpService.createPurchaseOrder(tenantId, body);
  }

  @Post('purchases/:id/receive')
  async receivePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.erpService.receivePurchaseOrder(tenantId, id);
  }

  // ----------------------------------------------------
  // 3. Batches & Expiry
  // ----------------------------------------------------
  @Get('batches')
  async getProductBatches(
    @CurrentTenant() tenantId: string,
    @Query('productId') productId?: string,
  ) {
    return this.erpService.getProductBatches(tenantId, productId);
  }

  @Post('batches')
  async createProductBatch(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateProductBatchSchema.parse(body);
    return this.erpService.createProductBatch(tenantId, validated);
  }

  // ----------------------------------------------------
  // 4. Job Cards (Garage & Automobile)
  // ----------------------------------------------------
  @Get('job-cards')
  async getJobCards(@CurrentTenant() tenantId: string) {
    return this.erpService.getJobCards(tenantId);
  }

  @Post('job-cards')
  async createJobCard(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateJobCardSchema.parse(body);
    return this.erpService.createJobCard(tenantId, validated);
  }

  @Patch('job-cards/:id/status')
  async updateJobCardStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.erpService.updateJobCardStatus(tenantId, id, body.status);
  }

  @Post('job-cards/:id/send-whatsapp')
  async sendJobCardWhatsApp(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.erpService.sendJobCardWhatsApp(tenantId, id);
  }

  // ----------------------------------------------------
  // 5. Doctor Prescriptions (Clinic Rx)
  // ----------------------------------------------------
  @Get('prescriptions')
  async getDoctorPrescriptions(@CurrentTenant() tenantId: string) {
    return this.erpService.getDoctorPrescriptions(tenantId);
  }

  @Post('prescriptions')
  async createDoctorPrescription(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateDoctorPrescriptionSchema.parse(body);
    return this.erpService.createDoctorPrescription(tenantId, validated);
  }

  @Post('prescriptions/:id/send-whatsapp')
  async sendPrescriptionWhatsApp(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.erpService.sendPrescriptionWhatsApp(tenantId, id);
  }
}
