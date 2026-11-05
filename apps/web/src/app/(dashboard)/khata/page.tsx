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
  Row,
  Col,
  Statistic,
  Radio,
  Tooltip,
  Alert,
  Divider,
} from 'antd';
import {
  BookOutlined,
  UserAddOutlined,
  WhatsAppOutlined,
  PlusOutlined,
  MinusOutlined,
  HistoryOutlined,
  SearchOutlined,
  SyncOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function KhataPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addPartyModalOpen, setAddPartyModalOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accountLedger, setAccountLedger] = useState<any>(null);
  const [entryType, setEntryType] = useState<'debit' | 'credit'>('debit');
  const [waResult, setWaResult] = useState<any>(null);

  const [partyForm] = Form.useForm();
  const [entryForm] = Form.useForm();

  // Load Accounts
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/erp/khata/accounts?partyType=${activeTab}`);
      setAccounts(res || []);
    } catch (err: any) {
      console.error('Failed to load khata accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [activeTab]);

  // Load Single Account Ledger for passbook
  const loadAccountLedger = async (id: string) => {
    try {
      const res = await api.get(`/api/erp/khata/accounts/${id}`);
      setAccountLedger(res);
      setLedgerModalOpen(true);
    } catch (err: any) {
      message.error(err.message || 'Ledger load nahi ho saka.');
    }
  };

  // Add Party Handler
  const handleSaveParty = async () => {
    try {
      const values = await partyForm.validateFields();
      await api.post('/api/erp/khata/accounts', {
        ...values,
        partyType: activeTab,
      });
      message.success('Naya khata safalta se jod diya gaya!');
      setAddPartyModalOpen(false);
      partyForm.resetFields();
      loadAccounts();
    } catch (err: any) {
      message.error(err.message || 'Party save nahi ho saki.');
    }
  };

  // Open Transaction Entry Modal
  const handleOpenEntryModal = (acc: any, type: 'debit' | 'credit') => {
    setSelectedAccount(acc);
    setEntryType(type);
    entryForm.resetFields();
    entryForm.setFieldsValue({
      amount: '',
      date: dayjs().format('YYYY-MM-DD'),
      paymentMethod: 'cash',
      description: type === 'debit' ? 'Mal udhar diya' : 'Rashi prapt hui (Jama)',
    });
    setEntryModalOpen(true);
  };

  // Save Transaction Entry
  const handleSaveEntry = async () => {
    if (!selectedAccount) return;
    try {
      const values = await entryForm.validateFields();
      await api.post('/api/erp/khata/entries', {
        accountId: selectedAccount.id,
        type: entryType,
        amount: Number(values.amount),
        date: values.date,
        description: values.description,
        paymentMethod: values.paymentMethod,
      });
      message.success(
        entryType === 'debit'
          ? '₹' + values.amount + ' Udhar darj kiya gaya!'
          : '₹' + values.amount + ' Jama darj kiya gaya!'
      );
      setEntryModalOpen(false);
      loadAccounts();
      if (ledgerModalOpen && accountLedger?.id === selectedAccount.id) {
        loadAccountLedger(selectedAccount.id);
      }
    } catch (err: any) {
      message.error(err.message || 'Entry save nahi ho saki.');
    }
  };

  // Send WhatsApp Reminder Handler
  const handleSendReminder = async (acc: any) => {
    try {
      message.loading({ content: 'WhatsApp reminder dispatch ho raha hai...', key: 'wa-remind' });
      const res = await api.post(`/api/erp/khata/remind/${acc.id}`);
      message.destroy('wa-remind');
      if (res.sentViaAutomation) {
        message.success(`Payment reminder customer (+${res.phone}) ke WhatsApp par safalta se bhej diya gaya!`);
      } else {
        setWaResult(res);
        setWaModalOpen(true);
        message.warning('WhatsApp device connect nahi hai. Manual WhatsApp Web link ready hai.');
      }
    } catch (err: any) {
      message.destroy('wa-remind');
      message.error(err.message || 'Reminder send karne me dikkat aayi.');
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.partyName?.toLowerCase().includes(q) || a.partyPhone?.includes(q);
  });

  // Financial aggregates
  const totalReceivable = accounts
    .filter((a) => a.currentBalance > 0)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalPayable = accounts
    .filter((a) => a.currentBalance < 0)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

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
                  background: '#059669',
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
                <BookOutlined />
                DIGITAL KHATABOOK & LEDGER
              </span>
              <Tag color="green" style={{ borderRadius: 12, fontWeight: 700 }}>
                1-CLICK UPI REMINDERS
              </Tag>
              <Tag color="cyan" style={{ borderRadius: 12, fontWeight: 700 }}>
                AUTO-BALANCE PASSBOOK
              </Tag>
            </div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
              डिजिटल उधारी खाता व बहीखाता (Khata & Ledger)
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14, maxWidth: 700 }}>
              Grahak aur supplier ka jama-udhar (Debit/Credit) hisab rakhein, 1-click me WhatsApp par hisab bhejkar UPI payment prapt karein.
            </Paragraph>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                partyForm.resetFields();
                setAddPartyModalOpen(true);
              }}
              style={{ borderRadius: 8, fontWeight: 700, background: '#059669', borderColor: '#059669' }}
            >
              + Add New {activeTab === 'customer' ? 'Customer (ग्राहक जोड़ें)' : 'Supplier (सप्लायर जोड़ें)'}
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={loadAccounts}
              loading={loading}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* KPI Balance Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #dc2626', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>कुल लेना है (Total Receivable / You will get)</span>}
              value={totalReceivable}
              prefix="₹"
              valueStyle={{ fontWeight: 900, color: '#dc2626' }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Customers ke pass baki udhari rashi
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>कुल देना है (Total Payable / Advance Got)</span>}
              value={totalPayable}
              prefix="₹"
              valueStyle={{ fontWeight: 900, color: '#16a34a' }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Suppliers ya customers ki advance jama rashi
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #2563eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>कुल खाते (Total Khata Accounts)</span>}
              value={accounts.length}
              prefix={<WalletOutlined style={{ color: '#2563eb' }} />}
              valueStyle={{ fontWeight: 900, color: '#0f172a' }}
            />
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Active digital khata ledgers
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Khata Card */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        {/* Sub Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <Radio.Group
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="customer" style={{ fontWeight: 600 }}>
              👥 Customer Khata (ग्राहक खाता)
            </Radio.Button>
            <Radio.Button value="supplier" style={{ fontWeight: 600 }}>
              🏭 Supplier / Vendor Khata (सप्लायर खाता)
            </Radio.Button>
          </Radio.Group>

          <Input
            placeholder="Search party by name or mobile number..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280, borderRadius: 8 }}
          />
        </div>

        {/* Khata Accounts Table */}
        <Table
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No khata accounts found. Click "+ Add New Party" to create one.' }}
          columns={[
            {
              title: 'Party Name & Details',
              key: 'name',
              render: (_, r) => (
                <div>
                  <Text strong style={{ fontSize: 15, color: '#0f172a' }}>{r.partyName}</Text>
                  <br />
                  <Space style={{ marginTop: 2 }}>
                    <PhoneOutlined style={{ color: '#64748b', fontSize: 12 }} />
                    <Text type="secondary" copyable>{r.partyPhone}</Text>
                  </Space>
                </div>
              ),
            },
            {
              title: 'Balance Status (वर्तमान बकाया)',
              key: 'balance',
              render: (_, r) => {
                const bal = r.currentBalance;
                if (bal > 0) {
                  return (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626' }}>
                        ₹{bal.toLocaleString('en-IN')}
                      </div>
                      <Tag color="red" style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>
                        लेना है (Receivable)
                      </Tag>
                    </div>
                  );
                } else if (bal < 0) {
                  return (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>
                        ₹{Math.abs(bal).toLocaleString('en-IN')}
                      </div>
                      <Tag color="green" style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>
                        देना है (Advance Received)
                      </Tag>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#64748b' }}>₹0</div>
                      <Tag color="default">हिसाब चुकता (Settled)</Tag>
                    </div>
                  );
                }
              },
            },
            {
              title: 'Last Transaction',
              key: 'lastTx',
              render: (_, r) => {
                if (!r.lastTransaction) return <Text type="secondary">—</Text>;
                return (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(r.lastTransaction.date).format('DD MMM YYYY')}
                    </Text>
                    <br />
                    <span style={{ fontSize: 12, fontWeight: 600, color: r.lastTransaction.type === 'debit' ? '#dc2626' : '#16a34a' }}>
                      {r.lastTransaction.type === 'debit' ? '-₹' : '+₹'}
                      {Number(r.lastTransaction.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              },
            },
            {
              title: 'Quick Actions (हिसाब दर्ज करें)',
              key: 'quick',
              render: (_, r) => (
                <Space wrap>
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => handleOpenEntryModal(r, 'debit')}
                    style={{ borderColor: '#dc2626', color: '#dc2626', fontWeight: 700 }}
                  >
                    + उधार दिया
                  </Button>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenEntryModal(r, 'credit')}
                    style={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 700 }}
                  >
                    + जमा लिया
                  </Button>
                </Space>
              ),
            },
            {
              title: 'Statements & WhatsApp',
              key: 'actions',
              render: (_, r) => (
                <Space wrap>
                  <Tooltip title="View Passbook / Full Statement">
                    <Button
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={() => loadAccountLedger(r.id)}
                    >
                      Passbook
                    </Button>
                  </Tooltip>

                  {r.currentBalance > 0 && (
                    <Tooltip title="Send WhatsApp Payment Reminder (तकादा)">
                      <Button
                        size="small"
                        icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                        onClick={() => handleSendReminder(r)}
                        style={{ borderColor: '#25D366', color: '#25D366', fontWeight: 600 }}
                      >
                        तकादा
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Add New Party Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#059669' }} />
            <span>Add New {activeTab === 'customer' ? 'Customer (नया ग्राहक खाता)' : 'Supplier (नया सप्लायर खाता)'}</span>
          </div>
        }
        open={addPartyModalOpen}
        onCancel={() => setAddPartyModalOpen(false)}
        onOk={handleSaveParty}
        okText="Create Khata Account"
        width={480}
      >
        <Form form={partyForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="partyName" label="Name (नाम)" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Mukesh Sharma / Sharma Traders" />
          </Form.Item>

          <Form.Item name="partyPhone" label="WhatsApp Mobile Number" rules={[{ required: true, message: 'Valid 10-digit number required' }]}>
            <Input placeholder="e.g. 9876543210" maxLength={10} prefix="+91" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="openingBalance" label="Opening Balance (₹) [Optional]" initialValue={0}>
                <InputNumber style={{ width: '100%' }} placeholder="0" prefix="₹" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="creditLimit" label="Credit Limit (उधार सीमा)" initialValue={50000}>
                <InputNumber style={{ width: '100%' }} prefix="₹" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Record Entry Modal (Debit / Credit) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {entryType === 'debit' ? (
              <ArrowDownOutlined style={{ color: '#dc2626' }} />
            ) : (
              <ArrowUpOutlined style={{ color: '#16a34a' }} />
            )}
            <span>
              {entryType === 'debit' ? 'उधार दिया (Gave Credit)' : 'जमा लिया (Got Payment)'} — {selectedAccount?.partyName}
            </span>
          </div>
        }
        open={entryModalOpen}
        onCancel={() => setEntryModalOpen(false)}
        onOk={handleSaveEntry}
        okText={entryType === 'debit' ? 'Save Udhar Entry' : 'Save Jama Entry'}
        width={460}
      >
        <Form form={entryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="amount" label="Amount (राशि ₹)" rules={[{ required: true, message: 'Amount is required' }]}>
            <InputNumber min={1} style={{ width: '100%', fontSize: 18 }} prefix="₹" placeholder="Enter amount..." autoFocus />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Date (तारीख)" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentMethod" label="Mode (माध्यम)">
                <Select>
                  <Option value="cash">Cash (नकद)</Option>
                  <Option value="upi">UPI (GPay/PhonePe)</Option>
                  <Option value="bank">Bank Transfer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Notes / Description (विवरण)">
            <Input placeholder="e.g. Bill #104, Rice 50kg, Advance paid" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Account Passbook / Full Ledger Modal */}
      <Modal
        title={
          accountLedger && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {accountLedger.partyName} — Statement & Passbook
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Mobile: {accountLedger.partyPhone} • Current Balance: ₹{Number(accountLedger.currentBalance).toLocaleString('en-IN')}
              </div>
            </div>
          )
        }
        open={ledgerModalOpen}
        onCancel={() => setLedgerModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setLedgerModalOpen(false)}>
            Close
          </Button>,
          accountLedger?.currentBalance > 0 && (
            <Button
              key="remind"
              type="primary"
              icon={<WhatsAppOutlined />}
              onClick={() => handleSendReminder(accountLedger)}
              style={{ background: '#25D366', borderColor: '#25D366', fontWeight: 700 }}
            >
              Send WhatsApp Statement ↗
            </Button>
          ),
        ]}
        width={700}
      >
        {accountLedger && (
          <div style={{ marginTop: 16 }}>
            <Table
              dataSource={accountLedger.entries}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 550 }}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: (d) => dayjs(d).format('DD MMM YYYY'),
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                },
                {
                  title: 'उधार दिया (Debit)',
                  key: 'debit',
                  render: (_: any, r: any) =>
                    r.type === 'debit' ? (
                      <span style={{ fontWeight: 800, color: '#dc2626' }}>
                        ₹{Number(r.amount).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      '—'
                    ),
                },
                {
                  title: 'जमा लिया (Credit)',
                  key: 'credit',
                  render: (_: any, r: any) =>
                    r.type === 'credit' ? (
                      <span style={{ fontWeight: 800, color: '#16a34a' }}>
                        ₹{Number(r.amount).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      '—'
                    ),
                },
                {
                  title: 'Balance After',
                  dataIndex: 'balanceAfter',
                  key: 'balanceAfter',
                  render: (v) => <span style={{ fontWeight: 700 }}>₹{v.toLocaleString('en-IN')}</span>,
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* WhatsApp Reminder Result Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
            <span>WhatsApp Payment Reminder (तकादा)</span>
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
              Open in WhatsApp ↗
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
                message="Reminder Sent Successfully!"
                description={`Message dispatched to customer (+${waResult.phone}).`}
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="Direct WhatsApp Link Ready"
                description="Click the button below to send the payment reminder directly via WhatsApp."
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
