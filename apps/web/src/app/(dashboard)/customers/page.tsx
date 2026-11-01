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
  message,
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
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomerTimelineDrawer from '@/components/CustomerTimelineDrawer';
import CustomerImportModal from '@/components/CustomerImportModal';

const { Title, Text } = Typography;

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

  // Modals & Drawers state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [submittingAdd, setSubmittingAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        api.get('/api/contacts'),
        api.get('/api/companies'),
      ]);
      setContacts(contactsRes || []);
      setCompanies(companiesRes || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
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
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
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
            Customers & Accounts
          </Title>
          <Text type="secondary">
            Manage all client contacts, accounts, and 360° chronological activity timelines.
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
                  👤 People / Contacts ({filteredContacts.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredContacts}
                  columns={contactColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
            {
              key: 'companies',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  🏢 Companies / Accounts ({filteredCompanies.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredCompanies}
                  columns={companyColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
          ]}
        />
      </Card>

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
