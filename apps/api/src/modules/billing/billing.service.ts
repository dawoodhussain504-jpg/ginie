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

  // Extended Product Management
  async updateProduct(tenantId: string, id: string, data: any) {
    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Product not found.');
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        code: data.code ?? existing.code,
        price: data.price !== undefined ? data.price : existing.price,
        taxRate: data.taxRate !== undefined ? data.taxRate : existing.taxRate,
        unit: data.unit ?? existing.unit,
        description: data.description ?? existing.description,
        sku: data.sku ?? (existing as any).sku,
        category: data.category ?? (existing as any).category,
        imageUrl: data.imageUrl ?? (existing as any).imageUrl,
        stockInHand: data.stockInHand !== undefined ? Number(data.stockInHand) : (existing as any).stockInHand,
        minStockAlert: data.minStockAlert !== undefined ? Number(data.minStockAlert) : (existing as any).minStockAlert,
        isPublishedToStore: data.isPublishedToStore !== undefined ? Boolean(data.isPublishedToStore) : (existing as any).isPublishedToStore,
      } as any,
    });
  }

  async deleteProduct(tenantId: string, id: string) {
    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Product not found.');
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Digital Storefront
  async getPublicStore(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        brandColor: true,
        businessType: true,
        workingHours: true,
        settings: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            taxRate: true,
            unit: true,
            description: true,
            sku: true,
            category: true,
            imageUrl: true,
            stockInHand: true,
            isPublishedToStore: true,
          } as any,
        },
      },
    });
    if (!tenant) throw new NotFoundException('Store not found.');
    return tenant;
  }

  async createStoreOrder(slug: string, orderDto: any) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Store not found.');

    const subtotal = Number(orderDto.subtotal || 0);
    const taxTotal = Number(orderDto.taxTotal || 0);
    const total = Number(orderDto.total || (subtotal + taxTotal));

    const order = await (prisma as any).storeOrder.create({
      data: {
        tenantId: tenant.id,
        customerName: orderDto.customerName || 'Store Customer',
        customerPhone: orderDto.customerPhone || '',
        customerAddress: orderDto.customerAddress || '',
        items: orderDto.items || [],
        subtotal,
        taxTotal,
        total,
        status: 'pending',
        paymentMethod: orderDto.paymentMethod || 'cod',
        paymentStatus: 'unpaid',
        notes: orderDto.notes || '',
      },
    });

    if (orderDto.customerPhone || orderDto.customerName) {
      try {
        await prisma.lead.create({
          data: {
            tenantId: tenant.id,
            name: orderDto.customerName || 'Storefront Buyer',
            phone: orderDto.customerPhone || '',
            address: orderDto.customerAddress || '',
            source: 'Online Storefront',
            score: 85,
            aiScoreCategory: 'hot',
            aiScoreReason: `Placed online store order for INR ${total}`,
            tags: ['storefront-order'],
          },
        });
      } catch (_) {}
    }

    return order;
  }

  async getStoreOrders(tenantId: string) {
    return (prisma as any).storeOrder.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStoreOrderStatus(tenantId: string, orderId: string, status: string) {
    return (prisma as any).storeOrder.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // ERP Operations: Inventory & Purchase Orders
  async getInventory(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p: any) => ({
      ...p,
      stockInHand: p.stockInHand || 0,
      minStockAlert: p.minStockAlert || 5,
      isLowStock: (p.stockInHand || 0) <= (p.minStockAlert || 5),
    }));
  }

  async adjustStock(tenantId: string, productId: string, delta: number, reason?: string) {
    const prod = await prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!prod) throw new NotFoundException('Product not found.');
    const newStock = Math.max(0, ((prod as any).stockInHand || 0) + delta);
    return prisma.product.update({
      where: { id: productId },
      data: { stockInHand: newStock } as any,
    });
  }

  async getPurchaseOrders(tenantId: string) {
    return (prisma as any).purchaseOrder.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPurchaseOrder(tenantId: string, dto: any) {
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    return (prisma as any).purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        vendorName: dto.vendorName || 'Supplier',
        vendorPhone: dto.vendorPhone,
        vendorEmail: dto.vendorEmail,
        items: dto.items || [],
        subtotal: dto.subtotal || 0,
        taxTotal: dto.taxTotal || 0,
        total: dto.total || 0,
        status: 'ordered',
        notes: dto.notes,
      },
    });
  }

  async updatePurchaseOrderStatus(tenantId: string, poId: string, status: string) {
    const po = await (prisma as any).purchaseOrder.findFirst({ where: { id: poId, tenantId } });
    if (!po) throw new NotFoundException('PO not found.');

    if (status === 'received' && po.status !== 'received' && Array.isArray(po.items)) {
      for (const item of po.items) {
        if (item.productId && item.quantity) {
          await prisma.product.updateMany({
            where: { id: item.productId, tenantId },
            data: {
              stockInHand: { increment: Number(item.quantity) },
            } as any,
          });
        }
      }
    }

    return (prisma as any).purchaseOrder.update({
      where: { id: poId },
      data: {
        status,
        receivedAt: status === 'received' ? new Date() : undefined,
      },
    });
  }
}
