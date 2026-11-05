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
import { StaffService } from './staff.service';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  BulkAttendanceSchema,
  CreateStaffAdvanceSchema,
  SettlePayrollSchema,
} from '@ginie/common';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ----------------------------------------------------
  // Employees
  // ----------------------------------------------------
  @Get()
  async getEmployees(@CurrentTenant() tenantId: string) {
    return this.staffService.getEmployees(tenantId);
  }

  @Get(':id')
  async getEmployeeById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.getEmployeeById(tenantId, id);
  }

  @Post()
  async createEmployee(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateEmployeeSchema.parse(body);
    return this.staffService.createEmployee(tenantId, validated);
  }

  @Patch(':id')
  async updateEmployee(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const validated = UpdateEmployeeSchema.parse(body);
    return this.staffService.updateEmployee(tenantId, id, validated);
  }

  @Delete(':id')
  async deleteEmployee(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.deleteEmployee(tenantId, id);
  }

  // ----------------------------------------------------
  // Attendance
  // ----------------------------------------------------
  @Get('attendance/daily')
  async getDailyAttendance(
    @CurrentTenant() tenantId: string,
    @Query('date') date: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.staffService.getDailyAttendance(tenantId, targetDate);
  }

  @Post('attendance/bulk')
  async markBulkAttendance(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = BulkAttendanceSchema.parse(body);
    return this.staffService.markBulkAttendance(tenantId, validated);
  }

  // ----------------------------------------------------
  // Advances
  // ----------------------------------------------------
  @Get('advances/list')
  async getAdvances(
    @CurrentTenant() tenantId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.staffService.getAdvances(tenantId, employeeId);
  }

  @Post('advances')
  async createAdvance(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateStaffAdvanceSchema.parse(body);
    return this.staffService.createAdvance(tenantId, validated);
  }

  @Delete('advances/:id')
  async deleteAdvance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.deleteAdvance(tenantId, id);
  }

  // ----------------------------------------------------
  // Payroll
  // ----------------------------------------------------
  @Get('payroll/records')
  async getPayrollRecords(
    @CurrentTenant() tenantId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.staffService.getPayrollRecords(tenantId, m, y);
  }

  @Post('payroll/generate')
  async generatePayroll(
    @CurrentTenant() tenantId: string,
    @Body() body: { month?: number; year?: number },
  ) {
    const now = new Date();
    const m = body.month ? Number(body.month) : now.getMonth() + 1;
    const y = body.year ? Number(body.year) : now.getFullYear();
    return this.staffService.generateMonthlyPayroll(tenantId, m, y);
  }

  @Post('payroll/:id/settle')
  async settlePayroll(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const validated = SettlePayrollSchema.parse(body);
    return this.staffService.settlePayroll(tenantId, id, validated);
  }

  @Post('payroll/:id/send-whatsapp')
  async sendSalarySlipWhatsApp(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.sendSalarySlipWhatsApp(tenantId, id);
  }
}
