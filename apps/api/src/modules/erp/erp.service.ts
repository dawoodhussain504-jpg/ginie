import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  CreateKhataAccountDto,
  CreateKhataEntryDto,
  CreateProductBatchDto,
  CreateJobCardDto,
  CreateDoctorPrescriptionDto,
} from '@ginie/common';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class ErpService {
  private readonly logger = new Logger(ErpService.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}

  // ========================================================
  // 1. Digital Udhari Khata & Party Ledger (खाता बही)
  // ========================================================
  async getKhataAccounts(tenantId: string, partyType?: string) {
    const where: any = { tenantId };
    if (partyType) where.partyType = partyType;

    const accounts = await prisma.khataAccount.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        entries: {
          take: 1,
          orderBy: { date: 'desc' },
          select: { date: true, type: true, amount: true },
        },
      },
    });

    return accounts.map((acc) => ({
      ...acc,
      currentBalance: Number(acc.currentBalance),
      creditLimit: Number(acc.creditLimit),
      lastTransaction: acc.entries[0] || null,
    }));
  }

  async getKhataAccountById(tenantId: string, id: string) {
    const acc = await prisma.khataAccount.findFirst({
      where: { id, tenantId },
      include: {
        entries: {
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!acc) throw new NotFoundException('Khata Account not found');
    return {
      ...acc,
      currentBalance: Number(acc.currentBalance),
      creditLimit: Number(acc.creditLimit),
      entries: acc.entries.map((e) => ({
        ...e,
        amount: Number(e.amount),
        balanceAfter: Number(e.balanceAfter),
      })),
    };
  }

  async createKhataAccount(tenantId: string, dto: CreateKhataAccountDto) {
    const cleanPhone = dto.partyPhone.replace(/\D/g, '').slice(-10);

    const account = await prisma.khataAccount.create({
      data: {
        tenantId,
        partyName: dto.partyName.trim(),
        partyPhone: cleanPhone,
        partyType: dto.partyType,
        contactId: dto.contactId || null,
        currentBalance: dto.openingBalance || 0,
        creditLimit: dto.creditLimit || 50000,
        status: 'active',
      },
    });

    // If opening balance > 0, record initial entry
    if (dto.openingBalance && dto.openingBalance !== 0) {
      await prisma.khataEntry.create({
        data: {
          tenantId,
          accountId: account.id,
          type: dto.openingBalance > 0 ? 'debit' : 'credit',
          amount: Math.abs(dto.openingBalance),
          balanceAfter: dto.openingBalance,
          description: 'Opening Balance (आरंभिक शेष)',
          paymentMethod: 'cash',
        },
      });
    }

    return account;
  }

  async addKhataEntry(tenantId: string, dto: CreateKhataEntryDto) {
    const account = await prisma.khataAccount.findFirst({
      where: { id: dto.accountId, tenantId },
    });
    if (!account) throw new NotFoundException('Khata Account not found');

    const currentBal = Number(account.currentBalance);
    const amount = Number(dto.amount);

    // If type == debit (gave/उधार), customer owes more => balance increases (+ amount)
    // If type == credit (received/जमा), customer paid => balance decreases (- amount)
    const newBalance = dto.type === 'debit' ? currentBal + amount : currentBal - amount;

    const entry = await prisma.khataEntry.create({
      data: {
        tenantId,
        accountId: dto.accountId,
        type: dto.type,
        amount,
        balanceAfter: newBalance,
        date: dto.date ? new Date(dto.date) : new Date(),
        description: dto.description?.trim() || (dto.type === 'debit' ? 'Mal Udhar Diya' : 'Rashi Prapt Hui'),
        paymentMethod: dto.paymentMethod || 'cash',
        invoiceId: dto.invoiceId || null,
      },
    });

    await prisma.khataAccount.update({
      where: { id: dto.accountId },
      data: { currentBalance: newBalance },
    });

    return {
      ...entry,
      amount: Number(entry.amount),
      balanceAfter: Number(entry.balanceAfter),
      newBalance,
    };
  }

  async sendKhataReminderWhatsApp(tenantId: string, accountId: string) {
    const account = await prisma.khataAccount.findFirst({
      where: { id: accountId, tenantId },
      include: {
        tenant: {
          select: { name: true, settings: true },
        },
      },
    });
    if (!account) throw new NotFoundException('Khata Account not found');

    const balance = Number(account.currentBalance);
    const companyName = account.tenant.name || 'Our Company';
    const compSettings: any = account.tenant.settings || {};
    const upiId = compSettings.upiId || '7870819862@paytm';
    const upiName = compSettings.upiName || companyName;

    let cleanPhone = account.partyPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${balance}&cu=INR`;

    const text = `🙏 *${companyName}*
📜 *बकाया भुगतान सूचना / Payment Reminder*
━━━━━━━━━━━━━━━━━━━━
👤 *ग्राहक (Customer):* ${account.partyName}
📞 *Mobile:* ${account.partyPhone}
━━━━━━━━━━━━━━━━━━━━
💰 *कुल बकाया राशि (Outstanding Balance): ₹${balance.toLocaleString('en-IN')}*

कृपया नीचे दिए गए UPI विवरण द्वारा भुगतान करें:
💳 *UPI ID:* ${upiId} (${upiName})

📲 *Direct Payment Link (Click to Pay):*
${upiUri}

_यदि आपने पहले ही भुगतान कर दिया है, तो कृपया इस संदेश को अनदेखा करें।_
धन्यवाद! 🙏
_${companyName} via GINIE Business OS_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    let sentViaAutomation = false;
    let errorDetail = null;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not connected';
      this.logger.warn(`Could not dispatch automated WhatsApp khata reminder: ${errorDetail}`);
    }

    return {
      success: true,
      sentViaAutomation,
      waClickUrl,
      phone: cleanPhone,
      balance,
      messagePreview: text,
      errorDetail,
    };
  }

  // ========================================================
  // 2. Vendor Purchases & Mal Inward (खरीद व स्टॉक आवक)
  // ========================================================
  async getPurchaseOrders(tenantId: string) {
    const orders = await prisma.purchaseOrder.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      taxTotal: Number(o.taxTotal),
      total: Number(o.total),
    }));
  }

  async createPurchaseOrder(tenantId: string, dto: any) {
    const poNumber = dto.poNumber || `PO-${Date.now().toString().slice(-6)}`;
    const status = dto.status || 'ordered';

    const po = await prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        vendorName: dto.vendorName || 'Supplier',
        vendorPhone: dto.vendorPhone || null,
        vendorEmail: dto.vendorEmail || null,
        items: dto.items || [],
        subtotal: dto.subtotal || 0,
        taxTotal: dto.taxTotal || 0,
        total: dto.total || 0,
        status,
        notes: dto.notes || null,
        receivedAt: status === 'received' ? new Date() : null,
      },
    });

    // If marked received immediately, auto-increment product stockInHand!
    if (status === 'received' && Array.isArray(dto.items)) {
      for (const item of dto.items) {
        const pId = item.productId || item.id;
        const qty = Number(item.quantity || 1);
        if (pId) {
          await prisma.product.updateMany({
            where: { id: pId, tenantId },
            data: {
              stockInHand: { increment: qty },
            },
          });
        }
      }
    }

    return po;
  }

  async receivePurchaseOrder(tenantId: string, poId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');

    if (po.status === 'received') {
      throw new BadRequestException('Order has already been received into stock');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'received',
        receivedAt: new Date(),
      },
    });

    // Increment inventory stock
    const items = (po.items as any[]) || [];
    for (const it of items) {
      const pId = it.productId || it.id;
      const qty = Number(it.quantity || 1);
      if (pId) {
        await prisma.product.updateMany({
          where: { id: pId, tenantId },
          data: { stockInHand: { increment: qty } },
        });
      }
    }

    return updated;
  }

  // ========================================================
  // 3. Product Batches & Expiry Management (बैच व एक्सपायरी)
  // ========================================================
  async getProductBatches(tenantId: string, productId?: string) {
    const where: any = { tenantId };
    if (productId) where.productId = productId;

    const batches = await prisma.productBatch.findMany({
      where,
      orderBy: { expDate: 'asc' },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
      },
    });

    const now = new Date();
    return batches.map((b) => {
      const diffDays = Math.ceil((new Date(b.expDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...b,
        purchasePrice: Number(b.purchasePrice || 0),
        mrp: Number(b.mrp || 0),
        sellingPrice: Number(b.sellingPrice || 0),
        daysUntilExpiry: diffDays,
        isExpired: diffDays <= 0,
        isExpiringSoon: diffDays > 0 && diffDays <= 30,
      };
    });
  }

  async createProductBatch(tenantId: string, dto: CreateProductBatchDto) {
    const batch = await prisma.productBatch.create({
      data: {
        tenantId,
        productId: dto.productId,
        batchNumber: dto.batchNumber.trim().toUpperCase(),
        mfgDate: dto.mfgDate ? new Date(dto.mfgDate) : null,
        expDate: new Date(dto.expDate),
        quantity: dto.quantity,
        purchasePrice: dto.purchasePrice || null,
        mrp: dto.mrp || null,
        sellingPrice: dto.sellingPrice || null,
      },
    });

    // Also increment product stock
    await prisma.product.updateMany({
      where: { id: dto.productId, tenantId },
      data: { stockInHand: { increment: dto.quantity } },
    });

    return batch;
  }

  // ========================================================
  // 4. Trade Superpowers: Automobile Job Card (जॉब कार्ड)
  // ========================================================
  async getJobCards(tenantId: string) {
    return prisma.jobCard.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJobCard(tenantId: string, dto: CreateJobCardDto) {
    const jobNumber = `JC-${Date.now().toString().slice(-6)}`;
    const cleanPhone = dto.customerPhone.replace(/\D/g, '').slice(-10);

    return prisma.jobCard.create({
      data: {
        tenantId,
        jobNumber,
        customerName: dto.customerName.trim(),
        customerPhone: cleanPhone,
        vehicleNumber: dto.vehicleNumber.trim().toUpperCase(),
        vehicleModel: dto.vehicleModel.trim(),
        kmReading: dto.kmReading || null,
        fuelLevel: dto.fuelLevel || '50%',
        complaints: dto.complaints || [],
        estimatedCost: dto.estimatedCost || 0,
        assignedTechnician: dto.assignedTechnician?.trim() || null,
        status: 'in_progress',
      },
    });
  }

  async updateJobCardStatus(tenantId: string, id: string, status: string) {
    return prisma.jobCard.update({
      where: { id },
      data: {
        status,
        deliveredAt: status === 'delivered' ? new Date() : undefined,
      },
    });
  }

  async sendJobCardWhatsApp(tenantId: string, id: string) {
    const jc = await prisma.jobCard.findFirst({
      where: { id, tenantId },
      include: { tenant: { select: { name: true } } },
    });
    if (!jc) throw new NotFoundException('Job card not found');

    const companyName = jc.tenant.name || 'Auto Workshop';
    let cleanPhone = jc.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const statusHindi =
      jc.status === 'ready'
        ? 'गाड़ी सर्विस होकर तैयार है (Ready for Delivery)'
        : jc.status === 'delivered'
        ? 'गाड़ी सुपुर्द कर दी गई (Delivered)'
        : 'कार्य प्रगति पर है (Work in Progress)';

    const text = `🔧 *${companyName}*
📋 *वाहन सर्विस जॉब कार्ड / Service Update*
━━━━━━━━━━━━━━━━━━━━
👤 *ग्राहक:* ${jc.customerName}
🚗 *वाहन नंबर:* ${jc.vehicleNumber} (${jc.vehicleModel})
🔖 *जॉब कार्ड नं:* ${jc.jobNumber}
📊 *वर्तमान स्थिति:* ${statusHindi}
💰 *अनुमानित खर्च:* ₹${Number(jc.estimatedCost).toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
धन्यवाद! 🙏
_${companyName} Auto Care_`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
      });
    } catch {}

    return { success: true, waClickUrl, text };
  }

  // ========================================================
  // 5. Trade Superpowers: Doctor Prescription (Clinic Rx)
  // ========================================================
  async getDoctorPrescriptions(tenantId: string) {
    return prisma.doctorPrescription.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDoctorPrescription(tenantId: string, dto: CreateDoctorPrescriptionDto) {
    const rxNumber = `RX-${Date.now().toString().slice(-6)}`;
    const cleanPhone = dto.patientPhone.replace(/\D/g, '').slice(-10);

    return prisma.doctorPrescription.create({
      data: {
        tenantId,
        rxNumber,
        patientName: dto.patientName.trim(),
        patientPhone: cleanPhone,
        patientAge: dto.patientAge || null,
        patientGender: dto.patientGender || null,
        symptoms: dto.symptoms || null,
        diagnosis: dto.diagnosis || null,
        medicines: dto.medicines || [],
        testsAdvised: dto.testsAdvised || null,
        nextVisitDate: dto.nextVisitDate ? new Date(dto.nextVisitDate) : null,
        consultationFee: dto.consultationFee || 0,
      },
    });
  }

  async sendPrescriptionWhatsApp(tenantId: string, id: string) {
    const rx = await prisma.doctorPrescription.findFirst({
      where: { id, tenantId },
      include: { tenant: { select: { name: true } } },
    });
    if (!rx) throw new NotFoundException('Prescription not found');

    const clinicName = rx.tenant.name || 'Healthcare Clinic';
    let cleanPhone = rx.patientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const medsList = Array.isArray(rx.medicines)
      ? (rx.medicines as any[])
          .map((m, idx) => `${idx + 1}. *${m.name}* — ${m.dosage} (${m.days} दिन) ${m.notes ? `[${m.notes}]` : ''}`)
          .join('\n')
      : 'Consultation recorded';

    const text = `🏥 *${clinicName}*
🩺 *डिजिटल पर्चा / Doctor Prescription*
━━━━━━━━━━━━━━━━━━━━
👤 *मरीज (Patient):* ${rx.patientName} (${rx.patientAge ? `${rx.patientAge} Yrs` : ''} ${rx.patientGender || ''})
🔖 *पर्चा संख्या (Rx No):* ${rx.rxNumber}
📅 *दिनांक:* ${new Date(rx.createdAt).toLocaleDateString('en-IN')}
${rx.diagnosis ? `🔍 *रोग निदान (Diagnosis):* ${rx.diagnosis}\n` : ''}━━━━━━━━━━━━━━━━━━━━
💊 *दवाइयों की सूची व खुराक (Prescription):*
${medsList}
━━━━━━━━━━━━━━━━━━━━
${rx.testsAdvised ? `🧪 *जांच (Tests Advised):* ${rx.testsAdvised}\n` : ''}${rx.nextVisitDate ? `🗓️ *अगली मुलाकात (Follow-up):* ${new Date(rx.nextVisitDate).toLocaleDateString('en-IN')}\n` : ''}जल्द स्वस्थ होने की कामना करते हैं! 🙏`;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    try {
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
      });
    } catch {}

    return { success: true, waClickUrl, text };
  }
}
