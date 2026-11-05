import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  BulkAttendanceDto,
  CreateStaffAdvanceDto,
  SettlePayrollDto,
} from '@ginie/common';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}

  // ----------------------------------------------------
  // 1. Employee Master Directory
  // ----------------------------------------------------
  async getEmployees(tenantId: string) {
    const employees = await prisma.employee.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        advances: {
          where: { isSettled: false },
          select: { amount: true },
        },
      },
    });

    return employees.map((emp) => {
      const pendingAdvances = emp.advances.reduce(
        (sum, adv) => sum + Number(adv.amount || 0),
        0,
      );
      return {
        ...emp,
        baseSalary: Number(emp.baseSalary),
        commissionPct: Number(emp.commissionPct),
        pendingAdvances,
      };
    });
  }

  async getEmployeeById(tenantId: string, id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        advances: { orderBy: { date: 'desc' } },
        payrollRecords: { orderBy: { year: 'desc', month: 'desc' } },
      },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const cleanPhone = dto.phone.replace(/\D/g, '').slice(-10);
    return prisma.employee.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        phone: cleanPhone,
        email: dto.email?.trim() || null,
        role: dto.role.trim(),
        department: dto.department?.trim() || null,
        salaryType: dto.salaryType,
        baseSalary: dto.baseSalary,
        commissionPct: dto.commissionPct || 0,
        upiId: dto.upiId?.trim() || null,
        bankAccount: dto.bankAccount?.trim() || null,
        bankIfsc: dto.bankIfsc?.trim() || null,
        status: dto.status,
        notes: dto.notes?.trim() || null,
      },
    });
  }

  async updateEmployee(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    const existing = await prisma.employee.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    const cleanPhone = dto.phone ? dto.phone.replace(/\D/g, '').slice(-10) : undefined;

    return prisma.employee.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(cleanPhone && { phone: cleanPhone }),
        ...(dto.email !== undefined && { email: dto.email?.trim() || null }),
        ...(dto.role && { role: dto.role.trim() }),
        ...(dto.department !== undefined && { department: dto.department?.trim() || null }),
        ...(dto.salaryType && { salaryType: dto.salaryType }),
        ...(dto.baseSalary !== undefined && { baseSalary: dto.baseSalary }),
        ...(dto.commissionPct !== undefined && { commissionPct: dto.commissionPct }),
        ...(dto.upiId !== undefined && { upiId: dto.upiId?.trim() || null }),
        ...(dto.bankAccount !== undefined && { bankAccount: dto.bankAccount?.trim() || null }),
        ...(dto.bankIfsc !== undefined && { bankIfsc: dto.bankIfsc?.trim() || null }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
      },
    });
  }

  async deleteEmployee(tenantId: string, id: string) {
    const existing = await prisma.employee.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }
    return prisma.employee.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------
  // 2. Daily Attendance & Overtime Tracker
  // ----------------------------------------------------
  async getDailyAttendance(tenantId: string, dateStr: string) {
    const targetDate = new Date(`${dateStr.split('T')[0]}T00:00:00.000Z`);

    const employees = await prisma.employee.findMany({
      where: { tenantId, status: 'active' },
      orderBy: { name: 'asc' },
    });

    const attendances = await prisma.employeeAttendance.findMany({
      where: {
        tenantId,
        date: targetDate,
      },
    });

    const attendanceMap = new Map<string, (typeof attendances)[0]>();
    attendances.forEach((att) => attendanceMap.set(att.employeeId, att));

    return employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      return {
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.department,
        salaryType: emp.salaryType,
        baseSalary: Number(emp.baseSalary),
        phone: emp.phone,
        status: att ? att.status : 'present', // default present
        overtimeHours: att ? att.overtimeHours : 0,
        notes: att?.notes || '',
        isMarked: !!att,
      };
    });
  }

  async markBulkAttendance(tenantId: string, dto: BulkAttendanceDto) {
    const targetDate = new Date(`${dto.date.split('T')[0]}T00:00:00.000Z`);

    const results = [];
    for (const record of dto.records) {
      const att = await prisma.employeeAttendance.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: record.employeeId,
            date: targetDate,
          },
        },
        update: {
          status: record.status,
          overtimeHours: record.overtimeHours || 0,
          notes: record.notes || null,
        },
        create: {
          tenantId,
          employeeId: record.employeeId,
          date: targetDate,
          status: record.status,
          overtimeHours: record.overtimeHours || 0,
          notes: record.notes || null,
        },
      });
      results.push(att);
    }

    return {
      success: true,
      count: results.length,
      date: dto.date,
    };
  }

  // ----------------------------------------------------
  // 3. Staff Advances & Khata Ledger
  // ----------------------------------------------------
  async getAdvances(tenantId: string, employeeId?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;

    const list = await prisma.employeeAdvance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, phone: true, role: true },
        },
      },
    });

    return list.map((a) => ({
      ...a,
      amount: Number(a.amount),
    }));
  }

  async createAdvance(tenantId: string, dto: CreateStaffAdvanceDto) {
    const employee = await prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const date = dto.date ? new Date(dto.date) : new Date();

    return prisma.employeeAdvance.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        amount: dto.amount,
        reason: dto.reason?.trim() || 'Staff Advance',
        date,
        isSettled: false,
      },
    });
  }

  async deleteAdvance(tenantId: string, id: string) {
    const adv = await prisma.employeeAdvance.findFirst({
      where: { id, tenantId },
    });
    if (!adv) {
      throw new NotFoundException('Advance record not found');
    }
    if (adv.isSettled) {
      throw new BadRequestException('Cannot delete an already settled advance record');
    }
    return prisma.employeeAdvance.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------
  // 4. Monthly Payroll Calculation & Payouts
  // ----------------------------------------------------
  async getPayrollRecords(tenantId: string, month: number, year: number) {
    const records = await prisma.payrollRecord.findMany({
      where: { tenantId, month, year },
      include: {
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((rec) => ({
      ...rec,
      basePay: Number(rec.basePay),
      overtimePay: Number(rec.overtimePay),
      commissionPay: Number(rec.commissionPay),
      advancesDeducted: Number(rec.advancesDeducted),
      netPayable: Number(rec.netPayable),
      employee: {
        ...rec.employee,
        baseSalary: Number(rec.employee.baseSalary),
        commissionPct: Number(rec.employee.commissionPct),
      },
    }));
  }

  async generateMonthlyPayroll(tenantId: string, month: number, year: number) {
    const employees = await prisma.employee.findMany({
      where: { tenantId, status: 'active' },
    });

    // Start date and End date for the given month (UTC)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59));

    const generatedRecords = [];

    for (const emp of employees) {
      // 1. Fetch attendance records in this month
      const attendances = await prisma.employeeAttendance.findMany({
        where: {
          tenantId,
          employeeId: emp.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      let presentDays = 0;
      let halfDays = 0;
      let absentDays = 0;
      let overtimeHours = 0;

      attendances.forEach((att) => {
        if (att.status === 'present' || att.status === 'paid_leave') {
          presentDays += 1;
        } else if (att.status === 'half_day') {
          halfDays += 1;
        } else if (att.status === 'absent') {
          absentDays += 1;
        }
        overtimeHours += Number(att.overtimeHours || 0);
      });

      // Effective worked days
      const effectiveDays = presentDays + halfDays * 0.5;
      const baseSalary = Number(emp.baseSalary);

      // 2. Base pay calculation
      let calculatedBasePay = 0;
      if (emp.salaryType === 'daily') {
        // Daily wage: Effective days * Daily wage
        calculatedBasePay = effectiveDays * baseSalary;
      } else if (emp.salaryType === 'hourly') {
        // Hourly: Overtime/Hours * Base hourly rate
        calculatedBasePay = overtimeHours * baseSalary;
      } else {
        // Monthly fixed: Pro-rata based on month days (default 30 days)
        const dailyRate = baseSalary / (daysInMonth || 30);
        calculatedBasePay = Math.round(dailyRate * effectiveDays);
      }

      // 3. Overtime Pay: (Base Salary / 30 / 8) * 1.5 * overtimeHours
      let calculatedOtPay = 0;
      if (emp.salaryType !== 'hourly' && overtimeHours > 0) {
        const hourlyRate = (baseSalary / 30) / 8;
        calculatedOtPay = Math.round(hourlyRate * 1.5 * overtimeHours);
      }

      // 4. Advances deduction: fetch unsettled advances up to end of month
      const unsettledAdvances = await prisma.employeeAdvance.findMany({
        where: {
          tenantId,
          employeeId: emp.id,
          isSettled: false,
          date: { lte: endDate },
        },
      });

      const totalAdvance = unsettledAdvances.reduce(
        (sum, a) => sum + Number(a.amount || 0),
        0,
      );

      const grossEarnings = calculatedBasePay + calculatedOtPay;
      // Deduct advance but not more than gross earnings
      const advanceDeduction = Math.min(grossEarnings, totalAdvance);
      const netPayable = Math.max(0, grossEarnings - advanceDeduction);

      const record = await prisma.payrollRecord.upsert({
        where: {
          tenantId_employeeId_month_year: {
            tenantId,
            employeeId: emp.id,
            month,
            year,
          },
        },
        update: {
          totalDays: daysInMonth,
          presentDays,
          halfDays,
          absentDays,
          overtimeHours,
          basePay: calculatedBasePay,
          overtimePay: calculatedOtPay,
          advancesDeducted: advanceDeduction,
          netPayable,
        },
        create: {
          tenantId,
          employeeId: emp.id,
          month,
          year,
          totalDays: daysInMonth,
          presentDays,
          halfDays,
          absentDays,
          overtimeHours,
          basePay: calculatedBasePay,
          overtimePay: calculatedOtPay,
          commissionPay: 0,
          advancesDeducted: advanceDeduction,
          netPayable,
          status: 'pending',
        },
      });

      generatedRecords.push(record);
    }

    return this.getPayrollRecords(tenantId, month, year);
  }

  async settlePayroll(tenantId: string, payrollId: string, dto: SettlePayrollDto) {
    const record = await prisma.payrollRecord.findFirst({
      where: { id: payrollId, tenantId },
      include: { employee: true },
    });
    if (!record) {
      throw new NotFoundException('Payroll record not found');
    }

    const updated = await prisma.payrollRecord.update({
      where: { id: payrollId },
      data: {
        status: 'paid',
        paymentMethod: dto.paymentMethod,
        paymentRef: dto.paymentRef || null,
        notes: dto.notes || null,
        paidAt: new Date(),
      },
    });

    // Mark unsettled advances for this employee as settled if deductions were made
    if (Number(record.advancesDeducted) > 0) {
      await prisma.employeeAdvance.updateMany({
        where: {
          tenantId,
          employeeId: record.employeeId,
          isSettled: false,
        },
        data: {
          isSettled: true,
          settledPayrollId: payrollId,
        },
      });
    }

    return updated;
  }

  // ----------------------------------------------------
  // 5. WhatsApp Salary Slip Dispatch
  // ----------------------------------------------------
  async sendSalarySlipWhatsApp(tenantId: string, payrollId: string) {
    const record = await prisma.payrollRecord.findFirst({
      where: { id: payrollId, tenantId },
      include: {
        employee: true,
        tenant: {
          select: { name: true, businessType: true, settings: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Payroll record not found');
    }

    const emp = record.employee;
    const companyName = record.tenant.name || 'Our Company';
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthStr = monthNames[record.month - 1] || `Month ${record.month}`;

    const text = `🏢 *${companyName}*
📜 *वेतन पर्ची / Salary Slip*
━━━━━━━━━━━━━━━━━━━━
👤 *कर्मचारी (Staff):* ${emp.name}
💼 *Role:* ${emp.role}
📅 *माह (Period):* ${monthStr} ${record.year}
📞 *Mobile:* ${emp.phone}

📋 *उपस्थिति का विवरण (Attendance):*
• उपस्थित (Present): ${record.presentDays} दिन
• आधा दिन (Half-Days): ${record.halfDays} दिन
• अनुपस्थित (Absent): ${record.absentDays} दिन
• ओवरटाइम (OT): ${record.overtimeHours} घंटे

💰 *वेतन का हिसाब (Earnings & Deductions):*
• मूल वेतन (Base Pay): ₹${Number(record.basePay).toLocaleString('en-IN')}
${Number(record.overtimePay) > 0 ? `• ओवरटाइम राशि (OT Pay): ₹${Number(record.overtimePay).toLocaleString('en-IN')}\n` : ''}• एडवांस कटौती (Advance Deducted): -₹${Number(record.advancesDeducted).toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
💵 *कुल देय वेतन (Net Salary): ₹${Number(record.netPayable).toLocaleString('en-IN')}*
✅ स्थिति (Status): ${record.status === 'paid' ? 'भुगतान सफल (PAID)' : 'तैयार / Pending'}
${record.paymentMethod ? `💳 माध्यम (Method): ${record.paymentMethod.toUpperCase()}` : ''}
${record.paidAt ? `🕒 दिनांक (Date): ${new Date(record.paidAt).toLocaleDateString('en-IN')}` : ''}
━━━━━━━━━━━━━━━━━━━━
आपके सहयोग व निष्ठा के लिए धन्यवाद! 🙏
_Generated securely via GINIE Business ERP_`;

    let cleanPhone = emp.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const waClickUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    let sentViaAutomation = false;
    let errorDetail = null;

    try {
      // Attempt to send via connected WhatsApp session
      await this.whatsAppService.sendMessage(tenantId, 'system', {
        phone: cleanPhone,
        message: text,
      });
      sentViaAutomation = true;
    } catch (err: any) {
      errorDetail = err?.message || 'Direct WhatsApp session not connected';
      this.logger.warn(`Could not dispatch automated WhatsApp salary slip: ${errorDetail}`);
    }

    return {
      success: true,
      sentViaAutomation,
      waClickUrl,
      phone: cleanPhone,
      messagePreview: text,
      errorDetail,
    };
  }
}
