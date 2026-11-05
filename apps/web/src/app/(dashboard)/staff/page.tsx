'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Divider,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Alert,
  DatePicker,
  Popconfirm,
  Radio,
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QrcodeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  WalletOutlined,
  CheckOutlined,
  PhoneOutlined,
  BankOutlined,
  SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function StaffPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);

  // Data States
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [advances, setAdvances] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [payrollMonth, setPayrollMonth] = useState<number>(dayjs().month() + 1);
  const [payrollYear, setPayrollYear] = useState<number>(dayjs().year());
  const [payrollGenerating, setPayrollGenerating] = useState(false);

  // Modals
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waResult, setWaResult] = useState<any>(null);

  const [employeeForm] = Form.useForm();
  const [advanceForm] = Form.useForm();
  const [settleForm] = Form.useForm();

  // Load Employees & Core Data
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/staff');
      setEmployees(res || []);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Daily Attendance
  const loadDailyAttendance = async (dateStr: string) => {
    try {
      const res = await api.get(`/api/staff/attendance/daily?date=${dateStr}`);
      setDailyAttendance(res || []);
    } catch (err: any) {
      console.error('Failed to load daily attendance:', err);
    }
  };

  // Load Advances
  const loadAdvances = async () => {
    try {
      const res = await api.get('/api/staff/advances/list');
      setAdvances(res || []);
    } catch (err: any) {
      console.error('Failed to load advances:', err);
    }
  };

  // Load Payroll Records
  const loadPayroll = async (month: number, year: number) => {
    try {
      const res = await api.get(`/api/staff/payroll/records?month=${month}&year=${year}`);
      setPayrollRecords(res || []);
    } catch (err: any) {
      console.error('Failed to load payroll:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDailyAttendance(selectedDate);
    loadAdvances();
    loadPayroll(payrollMonth, payrollYear);
  }, []);

  useEffect(() => {
    loadDailyAttendance(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadPayroll(payrollMonth, payrollYear);
  }, [payrollMonth, payrollYear]);

  // Attendance Handlers
  const handleStatusChange = (employeeId: string, status: string) => {
    setDailyAttendance((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, status } : item))
    );
  };

  const handleOtChange = (employeeId: string, overtimeHours: number) => {
    setDailyAttendance((prev) =>
      prev.map((item) => (item.employeeId === employeeId ? { ...item, overtimeHours } : item))
    );
  };

  const handleMarkAllPresent = () => {
    setDailyAttendance((prev) =>
      prev.map((item) => ({ ...item, status: 'present' }))
    );
    message.success('Sabhi staff ko Present (उपस्थित) mark kiya gaya!');
  };

  const handleSaveAttendance = async () => {
    try {
      setAttendanceSaving(true);
      await api.post('/api/staff/attendance/bulk', {
        date: selectedDate,
        records: dailyAttendance.map((a) => ({
          employeeId: a.employeeId,
          status: a.status,
          overtimeHours: Number(a.overtimeHours || 0),
          notes: a.notes || '',
        })),
      });
      message.success(`Tareekh ${selectedDate} ki haaziri safaltapoorvak save ho gayi!`);
      loadDailyAttendance(selectedDate);
    } catch (err: any) {
      message.error(err.message || 'Haaziri save karne me dikkat aayi.');
    } finally {
      setAttendanceSaving(false);
    }
  };

  // Employee CRUD Handlers
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    employeeForm.resetFields();
    employeeForm.setFieldsValue({
      salaryType: 'monthly',
      baseSalary: 12000,
      commissionPct: 0,
      status: 'active',
    });
    setEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    employeeForm.setFieldsValue({
      name: emp.name,
      phone: emp.phone,
      email: emp.email || '',
      role: emp.role,
      department: emp.department || '',
      salaryType: emp.salaryType,
      baseSalary: emp.baseSalary,
      commissionPct: emp.commissionPct,
      upiId: emp.upiId || '',
      bankAccount: emp.bankAccount || '',
      bankIfsc: emp.bankIfsc || '',
      status: emp.status,
      notes: emp.notes || '',
    });
    setEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async () => {
    try {
      const values = await employeeForm.validateFields();
      if (editingEmployee) {
        await api.patch(`/api/staff/${editingEmployee.id}`, values);
        message.success('Staff details updated!');
      } else {
        await api.post('/api/staff', values);
        message.success('Naya staff safaltapoorvak add kiya gaya!');
      }
      setEmployeeModalOpen(false);
      loadEmployees();
      loadDailyAttendance(selectedDate);
    } catch (err: any) {
      message.error(err.message || 'Staff save nahi ho saka.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.delete(`/api/staff/${id}`);
      message.success('Staff remove ho gaya.');
      loadEmployees();
      loadDailyAttendance(selectedDate);
    } catch (err: any) {
      message.error(err.message || 'Staff delete nahi ho saka.');
    }
  };

  // Advance Handlers
  const handleOpenAddAdvance = (employeeId?: string) => {
    advanceForm.resetFields();
    advanceForm.setFieldsValue({
      employeeId: employeeId || (employees[0]?.id || ''),
      amount: 1000,
      date: dayjs().format('YYYY-MM-DD'),
      reason: 'Personal Advance',
    });
    setAdvanceModalOpen(true);
  };

  const handleSaveAdvance = async () => {
    try {
      const values = await advanceForm.validateFields();
      await api.post('/api/staff/advances', values);
      message.success('Staff advance khata me darj ho gaya!');
      setAdvanceModalOpen(false);
      loadAdvances();
      loadEmployees();
    } catch (err: any) {
      message.error(err.message || 'Advance record nahi ho saka.');
    }
  };

  const handleDeleteAdvance = async (id: string) => {
    try {
      await api.delete(`/api/staff/advances/${id}`);
      message.success('Advance entry delete ho gayi.');
      loadAdvances();
      loadEmployees();
    } catch (err: any) {
      message.error(err.message || 'Advance entry delete nahi ho saki.');
    }
  };

  // Payroll Handlers
  const handleGeneratePayroll = async () => {
    try {
      setPayrollGenerating(true);
      const res = await api.post('/api/staff/payroll/generate', {
        month: payrollMonth,
        year: payrollYear,
      });
      setPayrollRecords(res || []);
      message.success(`${payrollMonth}/${payrollYear} ka payroll hisab safalta se generate ho gaya!`);
    } catch (err: any) {
      message.error(err.message || 'Payroll hisab lagane me dikkat aayi.');
    } finally {
      setPayrollGenerating(false);
    }
  };

  const handleOpenSettleModal = (record: any) => {
    setSelectedPayroll(record);
    settleForm.resetFields();
    settleForm.setFieldsValue({
      paymentMethod: record.employee?.upiId ? 'upi' : 'cash',
      paymentRef: '',
      notes: 'Monthly salary settled',
    });
    setSettleModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedPayroll) return;
    try {
      const values = await settleForm.validateFields();
      await api.post(`/api/staff/payroll/${selectedPayroll.id}/settle`, values);
      message.success(`${selectedPayroll.employee?.name} ki salary status PAID ho gayi!`);
      setSettleModalOpen(false);
      loadPayroll(payrollMonth, payrollYear);
      loadAdvances();
      loadEmployees();
    } catch (err: any) {
      message.error(err.message || 'Salary settlement me dikkat aayi.');
    }
  };

  const handleSendWhatsAppSlip = async (record: any) => {
    try {
      message.loading({ content: 'WhatsApp salary slip prepare ho rahi hai...', key: 'wa-slip' });
      const res = await api.post(`/api/staff/payroll/${record.id}/send-whatsapp`);
      message.destroy('wa-slip');
      setWaResult(res);
      setWaModalOpen(true);
      if (res.sentViaAutomation) {
        message.success('Salary slip staff ke WhatsApp par bhej di gayi!');
      } else {
        message.info('Direct WhatsApp link ready hai!');
      }
    } catch (err: any) {
      message.destroy('wa-slip');
      message.error(err.message || 'WhatsApp slip bhejte waqt error aaya.');
    }
  };

  // Metrics
  const activeStaffCount = employees.filter((e) => e.status === 'active').length;
  const presentTodayCount = dailyAttendance.filter((a) => a.status === 'present').length;
  const totalPendingAdvances = employees.reduce((sum, e) => sum + (e.pendingAdvances || 0), 0);
  const totalNetPayroll = payrollRecords.reduce((sum, r) => sum + (r.netPayable || 0), 0);

  return (
    <div style={{ padding: '4px 0 40px' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TeamOutlined />
                HR & STAFF PAYROLL
              </span>
              <Tag color="cyan" style={{ borderRadius: 12, fontWeight: 700 }}>
                1-TAP ATTENDANCE
              </Tag>
              <Tag color="gold" style={{ borderRadius: 12, fontWeight: 700 }}>
                DIHAARI & WAGES
              </Tag>
              <Tag color="green" style={{ borderRadius: 12, fontWeight: 700 }}>
                WHATSAPP PAYSLIP
              </Tag>
            </div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
              कर्मचारी, दैनिक हाज़िरी व वेतन प्रबंधन (Staff & Payroll)
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14, maxWidth: 700 }}>
              Dukan, Factory, Restaurant, Salon aur Workshop ke sabhi karmchariyon ki daily haaziri, overtime, beech mahine ka advance khata aur 1-click WhatsApp salary slip ek hi jagah.
            </Paragraph>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleOpenAddEmployee}
              style={{ borderRadius: 8, fontWeight: 700, background: '#2563eb', borderColor: '#2563eb' }}
            >
              + Add New Staff (कर्मचारी जोड़ें)
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                loadEmployees();
                loadDailyAttendance(selectedDate);
                loadAdvances();
                loadPayroll(payrollMonth, payrollYear);
              }}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* KPI Counters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Active Staff (कुल कर्मचारी)</span>}
              value={activeStaffCount}
              prefix={<TeamOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ fontWeight: 800, color: '#0f172a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Today's Haaziri (उपस्थित)</span>}
              value={presentTodayCount}
              suffix={`/ ${activeStaffCount}`}
              prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
              valueStyle={{ fontWeight: 800, color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Staff Advance Khata (उधारी)</span>}
              value={totalPendingAdvances}
              prefix="₹"
              valueStyle={{ fontWeight: 800, color: '#d97706' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Estimated Payroll (मासिक वेतन)</span>}
              value={totalNetPayroll || '0'}
              prefix="₹"
              valueStyle={{ fontWeight: 800, color: '#7c3aed' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Container */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            // Tab 1: Daily Attendance
            {
              key: 'attendance',
              label: (
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ color: '#16a34a' }} />
                  Daily Haaziri & OT (दैनिक हाज़िरी)
                </span>
              ),
              children: (
                <div>
                  {/* Top Bar for Attendance */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      marginBottom: 16,
                    }}
                  >
                    <Space size="middle" wrap>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>Select Date (तारीख):</Text>
                        <DatePicker
                          allowClear={false}
                          value={dayjs(selectedDate)}
                          onChange={(d) => d && setSelectedDate(d.format('YYYY-MM-DD'))}
                          style={{ borderRadius: 8, fontWeight: 600 }}
                        />
                      </div>
                      <Tag color="blue" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
                        {dayjs(selectedDate).format('dddd, DD MMMM YYYY')}
                      </Tag>
                    </Space>

                    <Space wrap>
                      <Button
                        onClick={handleMarkAllPresent}
                        style={{ borderRadius: 8, fontWeight: 600, borderColor: '#16a34a', color: '#16a34a' }}
                      >
                        ✓ Mark All Present (सब उपस्थित)
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleSaveAttendance}
                        loading={attendanceSaving}
                        style={{ borderRadius: 8, fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' }}
                      >
                        Save Haaziri (हाज़िरी दर्ज करें)
                      </Button>
                    </Space>
                  </div>

                  {/* Attendance Table */}
                  <Table
                    dataSource={dailyAttendance}
                    rowKey="employeeId"
                    pagination={false}
                    scroll={{ x: 750 }}
                    columns={[
                      {
                        title: 'Employee / Staff',
                        key: 'name',
                        render: (_, r) => (
                          <div>
                            <Text strong style={{ fontSize: 14 }}>{r.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {r.role} {r.department ? `• ${r.department}` : ''}
                            </Text>
                          </div>
                        ),
                      },
                      {
                        title: 'Salary Basis',
                        key: 'salaryType',
                        render: (_, r) => (
                          <div>
                            <Tag color={r.salaryType === 'daily' ? 'orange' : r.salaryType === 'commission' ? 'purple' : 'blue'}>
                              {r.salaryType === 'daily' ? 'दिहाड़ी (Daily)' : r.salaryType === 'commission' ? 'कमीशन' : 'माहवारी (Monthly)'}
                            </Tag>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              ₹{r.baseSalary.toLocaleString('en-IN')} {r.salaryType === 'daily' ? '/day' : '/mo'}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: 'Attendance (हाज़िरी दर्ज करें)',
                        key: 'status',
                        width: 320,
                        render: (_, r) => (
                          <Radio.Group
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.employeeId, e.target.value)}
                            size="middle"
                            buttonStyle="solid"
                          >
                            <Radio.Button
                              value="present"
                              style={{
                                color: r.status === 'present' ? '#ffffff' : '#16a34a',
                                background: r.status === 'present' ? '#16a34a' : '#ffffff',
                                borderColor: '#16a34a',
                                fontWeight: 700,
                              }}
                            >
                              P (उपस्थित)
                            </Radio.Button>
                            <Radio.Button
                              value="half_day"
                              style={{
                                color: r.status === 'half_day' ? '#ffffff' : '#d97706',
                                background: r.status === 'half_day' ? '#d97706' : '#ffffff',
                                borderColor: '#d97706',
                                fontWeight: 700,
                              }}
                            >
                              HD (आधा दिन)
                            </Radio.Button>
                            <Radio.Button
                              value="absent"
                              style={{
                                color: r.status === 'absent' ? '#ffffff' : '#dc2626',
                                background: r.status === 'absent' ? '#dc2626' : '#ffffff',
                                borderColor: '#dc2626',
                                fontWeight: 700,
                              }}
                            >
                              A (अनुपस्थित)
                            </Radio.Button>
                            <Radio.Button
                              value="paid_leave"
                              style={{
                                color: r.status === 'paid_leave' ? '#ffffff' : '#2563eb',
                                background: r.status === 'paid_leave' ? '#2563eb' : '#ffffff',
                                borderColor: '#2563eb',
                                fontWeight: 600,
                              }}
                            >
                              PL
                            </Radio.Button>
                          </Radio.Group>
                        ),
                      },
                      {
                        title: 'Overtime (घंटे)',
                        key: 'overtimeHours',
                        width: 140,
                        render: (_, r) => (
                          <InputNumber
                            min={0}
                            max={12}
                            step={0.5}
                            value={r.overtimeHours}
                            onChange={(val) => handleOtChange(r.employeeId, Number(val || 0))}
                            addonAfter="hrs"
                            style={{ width: '100%' }}
                          />
                        ),
                      },
                      {
                        title: 'Status',
                        key: 'isMarked',
                        width: 100,
                        render: (_, r) => (
                          <Badge
                            status={r.isMarked ? 'success' : 'default'}
                            text={r.isMarked ? 'Saved' : 'Pending'}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },

            // Tab 2: Staff Directory
            {
              key: 'staff_master',
              label: (
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamOutlined style={{ color: '#2563eb' }} />
                  Staff Directory (कर्मचारी सूची)
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 15, color: '#334155' }}>
                      Registered Staff Members ({employees.length})
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenAddEmployee}
                      style={{ borderRadius: 8, fontWeight: 600 }}
                    >
                      + Add Staff Member
                    </Button>
                  </div>

                  <Table
                    dataSource={employees}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 750 }}
                    columns={[
                      {
                        title: 'Name & Role',
                        key: 'name',
                        render: (_, r) => (
                          <div>
                            <Text strong style={{ fontSize: 14 }}>{r.name}</Text>
                            <br />
                            <Tag color="cyan" style={{ marginTop: 2 }}>{r.role}</Tag>
                            {r.department && <Text type="secondary" style={{ fontSize: 12 }}>({r.department})</Text>}
                          </div>
                        ),
                      },
                      {
                        title: 'Mobile / WhatsApp',
                        dataIndex: 'phone',
                        key: 'phone',
                        render: (phone) => (
                          <Space>
                            <PhoneOutlined style={{ color: '#64748b' }} />
                            <Text copyable>{phone}</Text>
                            <Button
                              size="small"
                              type="text"
                              icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 16 }} />}
                              onClick={() => window.open(`https://wa.me/91${phone}`, '_blank')}
                            />
                          </Space>
                        ),
                      },
                      {
                        title: 'Salary Structure',
                        key: 'salary',
                        render: (_, r) => (
                          <div>
                            <span style={{ fontWeight: 800, color: '#0f172a' }}>
                              ₹{r.baseSalary?.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {' '}/ {r.salaryType === 'daily' ? 'दिन (Daily)' : r.salaryType === 'hourly' ? 'घंटा' : 'माह (Month)'}
                            </span>
                            {r.commissionPct > 0 && (
                              <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                                + {r.commissionPct}% Service Commission
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Active Advance (उधारी)',
                        key: 'advance',
                        render: (_, r) => (
                          <div>
                            {r.pendingAdvances > 0 ? (
                              <Tag color="error" style={{ fontWeight: 700 }}>
                                ₹{r.pendingAdvances.toLocaleString('en-IN')}
                              </Tag>
                            ) : (
                              <Tag color="green">₹0 Nil</Tag>
                            )}
                          </div>
                        ),
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (st) => (
                          <Tag color={st === 'active' ? 'green' : st === 'on_leave' ? 'gold' : 'default'}>
                            {st?.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, r) => (
                          <Space>
                            <Tooltip title="उधारी दें / Record Advance">
                              <Button
                                size="small"
                                icon={<WalletOutlined style={{ color: '#d97706' }} />}
                                onClick={() => handleOpenAddAdvance(r.id)}
                              >
                                Advance
                              </Button>
                            </Tooltip>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleOpenEditEmployee(r)}
                            />
                            <Popconfirm
                              title="Kya aap is employee ko remove karna chahte hain?"
                              onConfirm={() => handleDeleteEmployee(r.id)}
                              okText="Yes, Delete"
                              cancelText="No"
                            >
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },

            // Tab 3: Staff Advances Khata
            {
              key: 'advances',
              label: (
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WalletOutlined style={{ color: '#d97706' }} />
                  Staff Advance Khata (उधारी/अग्रिम)
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <Text strong style={{ fontSize: 15 }}>Staff Advance & Khata Ledger</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Mahine ke beech me karmchariyon dwara liya gaya advance jo salary se deduct hoga.
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenAddAdvance()}
                      style={{ borderRadius: 8, fontWeight: 600, background: '#d97706', borderColor: '#d97706' }}
                    >
                      + Record Advance (उधारी दें)
                    </Button>
                  </div>

                  <Table
                    dataSource={advances}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 650 }}
                    columns={[
                      {
                        title: 'Date (तारीख)',
                        dataIndex: 'date',
                        key: 'date',
                        render: (d) => dayjs(d).format('DD MMM YYYY'),
                      },
                      {
                        title: 'Staff Member',
                        key: 'employee',
                        render: (_, r) => (
                          <div>
                            <Text strong>{r.employee?.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{r.employee?.role}</Text>
                          </div>
                        ),
                      },
                      {
                        title: 'Advance Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: (amt) => (
                          <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 15 }}>
                            ₹{amt?.toLocaleString('en-IN')}
                          </span>
                        ),
                      },
                      {
                        title: 'Reason / Notes',
                        dataIndex: 'reason',
                        key: 'reason',
                        render: (t) => t || 'Personal advance',
                      },
                      {
                        title: 'Settlement Status',
                        key: 'isSettled',
                        render: (_, r) => (
                          <Tag color={r.isSettled ? 'green' : 'gold'}>
                            {r.isSettled ? 'Settled in Salary' : 'Pending Deduction'}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        render: (_, r) => (
                          !r.isSettled ? (
                            <Popconfirm
                              title="Delete this advance entry?"
                              onConfirm={() => handleDeleteAdvance(r.id)}
                            >
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          ) : (
                            <Text type="secondary" style={{ fontSize: 12 }}>Settled</Text>
                          )
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },

            // Tab 4: Monthly Payroll & WhatsApp Slip
            {
              key: 'payroll',
              label: (
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileTextOutlined style={{ color: '#7c3aed' }} />
                  Monthly Payroll & WhatsApp Payslip (वेतन पर्ची)
                </span>
              ),
              children: (
                <div>
                  {/* Payroll Controls */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      marginBottom: 16,
                    }}
                  >
                    <Space size="middle" wrap>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>Select Month:</Text>
                        <Select
                          value={payrollMonth}
                          onChange={setPayrollMonth}
                          style={{ width: 140, borderRadius: 8 }}
                        >
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((m, idx) => (
                            <Option key={idx + 1} value={idx + 1}>{m}</Option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>Year:</Text>
                        <Select
                          value={payrollYear}
                          onChange={setPayrollYear}
                          style={{ width: 100, borderRadius: 8 }}
                        >
                          <Option value={2025}>2025</Option>
                          <Option value={2026}>2026</Option>
                          <Option value={2027}>2027</Option>
                        </Select>
                      </div>
                    </Space>

                    <Button
                      type="primary"
                      icon={<DollarCircleOutlined />}
                      onClick={handleGeneratePayroll}
                      loading={payrollGenerating}
                      style={{ borderRadius: 8, fontWeight: 700, background: '#7c3aed', borderColor: '#7c3aed' }}
                    >
                      ⚡ Calculate & Generate Payroll (इस महीने का हिसाब लगाएं)
                    </Button>
                  </div>

                  {payrollRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 16px', background: '#fafafa', borderRadius: 12 }}>
                      <FileTextOutlined style={{ fontSize: 36, color: '#94a3b8', marginBottom: 12 }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>
                        Is mahine ka payroll hisab abhi generate nahi hua hai.
                      </div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
                        Upar diye gaye button par click karke attendance aur advance ke aadhar par hisab lagayein.
                      </div>
                      <Button
                        type="primary"
                        icon={<DollarCircleOutlined />}
                        onClick={handleGeneratePayroll}
                        loading={payrollGenerating}
                        style={{ borderRadius: 8, fontWeight: 600 }}
                      >
                        Calculate Now
                      </Button>
                    </div>
                  ) : (
                    <Table
                      dataSource={payrollRecords}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 850 }}
                      columns={[
                        {
                          title: 'Staff Member',
                          key: 'name',
                          render: (_, r) => (
                            <div>
                              <Text strong style={{ fontSize: 14 }}>{r.employee?.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {r.employee?.role} • {r.employee?.salaryType?.toUpperCase()}
                              </Text>
                            </div>
                          ),
                        },
                        {
                          title: 'Duty / Days',
                          key: 'days',
                          render: (_, r) => (
                            <div>
                              <Tag color="green">{r.presentDays} P</Tag>
                              {r.halfDays > 0 && <Tag color="orange">{r.halfDays} HD</Tag>}
                              {r.absentDays > 0 && <Tag color="red">{r.absentDays} A</Tag>}
                              {r.overtimeHours > 0 && (
                                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>
                                  +{r.overtimeHours} hrs OT
                                </div>
                              )}
                            </div>
                          ),
                        },
                        {
                          title: 'Base Pay',
                          dataIndex: 'basePay',
                          key: 'basePay',
                          render: (v) => `₹${v.toLocaleString('en-IN')}`,
                        },
                        {
                          title: 'OT Pay',
                          dataIndex: 'overtimePay',
                          key: 'overtimePay',
                          render: (v) => (v > 0 ? `+₹${v.toLocaleString('en-IN')}` : '₹0'),
                        },
                        {
                          title: 'Advance Deducted',
                          dataIndex: 'advancesDeducted',
                          key: 'advancesDeducted',
                          render: (v) => (
                            <span style={{ color: v > 0 ? '#dc2626' : '#64748b', fontWeight: v > 0 ? 700 : 400 }}>
                              {v > 0 ? `-₹${v.toLocaleString('en-IN')}` : '₹0'}
                            </span>
                          ),
                        },
                        {
                          title: 'Net Salary (शुद्ध देय राशि)',
                          dataIndex: 'netPayable',
                          key: 'netPayable',
                          render: (v) => (
                            <span style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>
                              ₹{v.toLocaleString('en-IN')}
                            </span>
                          ),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (st) => (
                            <Tag color={st === 'paid' ? 'green' : 'gold'} style={{ fontWeight: 700 }}>
                              {st === 'paid' ? 'PAID (भुगतान हुआ)' : 'PENDING'}
                            </Tag>
                          ),
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, r) => (
                            <Space wrap>
                              <Tooltip title="Send Salary Slip to Staff via WhatsApp">
                                <Button
                                  size="small"
                                  icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                                  onClick={() => handleSendWhatsAppSlip(r)}
                                  style={{ borderColor: '#25D366', color: '#25D366', fontWeight: 600 }}
                                >
                                  Slip
                                </Button>
                              </Tooltip>

                              {r.status !== 'paid' ? (
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<CheckOutlined />}
                                  onClick={() => handleOpenSettleModal(r)}
                                  style={{ borderRadius: 6, fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' }}
                                >
                                  Pay Salary
                                </Button>
                              ) : (
                                <Tag color="cyan">Paid</Tag>
                              )}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Add / Edit Staff Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: '#2563eb' }} />
            <span>{editingEmployee ? 'Edit Staff Details' : 'Add New Staff Member (नया कर्मचारी जोड़ें)'}</span>
          </div>
        }
        open={employeeModalOpen}
        onCancel={() => setEmployeeModalOpen(false)}
        onOk={handleSaveEmployee}
        okText="Save Staff Member"
        width={560}
      >
        <Form form={employeeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="name" label="Staff Name (कर्मचारी का नाम)" rules={[{ required: true, message: 'Name is required' }]}>
                <Input placeholder="e.g. Ramesh Kumar" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="phone" label="Mobile / WhatsApp" rules={[{ required: true, message: 'Valid 10-digit phone required' }]}>
                <Input placeholder="e.g. 9876543210" maxLength={10} prefix="+91" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role / Designation (पद)" rules={[{ required: true, message: 'Role is required' }]}>
                <Input placeholder="e.g. Head Chef, Mechanic, Billing, Helper" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department / Shift">
                <Input placeholder="e.g. Kitchen, Workshop, Morning Shift" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salaryType" label="Salary Basis (वेतन प्रकार)" rules={[{ required: true }]}>
                <Select>
                  <Option value="monthly">माहवारी फिक्स (Monthly Fixed)</Option>
                  <Option value="daily">दैनिक मजदूरी / दिहाड़ी (Daily Wage)</Option>
                  <Option value="hourly">घंटे के आधार पर (Hourly Basis)</Option>
                  <Option value="commission">कमीशन आधारित (Commission)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="baseSalary" label="Base Salary / Rate (₹)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} prefix="₹" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="upiId" label="Staff UPI ID (GPay / PhonePe / Paytm)">
                <Input placeholder="e.g. ramesh@okaxis" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="commissionPct" label="Service Commission % (Optional)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active (सक्रिय)</Option>
              <Option value="on_leave">On Leave (छुट्टी पर)</Option>
              <Option value="inactive">Inactive / Left</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Record Advance Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WalletOutlined style={{ color: '#d97706' }} />
            <span>Record Staff Advance (उधारी / पेशगी दर्ज करें)</span>
          </div>
        }
        open={advanceModalOpen}
        onCancel={() => setAdvanceModalOpen(false)}
        onOk={handleSaveAdvance}
        okText="Record Advance"
        width={450}
      >
        <Form form={advanceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employeeId" label="Select Staff Member" rules={[{ required: true }]}>
            <Select placeholder="Choose employee...">
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amount" label="Advance Amount (₹)" rules={[{ required: true }]}>
                <InputNumber min={100} style={{ width: '100%' }} prefix="₹" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Date (तारीख)" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="reason" label="Reason / Notes">
            <Input placeholder="e.g. Festival advance, Medical emergency, Bike repair" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Settle / Pay Salary Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarCircleOutlined style={{ color: '#16a34a' }} />
            <span>Pay Salary & Settle (वेतन भुगतान करें)</span>
          </div>
        }
        open={settleModalOpen}
        onCancel={() => setSettleModalOpen(false)}
        onOk={handleConfirmSettle}
        okText="Confirm Paid (भुगतान दर्ज करें)"
        width={480}
      >
        {selectedPayroll && (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 16 }}>{selectedPayroll.employee?.name}</Text>
                  <br />
                  <Text type="secondary">{selectedPayroll.employee?.role}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Net Payable:</Text>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>
                    ₹{selectedPayroll.netPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* UPI QR Display if UPI is available */}
            {selectedPayroll.employee?.upiId && (
              <div style={{ textAlign: 'center', padding: '16px', background: '#fafafa', borderRadius: 10, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
                  📱 Scan QR code to pay via UPI (GPay / PhonePe / Paytm):
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `upi://pay?pa=${selectedPayroll.employee.upiId}&pn=${encodeURIComponent(
                      selectedPayroll.employee.name
                    )}&am=${selectedPayroll.netPayable}&cu=INR`
                  )}`}
                  alt="Staff UPI QR"
                  style={{ width: 150, height: 150, borderRadius: 8 }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>
                  UPI: {selectedPayroll.employee.upiId}
                </div>
              </div>
            )}

            <Form form={settleForm} layout="vertical">
              <Form.Item name="paymentMethod" label="Payment Method (भुगतान माध्यम)" rules={[{ required: true }]}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="upi">UPI (GPay/PhonePe)</Radio.Button>
                  <Radio.Button value="cash">Cash (नकद)</Radio.Button>
                  <Radio.Button value="bank">Bank Transfer</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="paymentRef" label="Payment Reference / UTR (Optional)">
                <Input placeholder="e.g. UPI Ref # 428190382910" />
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <Input placeholder="e.g. Paid in full for month" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* WhatsApp Slip Result Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
            <span>WhatsApp Salary Slip (वेतन पर्ची)</span>
          </div>
        }
        open={waModalOpen}
        onCancel={() => setWaModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setWaModalOpen(false)}>
            Close
          </Button>,
          waResult?.waClickUrl && (
            <Button
              key="direct-wa"
              type="primary"
              icon={<WhatsAppOutlined />}
              onClick={() => window.open(waResult.waClickUrl, '_blank')}
              style={{ background: '#25D366', borderColor: '#25D366', fontWeight: 700 }}
            >
              Open in WhatsApp Web / App ↗
            </Button>
          ),
        ]}
      >
        {waResult && (
          <div style={{ marginTop: 12 }}>
            {waResult.sentViaAutomation ? (
              <Alert
                type="success"
                showIcon
                message="Salary Slip sent successfully!"
                description={`Message has been dispatched to staff mobile (+${waResult.phone}).`}
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="Direct WhatsApp Link Ready"
                description="Aap neeche diye gaye button par click karke staff ko direct WhatsApp par slip bhej sakte hain."
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: 13, fontFamily: 'monospace' }}>
              {waResult.messagePreview}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
