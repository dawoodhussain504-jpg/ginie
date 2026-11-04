'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Tabs,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UsergroupAddOutlined,
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian, formatIndianCurrency } from '@ginie/i18n';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomerTimelineDrawer from '@/components/CustomerTimelineDrawer';
import CustomerImportModal from '@/components/CustomerImportModal';

const { Title, Text } = Typography;

interface LoyaltyData {
  points: number;
  cashback: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
}

function CustomersContent() {
  const { t, brandColor } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') === 'companies' ? 'companies' : 'people';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Loyalty Points state
  const [loyaltyMap, setLoyaltyMap] = useState<Record<string, LoyaltyData>>({});
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedLoyaltyContact, setSelectedLoyaltyContact] = useState<any | null>(null);
  const [giftForm] = Form.useForm();

  // Modals & Drawers state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [submittingAdd, setSubmittingAdd] = useState(false);

  useEffect(() => {
    loadData();
    const savedLoyalty = localStorage.getItem('ginie_customer_loyalty');
    if (savedLoyalty) {
      try {
        setLoyaltyMap(JSON.parse(savedLoyalty));
      } catch {}
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        api.get('/api/contacts'),
        api.get('/api/companies'),
      ]);
      const loadedContacts = contactsRes || [];
      setContacts(loadedContacts);
      setCompanies(companiesRes || []);

      // If no loyalty map existed, populate initial tiers
      const savedLoyalty = localStorage.getItem('ginie_customer_loyalty');
      if (!savedLoyalty && loadedContacts.length > 0) {
        const initialMap: Record<string, LoyaltyData> = {};
        loadedContacts.forEach((c: any, idx: number) => {
          const tiers: ('Silver' | 'Gold' | 'Platinum')[] = ['Silver', 'Gold', 'Platinum'];
          const pts = [150, 420, 850, 290, 600][idx % 5];
          initialMap[c.id] = {
            points: pts,
            cashback: Math.round(pts * 0.5),
            tier: tiers[idx % 3],
          };
        });
        setLoyaltyMap(initialMap);
        localStorage.setItem('ginie_customer_loyalty', JSON.stringify(initialMap));
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGiftModal = (contact: any) => {
    setSelectedLoyaltyContact(contact);
    const existing = loyaltyMap[contact.id] || { points: 200, cashback: 50, tier: 'Silver' };
    giftForm.setFieldsValue({
      points: 100,
      reason: 'Festive Bonus / Loyalty Appreciation',
      tier: existing.tier,
    });
    setGiftModalOpen(true);
  };

  const handleSaveLoyaltyGift = (values: any) => {
    if (!selectedLoyaltyContact) return;
    const existing = loyaltyMap[selectedLoyaltyContact.id] || { points: 0, cashback: 0, tier: 'Silver' };
    const addedPoints = Number(values.points || 0);
    const newTotal = existing.points + addedPoints;
    let newTier = values.tier || existing.tier;
    if (newTotal > 750) newTier = 'Platinum';
    else if (newTotal > 350) newTier = 'Gold';

    const updated = {
      ...loyaltyMap,
      [selectedLoyaltyContact.id]: {
        points: newTotal,
        cashback: Math.round(newTotal * 0.5),
        tier: newTier,
      },
    };

    setLoyaltyMap(updated);
    localStorage.setItem('ginie_customer_loyalty', JSON.stringify(updated));

    // Persist loyalty points to backend database
    api.post(`/api/contacts/${selectedLoyaltyContact.id}/loyalty`, {
      pointsDelta: addedPoints,
      reason: 'Loyalty Points Gift',
    }).catch(() => {});

    message.success(`Added ${addedPoints} loyalty points to ${selectedLoyaltyContact.name}!`);
    setGiftModalOpen(false);

    // Optional WhatsApp celebration dispatch
    if (selectedLoyaltyContact.phone) {
      const cleanPhone = selectedLoyaltyContact.phone.replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const text =
        `*Dear ${selectedLoyaltyContact.name},*\n\n` +
        `Congratulations! You have received *${addedPoints} Bonus Loyalty Points* (₹${addedPoints}) in your GINIE wallet.\n` +
        `Total Wallet Balance: *${newTotal} Points* (${newTier} Member).\n` +
        `Redeem this on your next billing or order!\n\n` +
        `Thank you for being our valued customer.`;
      
      const sendWa = window.confirm(`Points credited! Send celebratory WhatsApp notification to ${selectedLoyaltyContact.name}?`);
      if (sendWa) {
        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const values = await addForm.validateFields();
      setSubmittingAdd(true);
      await api.post('/api/contacts', values);
      message.success('Customer added successfully!');
      setAddCustomerOpen(false);
      addForm.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to create customer');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company?.name && c.company.name.toLowerCase().includes(q))
    );
  });

  const filteredCompanies = companies.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q))
    );
  });

  const totalPointsInSystem = Object.values(loyaltyMap).reduce((sum, item) => sum + (item.points || 0), 0);

  const contactColumns = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setSelectedCustomerId(record.id);
            setTimelineDrawerOpen(true);
          }}
        >
          <Text strong style={{ color: brandColor, fontSize: 14 }}>
            {name}
          </Text>
          {record.designation && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.designation}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Loyalty Points & Wallet',
      key: 'loyalty',
      render: (_: any, record: any) => {
        const data = loyaltyMap[record.id] || { points: 250, cashback: 50, tier: 'Silver' };
        const tierColors: Record<string, string> = {
          Gold: 'gold',
          Silver: 'blue',
          Platinum: 'purple',
        };
        return (
          <div>
            <Space size={6}>
              <Tag color={tierColors[data.tier] || 'blue'} style={{ fontWeight: 600 }}>
                {data.tier}
              </Tag>
              <Text strong style={{ color: '#059669', fontSize: 13 }}>
                <DollarCircleOutlined style={{ marginRight: 4 }} />{data.points} pts
              </Text>
            </Space>
            <div style={{ marginTop: 2 }}>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, height: 'auto', fontSize: 11 }}
                onClick={() => handleOpenGiftModal(record)}
              >
                + Gift Points / Tier
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (comp: any) =>
        comp?.name ? (
          <Space>
            <ShopOutlined style={{ color: '#8c8c8c' }} />
            <Text>{comp.name}</Text>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Phone & Quick Connect',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => {
        if (!phone) return <Text type="secondary">—</Text>;
        const digits = phone.replace(/[^0-9]/g, '');
        const cleanWa = digits.length === 10 ? `91${digits}` : digits;
        return (
          <Space size={8}>
            <Text>{phone}</Text>
            <Button
              type="text"
              size="small"
              icon={<PhoneOutlined style={{ color: '#1677ff' }} />}
              href={`tel:${phone}`}
            />
            <Button
              type="text"
              size="small"
              icon={<WhatsAppOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setSelectedDrawerContactId(record.id);
                setDrawerOpen(true);
              }}
              title="Open WhatsApp Chat in CRM"
            />
          </Space>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <a href={`mailto:${email}`} style={{ color: '#595959' }}>
            <MailOutlined style={{ marginRight: 6 }} />
            {email}
          </a>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Timeline (360°)',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<ClockCircleOutlined />}
          onClick={() => {
            setSelectedCustomerId(record.id);
            setTimelineDrawerOpen(true);
          }}
        >
          Activity Stream
        </Button>
      ),
    },
  ];

  const companyColumns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (ind: string) => (ind ? <Tag color="blue">{ind}</Tag> : <Text type="secondary">—</Text>),
    },
    {
      title: 'City / Location',
      dataIndex: 'city',
      key: 'city',
      render: (city: string, record: any) =>
        city || record.customFields?.city ? (
          <Text>{city || record.customFields?.city}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Key Contacts',
      dataIndex: 'contacts',
      key: 'contacts',
      render: (conts: any[]) =>
        conts && conts.length > 0 ? (
          <Space wrap>
            {conts.map((c: any, i: number) => (
              <Tag key={i} color="cyan">
                {c.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">0 contacts</Text>
        ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <UsergroupAddOutlined style={{ marginRight: 10, color: brandColor }} />
            Customers, Accounts & Loyalty
          </Title>
          <Text type="secondary">
            Manage all client contacts, customer cashback wallets, and 360° chronological activity timelines.
          </Text>
        </div>

        <Space wrap>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setImportModalOpen(true)}
          >
            Import Excel / CSV
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddCustomerOpen(true)}
          >
            Add Customer
          </Button>
        </Space>
      </div>

      {/* Loyalty & Retention Metric Bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Active Customers"
              value={contacts.length}
              prefix={<UsergroupAddOutlined style={{ color: brandColor }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Loyalty Points In Circulation"
              value={totalPointsInSystem}
              suffix="Pts"
              valueStyle={{ color: '#059669' }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Redeemable Cashback Value"
              value={formatIndianCurrency(totalPointsInSystem)}
              valueStyle={{ color: '#7c3aed' }}
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card with Tabs: People vs Companies */}
      <Card style={{ borderRadius: 14 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            router.push(`/customers?tab=${key}`);
          }}
          tabBarExtraContent={
            <Input
              placeholder="Search name, phone, email, firm..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
          }
          items={[
            {
              key: 'people',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  People & Contacts ({filteredContacts.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredContacts}
                  columns={contactColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 750 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
            {
              key: 'companies',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Companies & Accounts ({filteredCompanies.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredCompanies}
                  columns={companyColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 650 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Gift Loyalty Points Modal */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#059669' }} />
            <span>Credit Loyalty Points & Cashback Wallet</span>
          </Space>
        }
        open={giftModalOpen}
        onCancel={() => setGiftModalOpen(false)}
        onOk={() => giftForm.submit()}
        okText="Credit Points to Customer"
      >
        {selectedLoyaltyContact && (
          <div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text strong>{selectedLoyaltyContact.name}</Text>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Phone: {selectedLoyaltyContact.phone || 'N/A'} &bull; Current Points: {loyaltyMap[selectedLoyaltyContact.id]?.points || 0}
              </div>
            </div>

            <Form form={giftForm} layout="vertical" onFinish={handleSaveLoyaltyGift}>
              <Form.Item
                name="points"
                label="Points to Credit (1 pt = ₹1 discount)"
                rules={[{ required: true, message: 'Please enter points' }]}
              >
                <InputNumber style={{ width: '100%' }} min={10} max={10000} step={50} />
              </Form.Item>

              <Form.Item name="tier" label="Membership Tier">
                <Select
                  options={[
                    { label: 'Silver Member', value: 'Silver' },
                    { label: 'Gold Member', value: 'Gold' },
                    { label: 'Platinum VIP Member', value: 'Platinum' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="reason" label="Reason / Campaign">
                <Input placeholder="e.g. Festival Gift, Review Reward, Order Bonus" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Customer 360 Timeline Drawer */}
      <CustomerTimelineDrawer
        customerId={selectedCustomerId}
        open={timelineDrawerOpen}
        onClose={() => {
          setTimelineDrawerOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      {/* Import Customers Modal */}
      <CustomerImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* Add Customer Modal */}
      <Modal
        title="Add New Customer"
        open={addCustomerOpen}
        onCancel={() => setAddCustomerOpen(false)}
        onOk={handleCreateCustomer}
        confirmLoading={submittingAdd}
        okText="Save Customer"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="e.g. Ramesh Patel" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number (+91)">
            <Input placeholder="e.g. +91 98201 11223 or 9820111223" />
          </Form.Item>

          <Form.Item name="email" label="Email Address">
            <Input placeholder="e.g. ramesh@example.com" />
          </Form.Item>

          <Form.Item name="companyName" label="Company / Business Name">
            <Input placeholder="e.g. Patel Engineering" />
          </Form.Item>

          <Form.Item name="designation" label="Designation / Role">
            <Input placeholder="e.g. Managing Director, Purchase Manager" />
          </Form.Item>

          <Form.Item name="notes" label="Initial Notes">
            <Input.TextArea rows={3} placeholder="Any notes from call or meeting..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Loading customers...</div>}>
      <CustomersContent />
    </React.Suspense>
  );
}
