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
      const quantity = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      const lineTaxable = price * quantity;
      const taxRate = Number(it.taxRate !== undefined ? it.taxRate : 18);
      const cgst = (lineTaxable * (taxRate / 2)) / 100;
      const sgst = (lineTaxable * (taxRate / 2)) / 100;
      const lineTax = cgst + sgst;
      const lineTotal = lineTaxable + lineTax;

      subtotal += lineTaxable;
      taxTotal += lineTax;
      return {
        ...it,
        quantity,
        price,
        taxRate,
        lineTaxable,
        cgst,
        sgst,
        igst: 0,
        total: lineTotal,
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
    const items = ((quotation.items as any[]) || []).map((it) => {
      const quantity = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      const lineTaxable = price * quantity;
      const taxRate = Number(it.taxRate !== undefined ? it.taxRate : 18);
      const cgst = (lineTaxable * (taxRate / 2)) / 100;
      const sgst = (lineTaxable * (taxRate / 2)) / 100;
      return {
        ...it,
        quantity,
        price,
        taxRate,
        lineTaxable,
        cgst,
        sgst,
        igst: 0,
        total: lineTaxable + cgst + sgst,
      };
    });

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        quotationId: quotation.id,
        contactId: quotation.contactId,
        items,
        subtotal: quotation.subtotal,
        taxTotal: quotation.taxTotal,
        total: quotation.total,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 15 * 86400000), // 15 days net
        notes: quotation.notes,
      },
      include: {
        contact: true,
        tenant: {
          select: { name: true, settings: true },
        },
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
      include: {
        contact: true,
        quotation: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });
  }

  async getInvoice(tenantId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        quotation: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    return invoice;
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    let subtotal = 0;
    let taxTotal = 0;
    const isInterState = !!dto.isInterState;

    const items = dto.items.map((it: any) => {
      const quantity = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      const lineTaxable = price * quantity;
      const taxRate = Number(it.taxRate !== undefined ? it.taxRate : 18);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInterState) {
        igst = (lineTaxable * taxRate) / 100;
      } else {
        cgst = (lineTaxable * (taxRate / 2)) / 100;
        sgst = (lineTaxable * (taxRate / 2)) / 100;
      }
      const lineTax = cgst + sgst + igst;
      const lineTotal = lineTaxable + lineTax;

      subtotal += lineTaxable;
      taxTotal += lineTax;

      return {
        ...it,
        quantity,
        price,
        taxRate,
        lineTaxable,
        cgst,
        sgst,
        igst,
        total: lineTotal,
      };
    });

    const total = subtotal + taxTotal;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Build customer info into notes if custom details provided
    let notes = dto.notes || '';
    if (dto.customerName || dto.customerGstin || dto.customerAddress) {
      const meta = {
        customerName: dto.customerName,
        customerGstin: dto.customerGstin,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        customerState: dto.customerState,
        isInterState,
      };
      notes = JSON.stringify({
        text: notes,
        gstMeta: meta,
      });
    }

    return prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        quotationId: dto.quotationId,
        contactId: dto.contactId,
        items,
        subtotal,
        taxTotal,
        total,
        status: 'unpaid',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 15 * 86400000),
        notes,
      },
      include: {
        contact: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
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
      include: {
        contact: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });
  }
}
