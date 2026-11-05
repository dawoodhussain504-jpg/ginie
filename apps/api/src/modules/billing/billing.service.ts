import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  CreateProductDto,
  CreateQuotationDto,
  CreateInvoiceDto,
} from '@ginie/common';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}
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

    // Deduct stock for quotation converted items
    for (const it of items) {
      const pId = (it as any).productId || (it as any).id;
      const qty = Number(it.quantity || 1);
      if (pId) {
        await prisma.product.updateMany({
          where: { id: pId, tenantId },
          data: { stockInHand: { decrement: qty } } as any,
        }).catch(() => null);
      }
    }

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

    const invoice = await prisma.invoice.create({
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

    // Real-Time ERP Inventory Sync: Deduct stockInHand for each sold item
    if (Array.isArray(dto.items)) {
      for (const it of dto.items) {
        const pId = (it as any).productId || (it as any).id;
        const qty = Number(it.quantity || 1);
        if (pId) {
          await prisma.product.updateMany({
            where: { id: pId, tenantId },
            data: { stockInHand: { decrement: qty } } as any,
          }).catch(() => null);
        } else if (it.name) {
          await prisma.product.updateMany({
            where: { name: it.name, tenantId },
            data: { stockInHand: { decrement: qty } } as any,
          }).catch(() => null);
        }
      }
    }

    return invoice;
  }

  async updateInvoiceStatus(tenantId: string, id: string, status: string) {
    const existing = await prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Invoice not found.');

    // If cancelling or voiding invoice, restore inventory stock
    if ((status === 'cancelled' || status === 'void') && existing.status !== 'cancelled' && existing.status !== 'void') {
      const items = Array.isArray(existing.items) ? (existing.items as any[]) : [];
      for (const it of items) {
        const pId = it.productId || it.id;
        const qty = Number(it.quantity || 1);
        if (pId) {
          await prisma.product.updateMany({
            where: { id: pId, tenantId },
            data: { stockInHand: { increment: qty } } as any,
          }).catch(() => null);
        } else if (it.name) {
          await prisma.product.updateMany({
            where: { name: it.name, tenantId },
            data: { stockInHand: { increment: qty } } as any,
          }).catch(() => null);
        }
      }
    }

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

    // If tenant has no products added yet, dynamically provide industry-appropriate starter catalog
    if (!tenant.products || tenant.products.length === 0) {
      const bType = tenant.businessType || 'retail';
      const starterItems: Record<string, any[]> = {
        restaurant: [
          { id: 'item-rest-1', name: 'Paneer Butter Masala', category: 'Main Course', price: 260, code: 'REST-01', unit: 'plate', stockInHand: 40, description: 'Rich cottage cheese cubes in buttery creamy tomato gravy (Veg)', isPublishedToStore: true },
          { id: 'item-rest-2', name: 'Butter Tandoori Naan', category: 'Breads', price: 45, code: 'REST-02', unit: 'piece', stockInHand: 100, description: 'Crisp hot tandoori bread topped with fresh butter (Veg)', isPublishedToStore: true },
          { id: 'item-rest-3', name: 'Dum Handi Veg Biryani', category: 'Biryani & Rice', price: 240, code: 'REST-03', unit: 'pot', stockInHand: 30, description: 'Aromatic basmati rice layered with fresh veggies & saffron (Veg)', isPublishedToStore: true },
          { id: 'item-rest-4', name: 'Cold Coffee with Ice Cream', category: 'Beverages', price: 110, code: 'REST-04', unit: 'glass', stockInHand: 50, description: 'Chilled creamy blended coffee topped with vanilla scoop', isPublishedToStore: true },
        ],
        wholesale: [
          { id: 'item-b2b-1', name: 'Heavy Duty Packaging Tape (Box of 72)', category: 'Packaging Materials', price: 3240, code: 'B2B-01', unit: 'box', stockInHand: 25, description: 'Brown self-adhesive 65m tape rolls for cartons (MOQ: 1 Box)', isPublishedToStore: true },
          { id: 'item-b2b-2', name: 'Plain Cotton Round-Neck T-Shirts (Lot of 50)', category: 'Apparel Bulk', price: 11500, code: 'B2B-02', unit: 'lot', stockInHand: 15, description: '180 GSM combed cotton bulk blanks (MOQ: 1 Lot)', isPublishedToStore: true },
          { id: 'item-b2b-3', name: 'A4 Copier Paper 75 GSM (Carton of 5 Reams)', category: 'Stationery', price: 1450, code: 'B2B-03', unit: 'carton', stockInHand: 35, description: 'Super bright high speed photocopy paper (MOQ: 2 Cartons)', isPublishedToStore: true },
        ],
        clinic: [
          { id: 'item-med-1', name: 'General Physician OPD Consultation', category: 'Doctor Consultation', price: 500, code: 'MED-01', unit: 'session', stockInHand: 100, description: 'Comprehensive diagnostic checkup & medical prescription', isPublishedToStore: true },
          { id: 'item-med-2', name: 'Complete Blood Count (CBC) Profile', category: 'Diagnostics & Pathology', price: 350, code: 'MED-02', unit: 'test', stockInHand: 100, description: 'Automated 24-parameter blood test report within 4 hours', isPublishedToStore: true },
          { id: 'item-med-3', name: 'Full Body Preventive Screening Package', category: 'Health Packages', price: 2499, code: 'MED-03', unit: 'package', stockInHand: 50, description: '65 vital health tests including Lipid, Liver, Kidney & Sugar', isPublishedToStore: true },
        ],
        services: [
          { id: 'item-srv-1', name: 'Social Media Management & Growth (Monthly)', category: 'Digital Marketing', price: 14999, code: 'SRV-01', unit: 'month', stockInHand: 20, description: '12 high quality graphic creatives + reel videos + ads management', isPublishedToStore: true },
          { id: 'item-srv-2', name: 'Company GST Filing & Accounting Retainer', category: 'Tax & Compliance', price: 2999, code: 'SRV-02', unit: 'month', stockInHand: 50, description: 'GSTR-1, GSTR-3B filing, reconciliation & monthly tax report', isPublishedToStore: true },
          { id: 'item-srv-3', name: 'Custom Business Website & Domain Setup', category: 'Web Development', price: 24999, code: 'SRV-03', unit: 'project', stockInHand: 10, description: 'Modern responsive Next.js website with lead capturing & SEO', isPublishedToStore: true },
        ],
        factory: [
          { id: 'item-mfg-1', name: 'Precision CNC Machined Aluminum Flange', category: 'Machined Components', price: 1850, code: 'MFG-01', unit: 'piece', stockInHand: 60, description: 'High tolerance aerospace grade 6061-T6 aluminum flange', isPublishedToStore: true },
          { id: 'item-mfg-2', name: 'Heavy Duty Industrial Ball Valve 2-Inch', category: 'Valves & Fittings', price: 4200, code: 'MFG-02', unit: 'piece', stockInHand: 30, description: 'Stainless steel 316 rated for 1000 WOG high pressure', isPublishedToStore: true },
          { id: 'item-mfg-3', name: 'Mild Steel Laser-Cut Mounting Bracket', category: 'Sheet Metal', price: 320, code: 'MFG-03', unit: 'piece', stockInHand: 150, description: '3mm hot rolled steel powder-coated black bracket', isPublishedToStore: true },
        ],
        automobile: [
          { id: 'item-auto-1', name: 'Comprehensive Periodic Car Service', category: 'Car Maintenance', price: 2999, code: 'AUTO-01', unit: 'service', stockInHand: 50, description: 'Engine oil replacement + 40-point safety check + brake inspection', isPublishedToStore: true },
          { id: 'item-auto-2', name: 'AC Gas Refill & Cooling System Flush', category: 'AC & Climate', price: 1499, code: 'AUTO-02', unit: 'service', stockInHand: 40, description: 'Complete AC refrigerant gas top-up with bacterial condenser disinfection', isPublishedToStore: true },
          { id: 'item-auto-3', name: 'Front Disc Brake Pads Replacement (OEM)', category: 'Brakes & Suspension', price: 1850, code: 'AUTO-03', unit: 'set', stockInHand: 25, description: 'Original ceramic disc brake pads with labor installation included', isPublishedToStore: true },
          { id: 'item-auto-4', name: 'Deep Foam Body Wash & Interior Detailing', category: 'Washing & Detailing', price: 799, code: 'AUTO-04', unit: 'vehicle', stockInHand: 100, description: 'High pressure snow foam body wash with interior vacuuming & dashboard polish', isPublishedToStore: true },
        ],
        pharmacy: [
          { id: 'item-pharma-1', name: 'Paracetamol 650mg Fast Relief (Strip of 15)', category: 'Fever & Pain Relief', price: 35, code: 'PHARMA-01', unit: 'strip', stockInHand: 200, description: 'Analgesic and antipyretic for fast fever and body ache relief (Rx)', isPublishedToStore: true },
          { id: 'item-pharma-2', name: 'Vitamin C 500mg + Zinc Immunity (60 Chewables)', category: 'Vitamins & Supplements', price: 240, code: 'PHARMA-02', unit: 'bottle', stockInHand: 80, description: 'Antioxidant immune booster chewable tablets for daily defense', isPublishedToStore: true },
          { id: 'item-pharma-3', name: 'Digital Infrared Non-Contact Thermometer', category: 'Medical Devices', price: 850, code: 'PHARMA-03', unit: 'piece', stockInHand: 30, description: '1-second instant fever scanner with color LCD display & fever alarm', isPublishedToStore: true },
          { id: 'item-pharma-4', name: 'Antiseptic First Aid Liquid 500ml', category: 'First Aid & Wound Care', price: 175, code: 'PHARMA-04', unit: 'bottle', stockInHand: 60, description: 'Hospital grade antibacterial disinfectant for cuts and abrasions', isPublishedToStore: true },
        ],
        jewellery: [
          { id: 'item-jewel-1', name: '22K BIS Hallmarked Solid Gold Rope Chain 10g', category: 'Gold Chains', price: 72500, code: 'JWL-01', unit: 'piece', stockInHand: 8, description: '916 Hallmark certified 22 karat yellow gold chain with certificate', isPublishedToStore: true },
          { id: 'item-jewel-2', name: 'Pure 999 Fine Silver Coin 50 Grams', category: 'Silver Coins & Bars', price: 4800, code: 'JWL-02', unit: 'coin', stockInHand: 50, description: 'Govt mint certified 99.9% pure silver coin in tamper-proof assay blister', isPublishedToStore: true },
          { id: 'item-jewel-3', name: '18K Yellow Gold Diamond Solitaire Ring 0.25ct', category: 'Diamond Rings', price: 38500, code: 'JWL-03', unit: 'ring', stockInHand: 12, description: 'IGI certified VVS-EF natural diamond set in classic 18 karat gold prong', isPublishedToStore: true },
          { id: 'item-jewel-4', name: 'Traditional 22K Gold Auspicious Mangalsutra 12g', category: 'Bridal & Traditional', price: 86900, code: 'JWL-04', unit: 'piece', stockInHand: 6, description: 'Intricate filigree work with black beads and BIS Hallmark seal', isPublishedToStore: true },
        ],
        salon: [
          { id: 'item-salon-1', name: 'Signature Executive Haircut & Beard Grooming', category: 'Hair & Beard', price: 450, code: 'SALON-01', unit: 'service', stockInHand: 100, description: 'Precision fade haircut + beard trim, contouring and soothing hot towel wrap', isPublishedToStore: true },
          { id: 'item-salon-2', name: 'Deep Hydrating Fruit Facial & De-Tan Therapy', category: 'Skin & Facial', price: 1200, code: 'SALON-02', unit: 'session', stockInHand: 80, description: '6-step antioxidant herbal fruit extract treatment to restore natural glow', isPublishedToStore: true },
          { id: 'item-salon-3', name: 'Moroccan Argan Oil Keratin Hair Spa (60 Mins)', category: 'Hair Treatments', price: 1800, code: 'SALON-03', unit: 'session', stockInHand: 50, description: 'Intense moisture repair treatment for frizz control and silky shine', isPublishedToStore: true },
          { id: 'item-salon-4', name: 'Complete Royal Bridal Glow Makeup Package', category: 'Bridal & Occasion', price: 8500, code: 'SALON-04', unit: 'package', stockInHand: 15, description: 'HD waterproof bridal makeup with hairstyling, draping & premium lashes', isPublishedToStore: true },
        ],
        education: [
          { id: 'item-edu-1', name: 'Class 10 CBSE Board Exam Prep Crash Course', category: 'School Boards', price: 4999, code: 'EDU-01', unit: 'course', stockInHand: 100, description: '3-month rigorous revision covering Maths, Science & English with test series', isPublishedToStore: true },
          { id: 'item-edu-2', name: 'IIT-JEE / NEET Foundation Physics & Chemistry', category: 'Competitive Exams', price: 24999, code: 'EDU-02', unit: 'annual', stockInHand: 50, description: '1-year comprehensive conceptual coaching with daily practice problems & DPPs', isPublishedToStore: true },
          { id: 'item-edu-3', name: 'Spoken English & Corporate Communication Mastery', category: 'Language & Skills', price: 2499, code: 'EDU-03', unit: 'batch', stockInHand: 80, description: '60 days interactive online/offline sessions for interview confidence & fluency', isPublishedToStore: true },
          { id: 'item-edu-4', name: 'Python Programming & AI Basics for Young Coders', category: 'Technology & Coding', price: 7999, code: 'EDU-04', unit: 'course', stockInHand: 40, description: 'Hands-on practical coding from scratch with 5 real-world mini-projects', isPublishedToStore: true },
        ],
        retail: [
          { id: 'item-ret-1', name: 'Premium Royal Basmati Rice (5kg Bag)', category: 'Groceries & Staples', price: 480, code: 'RET-01', unit: 'bag', stockInHand: 45, description: 'Extra long grain aged basmati rice for daily cooking', isPublishedToStore: true },
          { id: 'item-ret-2', name: 'Cold Pressed Pure Mustard Oil (1 Litre)', category: 'Cooking Oils', price: 195, code: 'RET-02', unit: 'bottle', stockInHand: 60, description: '100% natural kachi ghani unrefined mustard oil', isPublishedToStore: true },
          { id: 'item-ret-3', name: 'Wireless Bluetooth Earbuds with Mic', category: 'Electronics', price: 1299, code: 'RET-03', unit: 'piece', stockInHand: 25, description: 'Active environmental noise cancellation with 30hr battery', isPublishedToStore: true },
          { id: 'item-ret-4', name: 'Stainless Steel Insulated Water Bottle 1L', category: 'Home & Kitchen', price: 550, code: 'RET-04', unit: 'piece', stockInHand: 35, description: 'Double-walled vacuum insulated flask keeps liquids hot/cold for 24h', isPublishedToStore: true },
        ],
      };
      tenant.products = starterItems[bType] || starterItems.retail;
    }

    return tenant;
  }

  async checkCustomerLoyalty(slug: string, phone: string) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Store not found.');
    const rawDigits = (phone || '').replace(/\D/g, '');
    const phone10 = rawDigits.slice(-10);
    if (phone10.length !== 10) return { points: 0, customerName: null };

    const contact = await prisma.contact.findFirst({
      where: {
        tenantId: tenant.id,
        phone: { contains: phone10 },
      },
    });

    return {
      points: Number((contact as any)?.walletPoints || 0),
      customerName: contact?.name || null,
    };
  }

  async createStoreOrder(slug: string, orderDto: any) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Store not found.');

    const subtotal = Number(orderDto.subtotal || 0);
    const taxTotal = Number(orderDto.taxTotal || 0);
    const total = Number(orderDto.total || (subtotal + taxTotal));

    // Check loyalty points redemption
    const rawDigits = (orderDto.customerPhone || '').replace(/\D/g, '');
    const phone10 = rawDigits.slice(-10);
    let pointsRedeemed = 0;

    if (phone10.length === 10 && Number(orderDto.redeemPoints || 0) > 0) {
      try {
        const contact = await prisma.contact.findFirst({
          where: { tenantId: tenant.id, phone: { contains: phone10 } },
        });
        const available = Number((contact as any)?.walletPoints || 0);
        pointsRedeemed = Math.min(available, Math.floor(Number(orderDto.redeemPoints)), total);
        if (pointsRedeemed > 0 && contact) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { walletPoints: { decrement: pointsRedeemed } } as any,
          });
          await (prisma as any).loyaltyTransaction.create({
            data: {
              tenantId: tenant.id,
              contactId: contact.id,
              points: -pointsRedeemed,
              reason: `Redeemed discount on storefront order`,
            },
          }).catch(() => {});
        }
      } catch (_) {}
    }

    const finalTotal = Math.max(0, total - pointsRedeemed);
    const orderNotes = [
      orderDto.notes || '',
      pointsRedeemed > 0 ? `Redeemed ${pointsRedeemed} GINIE Loyalty Points (INR ${pointsRedeemed} discount)` : '',
    ].filter(Boolean).join(' | ');

    const order = await (prisma as any).storeOrder.create({
      data: {
        tenantId: tenant.id,
        customerName: orderDto.customerName || 'Store Customer',
        customerPhone: orderDto.customerPhone || '',
        customerAddress: orderDto.customerAddress || '',
        items: orderDto.items || [],
        subtotal,
        taxTotal,
        total: finalTotal,
        status: 'pending',
        paymentMethod: orderDto.paymentMethod || 'cod',
        paymentStatus: 'unpaid',
        notes: orderNotes,
      },
    });

    // 1. ERP Inventory Sync: Deduct stockInHand for ordered items
    for (const it of (orderDto.items || [])) {
      const pId = it.productId || it.id;
      if (pId && !pId.startsWith('item-')) {
        try {
          const p = await prisma.product.findUnique({ where: { id: pId } });
          if (p) {
            const qty = Math.max(1, Number(it.qty || it.quantity || 1));
            const newStock = Math.max(0, ((p as any).stockInHand || 0) - qty);
            await prisma.product.update({
              where: { id: p.id },
              data: { stockInHand: newStock } as any,
            });
          }
        } catch (_) {}
      }
    }

    // 2. CRM Sync: Contact Linking, 360° Activity Timeline & 5% Cashback Points
    if (phone10.length === 10) {
      try {
        let contact = await prisma.contact.findFirst({
          where: {
            tenantId: tenant.id,
            phone: { contains: phone10 },
          },
        });

        const pointsEarned = Math.max(10, Math.floor(total * 0.05)); // 5% cashback loyalty points

        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              tenantId: tenant.id,
              name: orderDto.customerName || 'Store Shopper',
              phone: `+91 ${phone10}`,
              address: orderDto.customerAddress || null,
              walletPoints: pointsEarned,
              status: 'active',
              tags: ['storefront-buyer'],
            } as any,
          });
        } else {
          contact = await prisma.contact.update({
            where: { id: contact.id },
            data: {
              walletPoints: { increment: pointsEarned },
              lastActiveAt: new Date(),
            } as any,
          });
        }

        // Record Loyalty Cashback Transaction
        await (prisma as any).loyaltyTransaction.create({
          data: {
            tenantId: tenant.id,
            contactId: contact.id,
            points: pointsEarned,
            reason: `Storefront order #${order.id.slice(-6)} 5% cashback`,
          },
        }).catch(() => {});

        // Record Activity in CRM 360° Customer Timeline
        await prisma.activity.create({
          data: {
            tenantId: tenant.id,
            entityType: 'contact',
            entityId: contact.id,
            type: 'status',
            content: `Placed Storefront Order #${order.id.slice(-6)} for INR ${total} (${(orderDto.items || []).length} items). Earned ${pointsEarned} loyalty cashback points.`,
          },
        }).catch(() => {});

        // Link to Sales Pipeline Deal
        const defaultPipeline = await prisma.pipeline.findFirst({
          where: { tenantId: tenant.id },
          include: { stages: { orderBy: { orderIndex: 'desc' }, take: 1 } },
        });
        if (defaultPipeline && defaultPipeline.stages.length > 0) {
          await prisma.deal.create({
            data: {
              tenantId: tenant.id,
              contactId: contact.id,
              pipelineId: defaultPipeline.id,
              stageId: defaultPipeline.stages[0].id,
              title: `Storefront Order - ${orderDto.customerName || 'Customer'}`,
              value: total,
              currency: 'INR',
              status: 'won',
            },
          }).catch(() => {});
        }
      } catch (crmErr: any) {
        console.warn('CRM sync error:', crmErr.message);
      }
    }

    // 3. CRM Lead creation
    if (orderDto.customerPhone || orderDto.customerName) {
      try {
        await prisma.lead.create({
          data: {
            tenantId: tenant.id,
            name: orderDto.customerName || 'Storefront Buyer',
            phone: orderDto.customerPhone || '',
            address: orderDto.customerAddress || '',
            source: 'Online Storefront',
            score: 90,
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
    const existingOrder = await (prisma as any).storeOrder.findUnique({
      where: { id: orderId },
    });
    const previousStatus = existingOrder?.status;

    const updated = await (prisma as any).storeOrder.update({
      where: { id: orderId },
      data: { status },
    });

    // 1. ERP Stock Auto-Restoration on Cancellation
    if (status === 'cancelled' && previousStatus !== 'cancelled' && existingOrder) {
      for (const it of (existingOrder.items || [])) {
        const pId = it.productId || it.id;
        if (pId && !pId.startsWith('item-')) {
          try {
            const p = await prisma.product.findUnique({ where: { id: pId } });
            if (p) {
              const qty = Math.max(1, Number(it.qty || it.quantity || 1));
              await prisma.product.update({
                where: { id: p.id },
                data: { stockInHand: ((p as any).stockInHand || 0) + qty } as any,
              });
            }
          } catch (_) {}
        }
      }

      // Log in Customer 360 Timeline
      const rawDigits = (existingOrder.customerPhone || '').replace(/\D/g, '');
      const phone10 = rawDigits.slice(-10);
      if (phone10.length === 10) {
        try {
          const contact = await prisma.contact.findFirst({
            where: { tenantId, phone: { contains: phone10 } },
          });
          if (contact) {
            await prisma.activity.create({
              data: {
                tenantId,
                entityType: 'contact',
                entityId: contact.id,
                type: 'status',
                content: `Storefront Order #${orderId.slice(-6)} was cancelled. Items restored to inventory.`,
              },
            });
          }
        } catch (_) {}
      }
    }

    // 2. When order is marked delivered, auto-generate official ERP Billing Invoice
    if (status === 'delivered') {
      try {
        const existingInvoice = await prisma.invoice.findFirst({
          where: { tenantId, notes: { contains: orderId } },
        });
        if (!existingInvoice) {
          const invNumber = `INV-${Date.now().toString().slice(-6)}`;
          await prisma.invoice.create({
            data: {
              tenantId,
              invoiceNumber: invNumber,
              items: updated.items || [],
              subtotal: updated.subtotal,
              taxTotal: updated.taxTotal,
              total: updated.total,
              status: 'paid',
              paidAt: new Date(),
              notes: `Auto-generated from Storefront Order #${orderId}`,
            },
          });
        }
      } catch (_) {}
    }

    return updated;
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
    const poNumber = dto.poNumber || `PO-${Date.now().toString().slice(-6)}`;
    const status = dto.status || 'ordered';
    const po = await (prisma as any).purchaseOrder.create({
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
        status,
        notes: dto.notes,
        receivedAt: status === 'received' ? new Date() : undefined,
      },
    });

    if (status === 'received' && Array.isArray(dto.items)) {
      for (const item of dto.items) {
        const pId = item.productId || item.id;
        const qty = Number(item.quantity || 1);
        if (pId) {
          await prisma.product.updateMany({
            where: { id: pId, tenantId },
            data: {
              stockInHand: { increment: qty },
            } as any,
          }).catch(() => null);
        }
      }
    }

    return po;
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

  // ========================================================
  // Direct WhatsApp Dispatch & Automation (Invoices & Quotes)
  // ========================================================
  async sendInvoiceWhatsApp(tenantId: string, invoiceId: string) {
    const invoice: any = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        contact: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice nahi mila.');
    }

    let customerPhone = '';
    let customerName = invoice.contact?.name || 'Customer';

    if (invoice.contact?.phone) {
      customerPhone = invoice.contact.phone.replace(/[^0-9]/g, '');
    }

    if (invoice.notes) {
      try {
        const parsed = JSON.parse(invoice.notes);
        if (parsed?.gstMeta?.customerPhone) {
          customerPhone = parsed.gstMeta.customerPhone.replace(/[^0-9]/g, '');
        }
        if (parsed?.gstMeta?.customerName) {
          customerName = parsed.gstMeta.customerName;
        }
      } catch {}
    }

    if (!customerPhone) {
      throw new BadRequestException('Is invoice me customer ka mobile number darj nahi hai.');
    }

    const cleanPhone = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;
    const companyName = invoice.tenant?.name || 'GINIE Business';
    const tenantSettings: any = invoice.tenant?.settings || {};
    const upiVpa = tenantSettings.upiId || tenantSettings.adminUpiVpa || '7870819862@paytm';
    const upiName = encodeURIComponent(tenantSettings.upiName || companyName);
    const amount = Number(invoice.total || 0);
    const upiNote = encodeURIComponent(`Bill ${invoice.invoiceNumber}`);
    const upiUri = `upi://pay?pa=${upiVpa}&pn=${upiName}&am=${amount.toFixed(2)}&cu=INR&tn=${upiNote}`;

    const items = Array.isArray(invoice.items) ? (invoice.items as any[]) : [];
    const itemsSummary = items
      .slice(0, 5)
      .map((it: any, idx: number) => `  ${idx + 1}. ${it.name || 'Item'} (x${it.quantity || 1}) - ₹${Number(it.total || (it.price * (it.quantity || 1))).toLocaleString('en-IN')}`)
      .join('\n');
    const extraItemsCount = items.length > 5 ? `\n  ... (+${items.length - 5} items)` : '';

    const isPaid = invoice.status === 'paid';

    const text =
`*🧾 TAX INVOICE: ${invoice.invoiceNumber}*
----------------------------------------
प्रिय *${customerName}* जी,
*${companyName}* से आपका बिल तैयार है:

*आइटम्स (Items):*
${itemsSummary || '  Standard Products & Services'}${extraItemsCount}

*कुल देय राशि (Total Amount):* ₹${amount.toLocaleString('en-IN')}
*बिल स्थिति (Status):* ${isPaid ? '✅ PAID (भुगतान प्राप्त)' : '⏳ PAYMENT DUE (भुगतान बाकी)'}
${!isPaid ? `
👉 *Pay Instantly via UPI (GPay/PhonePe/Paytm/BHIM):*
${upiUri}
` : ''}
धन्यवाद! 🙏
_${companyName} via GINIE Business OS_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    let sentViaAutomation = false;
    let errorDetail: string | null = null;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
        contactId: invoice.contactId || undefined,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not active';
      this.logger.warn(`Could not dispatch automated WhatsApp invoice: ${errorDetail}`);
    }

    return {
      success: true,
      sentViaAutomation,
      phone: cleanPhone,
      customerName,
      invoiceNumber: invoice.invoiceNumber,
      amount,
      messagePreview: text,
      waClickUrl,
      errorDetail,
    };
  }

  async sendInvoiceReminderWhatsApp(tenantId: string, invoiceId: string) {
    const invoice: any = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        contact: true,
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice nahi mila.');
    }

    let customerPhone = '';
    let customerName = invoice.contact?.name || 'Customer';

    if (invoice.contact?.phone) {
      customerPhone = invoice.contact.phone.replace(/[^0-9]/g, '');
    }

    if (invoice.notes) {
      try {
        const parsed = JSON.parse(invoice.notes);
        if (parsed?.gstMeta?.customerPhone) {
          customerPhone = parsed.gstMeta.customerPhone.replace(/[^0-9]/g, '');
        }
        if (parsed?.gstMeta?.customerName) {
          customerName = parsed.gstMeta.customerName;
        }
      } catch {}
    }

    if (!customerPhone) {
      throw new BadRequestException('Is invoice me customer ka phone number darj nahi hai.');
    }

    const cleanPhone = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;
    const companyName = invoice.tenant?.name || 'GINIE Business';
    const tenantSettings: any = invoice.tenant?.settings || {};
    const upiVpa = tenantSettings.upiId || tenantSettings.adminUpiVpa || '7870819862@paytm';
    const upiName = encodeURIComponent(tenantSettings.upiName || companyName);
    const amount = Number(invoice.total || 0);
    const upiNote = encodeURIComponent(`Bill ${invoice.invoiceNumber}`);
    const upiUri = `upi://pay?pa=${upiVpa}&pn=${upiName}&am=${amount.toFixed(2)}&cu=INR&tn=${upiNote}`;

    const text =
`*⏰ PAYMENT REMINDER (तकादा)*
----------------------------------------
नमस्ते *${customerName}* जी,

आपके बिल *#${invoice.invoiceNumber}* की राशि *₹${amount.toLocaleString('en-IN')}* का भुगतान बाकी है।

👉 *Direct UPI से तुरंत भुगतान करने के लिए इस लिंक पर क्लिक करें:*
${upiUri}

_यदि आपने पहले ही भुगतान कर दिया है, तो कृपया इस संदेश को अनदेखा करें।_
धन्यवाद! 🙏
_${companyName} via GINIE Business OS_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    let sentViaAutomation = false;
    let errorDetail: string | null = null;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
        contactId: invoice.contactId || undefined,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not active';
      this.logger.warn(`Could not dispatch automated WhatsApp payment reminder: ${errorDetail}`);
    }

    return {
      success: true,
      sentViaAutomation,
      phone: cleanPhone,
      customerName,
      invoiceNumber: invoice.invoiceNumber,
      amount,
      messagePreview: text,
      waClickUrl,
      errorDetail,
    };
  }

  async sendQuotationWhatsApp(tenantId: string, quotationId: string) {
    const quotation: any = await prisma.quotation.findFirst({
      where: { id: quotationId, tenantId },
      include: {
        contact: true,
        tenant: { select: { name: true, settings: true } },
      },
    });
    if (!quotation) throw new NotFoundException('Quotation nahi mila.');

    let customerPhone = quotation.contact?.phone?.replace(/[^0-9]/g, '') || '';
    let customerName = quotation.contact?.name || 'Customer';

    if (quotation.notes) {
      try {
        const parsed = JSON.parse(quotation.notes);
        if (parsed?.customerPhone) customerPhone = parsed.customerPhone.replace(/[^0-9]/g, '');
        if (parsed?.customerName) customerName = parsed.customerName;
      } catch {}
    }

    if (!customerPhone) {
      throw new BadRequestException('Customer ka phone number darj nahi hai.');
    }

    const cleanPhone = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;
    const companyName = quotation.tenant?.name || 'GINIE Business';
    const amount = Number(quotation.total || 0);

    const items = Array.isArray(quotation.items) ? (quotation.items as any[]) : [];
    const itemsSummary = items
      .map((it: any, idx: number) => `  ${idx + 1}. ${it.name || 'Item'} (x${it.quantity || 1}) - ₹${Number(it.total || (it.price * (it.quantity || 1))).toLocaleString('en-IN')}`)
      .join('\n');

    const text =
`*📋 PRICE ESTIMATE / QUOTATION: ${quotation.quotationNumber}*
----------------------------------------
नमस्ते *${customerName}* जी,
*${companyName}* की तरफ से आपका कोटेशन तैयार है:

*प्रस्तावित वस्तुएं (Items):*
${itemsSummary || '  Standard Services'}

*कुल अनुमानित राशि (Total Amount):* ₹${amount.toLocaleString('en-IN')}

_यह कोटेशन 15 दिनों के लिए मान्य है।_
कृपया इसकी पुष्टि करें ताकि हम काम शुरू कर सकें।
धन्यवाद! 🙏
_${companyName} via GINIE Business OS_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    let sentViaAutomation = false;
    let errorDetail: string | null = null;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
        contactId: quotation.contactId || undefined,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not active';
    }

    return {
      success: true,
      sentViaAutomation,
      phone: cleanPhone,
      customerName,
      messagePreview: text,
      waClickUrl,
      errorDetail,
    };
  }

  async sendStoreOrderWhatsApp(tenantId: string, orderId: string) {
    const order = await (prisma as any).storeOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        tenant: { select: { name: true, phone: true } },
      },
    });

    if (!order) throw new NotFoundException('Store order nahi mila.');
    const rawDigits = (order.customerPhone || '').replace(/\D/g, '');
    if (!rawDigits) throw new BadRequestException('Customer ka phone number nahi mila.');
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const companyName = order.tenant?.name || 'GINIE Store';

    const items = Array.isArray(order.items) ? (order.items as any[]) : [];
    const itemsList = items
      .map((it: any, idx: number) => `  ${idx + 1}. ${it.name || 'Item'} x ${it.qty || it.quantity || 1}`)
      .join('\n');

    const statusHindi =
      order.status === 'confirmed' ? 'स्वीकृत (Confirmed)' :
      order.status === 'delivered' ? 'वितरित (Delivered)' :
      order.status === 'cancelled' ? 'रद्द (Cancelled)' : 'प्राप्त हुआ (Received)';

    const text =
`*🛍️ DIGITAL STORE ORDER UPDATE*
----------------------------------------
नमस्ते *${order.customerName}* जी!
*${companyName}* से आपके ऑर्डर का ताजा स्टेटस:

*ऑर्डर आईडी:* #${order.id.slice(-6).toUpperCase()}
*स्थिति (Status):* ${statusHindi}
*कुल राशि:* ₹${Number(order.total || 0).toLocaleString('en-IN')}

*ऑर्डर आइटम:*
${itemsList || '  Order items'}

धन्यवाद! हम आपके ऑर्डर को बेहतरीन सेवा के साथ पूरा कर रहे हैं।
_${companyName} via GINIE Business OS_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    let sentViaAutomation = false;
    let errorDetail: string | null = null;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not active';
    }

    return {
      success: true,
      sentViaAutomation,
      phone: cleanPhone,
      messagePreview: text,
      waClickUrl,
      errorDetail,
    };
  }
}

