import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  CreateProductDto,
  CreateQuotationDto,
  CreateInvoiceDto,
} from '@ginie/common';

@Injectable()
export class BillingService {
  // Products
  async getProducts(tenantId: string) {
    return prisma.product.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    return prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        price: dto.price,
        taxRate: dto.taxRate,
        unit: dto.unit,
        description: dto.description,
      },
    });
  }

  // Quotations
  async getQuotations(tenantId: string) {
    return prisma.quotation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { contact: true, deal: true },
    });
  }

  async createQuotation(tenantId: string, dto: CreateQuotationDto) {
    let subtotal = 0;
    let taxTotal = 0;

    const items = dto.items.map((it) => {
      const lineTotal = it.price * it.quantity;
      const lineTax = (lineTotal * (it.taxRate || 18)) / 100;
      subtotal += lineTotal;
      taxTotal += lineTax;
      return {
        ...it,
        total: lineTotal + lineTax,
      };
    });

    const total = subtotal + taxTotal;
    const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;

    return prisma.quotation.create({
      data: {
        tenantId,
        quotationNumber,
        contactId: dto.contactId,
        dealId: dto.dealId,
        items,
        subtotal,
        taxTotal,
        total,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        notes: dto.notes,
        status: 'draft',
      },
      include: { contact: true },
    });
  }

  async convertToInvoice(tenantId: string, quotationId: string) {
    const quotation = await prisma.quotation.findFirst({
      where: { id: quotationId, tenantId },
    });
    if (!quotation) throw new NotFoundException('Quotation not found.');

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        quotationId: quotation.id,
        contactId: quotation.contactId,
        items: quotation.items as any,
        subtotal: quotation.subtotal,
        taxTotal: quotation.taxTotal,
        total: quotation.total,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 15 * 86400000), // 15 days net
      },
    });

    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'converted' },
    });

    return invoice;
  }

  // Invoices
  async getInvoices(tenantId: string) {
    return prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { contact: true, quotation: true },
    });
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    const existing = await prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Invoice not found.');

    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : undefined,
      },
    });
  }
}
