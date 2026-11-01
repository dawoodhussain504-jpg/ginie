import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  CreateProductSchema,
  CreateQuotationSchema,
  CreateInvoiceSchema,
} from '@ginie/common';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Products
  @Get('products')
  async getProducts(@CurrentTenant() tenantId: string) {
    return this.billingService.getProducts(tenantId);
  }

  @Post('products')
  async createProduct(@CurrentTenant() tenantId: string, @Body() body: any) {
    const validated = CreateProductSchema.parse(body);
    return this.billingService.createProduct(tenantId, validated);
  }

  // Quotations
  @Get('quotations')
  async getQuotations(@CurrentTenant() tenantId: string) {
    return this.billingService.getQuotations(tenantId);
  }

  @Post('quotations')
  async createQuotation(@CurrentTenant() tenantId: string, @Body() body: any) {
    const validated = CreateQuotationSchema.parse(body);
    return this.billingService.createQuotation(tenantId, validated);
  }

  @Post('quotations/:id/convert')
  async convertToInvoice(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.billingService.convertToInvoice(tenantId, id);
  }

  // Invoices
  @Get('invoices')
  async getInvoices(@CurrentTenant() tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('invoices/:id')
  async getInvoice(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.billingService.getInvoice(tenantId, id);
  }

  @Post('invoices')
  async createInvoice(@CurrentTenant() tenantId: string, @Body() body: any) {
    const validated = CreateInvoiceSchema.parse(body);
    return this.billingService.createInvoice(tenantId, validated);
  }

  @Patch('invoices/:id/status')
  async updateInvoiceStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.billingService.updateInvoiceStatus(tenantId, id, body.status);
  }
}
