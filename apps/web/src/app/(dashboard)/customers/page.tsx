'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Drawer,
  Modal,
  Form,
  Timeline,
  Popconfirm,
  message,
} from 'antd';
import {
  UsergroupAddOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function CustomersPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [drawerCustomer, setDrawerCustomer] = useState<any | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [addForm] = Form.useForm();

  useEffect(() => {
    loadStatuses();
    loadCustomers();
  }, [page, search, selectedStatus]);

  const loadStatuses = async () => {
    try {
      const res = await api.get('/api/leads/statuses');
      setStatuses(res || []);
    } catch {}
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: '10',
        ...(search ? { search } : {}),
        ...(selectedStatus ? { statusId: selectedStatus } : {}),
      });
      const res = await api.get(`/api/leads?${queryParams}`);
      setCustomers(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (values: any) => {
    try {
      await api.post('/api/leads', values);
      message.success(t.common.success);
      setAddModalVisible(false);
      addForm.resetFields();
      loadCustomers();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.delete(`/api/leads/${id}`);
      message.success(t.customers.moveToBin);
      loadCustomers();
      if (drawerCustomer?.id === id) setDrawerCustomer(null);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleOpenDrawer = async (record: any) => {
    try {
      const full = await api.get(`/api/leads/${record.id}`);
      setDrawerCustomer(full);
    } catch {
      setDrawerCustomer(record);
    }
  };

  const handleAddNote = async () => {
    if (!drawerCustomer || !noteContent.trim()) return;
    try {
      await api.post(`/api/leads/${drawerCustomer.id}/activities`, {
        type: 'note',
        content: noteContent,
      });
      setNoteContent('');
      handleOpenDrawer(drawerCustomer);
      message.success(t.common.success);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Company', 'Phone', 'Email', 'City', 'Status', 'Date Added'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.companyName || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.city || ''}"`,
      `"${c.status?.name || 'New'}"`,
      `"${formatDateIndian(c.createdAt)}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `potential_customers_${Date.now()}.csv`;
    link.click();
  };

  const columns = [
    {
      title: t.customers.fields.name,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a onClick={() => handleOpenDrawer(record)} style={{ fontWeight: 600 }}>
          {text}
          {record.companyName && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.companyName}
            </Text>
          )}
        </a>
      ),
    },
    {
      title: t.customers.fields.phone,
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) =>
        phone ? (
          <a href={`tel:${phone}`}>
            <PhoneOutlined /> {phone}
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: t.customers.fields.email,
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <a href={`mailto:${email}`}>
            <MailOutlined /> {email}
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: t.customers.fields.city,
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || '—',
    },
    {
      title: t.customers.fields.status,
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => (
        <Tag color={status?.color || 'blue'}>{status?.name || 'New'}</Tag>
      ),
    },
    {
      title: t.customers.fields.created,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateIndian(date),
    },
    {
      title: t.customers.fields.actions,
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => handleOpenDrawer(record)}>
            View
          </Button>
          <Popconfirm
            title={t.customers.deleteConfirm}
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText={t.common.delete}
            cancelText={t.common.cancel}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.customers.title}
          </Title>
          <Text type="secondary">{t.customers.subtitle}</Text>
        </div>

        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            {t.customers.downloadExcel}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setAddModalVisible(true)}
          >
            {t.customers.addButton}
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12 }}>
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <Input
            placeholder={t.customers.searchPlaceholder}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
            allowClear
          />
          <Select
            placeholder={t.customers.fields.status}
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 180 }}
            options={statuses.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
          locale={{ emptyText: t.customers.empty }}
        />
      </Card>

      {/* Add Potential Customer Modal */}
      <Modal
        title={t.customers.addButton}
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" onFinish={handleCreateCustomer}>
          <Form.Item
            name="name"
            label={t.customers.fields.name}
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Ramesh Patel" />
          </Form.Item>

          <Form.Item name="companyName" label={t.customers.fields.company}>
            <Input placeholder="e.g. Patel Healthcare" />
          </Form.Item>

          <Form.Item name="phone" label={t.customers.fields.phone}>
            <Input placeholder="+91 98200 00000" />
          </Form.Item>

          <Form.Item name="email" label={t.customers.fields.email}>
            <Input placeholder="ramesh@example.com" />
          </Form.Item>

          <Form.Item name="city" label={t.customers.fields.city}>
            <Input placeholder="e.g. Ahmedabad" />
          </Form.Item>

          <Form.Item name="statusId" label={t.customers.fields.status}>
            <Select
              placeholder="Select status"
              options={statuses.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setAddModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.customers.addButton}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Customer Detail Drawer with Activity Timeline */}
      <Drawer
        title={drawerCustomer?.name || 'Customer Details'}
        placement="right"
        width={480}
        onClose={() => setDrawerCustomer(null)}
        open={!!drawerCustomer}
      >
        {drawerCustomer && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0 }}>
                {drawerCustomer.name}
              </Title>
              {drawerCustomer.companyName && (
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {drawerCustomer.companyName}
                </Text>
              )}
              <div style={{ marginTop: 8 }}>
                <Tag color={drawerCustomer.status?.color || 'blue'}>
                  {drawerCustomer.status?.name || 'New'}
                </Tag>
                {drawerCustomer.city && <Tag>{drawerCustomer.city}</Tag>}
              </div>
            </div>

            <Card size="small" style={{ marginBottom: 24, background: '#fafafa' }}>
              <Paragraph style={{ margin: '4px 0' }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {drawerCustomer.phone ? (
                  <a href={`tel:${drawerCustomer.phone}`}>{drawerCustomer.phone}</a>
                ) : (
                  'No phone'
                )}
              </Paragraph>
              <Paragraph style={{ margin: '4px 0' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                {drawerCustomer.email ? (
                  <a href={`mailto:${drawerCustomer.email}`}>{drawerCustomer.email}</a>
                ) : (
                  'No email'
                )}
              </Paragraph>
            </Card>

            {/* Activity History Timeline */}
            <Title level={5}>{t.customers.timeline.title}</Title>

            <div style={{ marginBottom: 20 }}>
              <Input.TextArea
                rows={3}
                placeholder={t.customers.timeline.notePlaceholder}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button
                type="primary"
                size="small"
                style={{ marginTop: 8 }}
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
              >
                {t.customers.timeline.saveNote}
              </Button>
            </div>

            <Timeline
              items={(drawerCustomer.activities || []).map((act: any) => ({
                color: act.type === 'note' ? 'blue' : 'green',
                children: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>
                      {act.content}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDateIndian(act.createdAt)} • {act.user?.name || 'Team member'}
                    </Text>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
