import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  CreateProductSchema,
  CreateQuotationSchema,
  CreateInvoiceSchema,
} from '@ginie/common';
import { CurrentTenant } from '../../common/current-user.decorator';
import { Public } from '../../common/tenant.guard';

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

  @Patch('products/:id')
  async updateProduct(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.billingService.updateProduct(tenantId, id, body);
  }

  @Delete('products/:id')
  async deleteProduct(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.billingService.deleteProduct(tenantId, id);
  }

  // Public Digital Storefront Endpoints
  @Public()
  @Get('store/:slug')
  async getPublicStore(@Param('slug') slug: string) {
    return this.billingService.getPublicStore(slug);
  }

  @Public()
  @Get('store/:slug/loyalty-check')
  async checkCustomerLoyalty(
    @Param('slug') slug: string,
    @Query('phone') phone: string,
  ) {
    return this.billingService.checkCustomerLoyalty(slug, phone);
  }

  @Public()
  @Post('store/:slug/order')
  async createStoreOrder(
    @Param('slug') slug: string,
    @Body() body: any,
  ) {
    return this.billingService.createStoreOrder(slug, body);
  }

  // Authenticated Store Order Management
  @Get('store-orders')
  async getStoreOrders(@CurrentTenant() tenantId: string) {
    return this.billingService.getStoreOrders(tenantId);
  }

  @Patch('store-orders/:id/status')
  async updateStoreOrderStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.billingService.updateStoreOrderStatus(tenantId, id, body.status);
  }

  // ERP Operations: Inventory & Purchase Orders
  @Get('erp/inventory')
  async getInventory(@CurrentTenant() tenantId: string) {
    return this.billingService.getInventory(tenantId);
  }

  @Post('erp/inventory/adjust')
  async adjustStock(
    @CurrentTenant() tenantId: string,
    @Body() body: { productId: string; delta: number; reason?: string },
  ) {
    return this.billingService.adjustStock(tenantId, body.productId, body.delta, body.reason);
  }

  @Get('erp/purchase-orders')
  async getPurchaseOrders(@CurrentTenant() tenantId: string) {
    return this.billingService.getPurchaseOrders(tenantId);
  }

  @Post('erp/purchase-orders')
  async createPurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.billingService.createPurchaseOrder(tenantId, body);
  }

  @Patch('erp/purchase-orders/:id/status')
  async updatePurchaseOrderStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.billingService.updatePurchaseOrderStatus(tenantId, id, body.status);
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
