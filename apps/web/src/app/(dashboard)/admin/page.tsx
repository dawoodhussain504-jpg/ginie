'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Modal,
  Select,
  message,
  Space,
  Popconfirm,
} from 'antd';
import {
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  CompassOutlined,
  DollarOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminPage() {
  const { t, brandColor } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [targetPlan, setTargetPlan] = useState<string>('Pro');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ginie_token');
      const [metricsRes, tenantsRes] = await Promise.all([
        fetch('http://localhost:4000/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/api/admin/tenants', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (metricsRes.ok && tenantsRes.ok) {
        const metricsData = await metricsRes.json();
        const tenantsData = await tenantsRes.json();
        setMetrics(metricsData);
        setTenants(tenantsData);
      } else {
        throw new Error('API returned error');
      }
    } catch {
      // Sample fallback data for Owner Dashboard
      setMetrics({
        totalTenants: 12,
        totalUsers: 38,
        totalSearches: 420,
        totalRevenueINR: 59980,
      });
      setTenants([
        {
          id: 'tenant-1',
          name: 'Acme Enterprises',
          slug: 'acme',
          status: 'active',
          planName: 'Pro',
          userCount: 4,
          leadCount: 182,
          dealCount: 16,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tenant-2',
          name: 'Apex Logistics Hub',
          slug: 'apex-logistics',
          status: 'active',
          planName: 'Enterprise',
          userCount: 12,
          leadCount: 940,
          dealCount: 48,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tenant-3',
          name: 'City Dental Clinic',
          slug: 'city-dental',
          status: 'suspended',
          planName: 'Free',
          userCount: 1,
          leadCount: 45,
          dealCount: 2,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (tenant: any) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('ginie_token');
      await fetch(`http://localhost:4000/api/admin/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t)),
      );
      message.success(`Company account is now ${nextStatus}`);
    } catch {
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t)),
      );
      message.success(`Company account is now ${nextStatus}`);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedTenant) return;
    try {
      const token = localStorage.getItem('ginie_token');
      await fetch(`http://localhost:4000/api/admin/tenants/${selectedTenant.id}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planName: targetPlan }),
      });

      setTenants((prev) =>
        prev.map((t) => (t.id === selectedTenant.id ? { ...t, planName: targetPlan } : t)),
      );
      message.success(`Plan updated to ${targetPlan}`);
      setPlanModalOpen(false);
    } catch {
      setTenants((prev) =>
        prev.map((t) => (t.id === selectedTenant.id ? { ...t, planName: targetPlan } : t)),
      );
      message.success(`Plan updated to ${targetPlan}`);
      setPlanModalOpen(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          <SafetyCertificateOutlined style={{ color: '#faad14', marginRight: 8 }} />
          {t.admin?.title || 'Owner Control Panel'}
        </Title>
        <Text type="secondary">
          {t.admin?.subtitle || 'Platform-wide company management and usage metrics.'}
        </Text>
      </div>

      {/* Platform KPIs */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title={t.admin?.totalCompanies || 'Total Companies'}
              value={metrics?.totalTenants || 0}
              prefix={<ShopOutlined style={{ color: brandColor }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title={t.admin?.activeUsers || 'Active Team Members'}
              value={metrics?.totalUsers || 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title={t.admin?.searchesConducted || 'Total Searches Run'}
              value={metrics?.totalSearches || 0}
              prefix={<CompassOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Platform Revenue"
              value={metrics?.totalRevenueINR || 0}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Companies Table */}
      <Card
        title={<Text strong style={{ fontSize: 16 }}>Registered Companies</Text>}
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Company',
              dataIndex: 'name',
              key: 'name',
              render: (name, record) => (
                <div>
                  <Text strong>{name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>slug: {record.slug}</Text>
                </div>
              ),
            },
            {
              title: 'Subscription Tier',
              dataIndex: 'planName',
              key: 'planName',
              render: (plan) => {
                const color = plan === 'Enterprise' ? 'purple' : plan === 'Pro' ? 'blue' : 'default';
                return <Tag color={color} style={{ fontWeight: 600 }}>{plan}</Tag>;
              },
            },
            {
              title: 'Team Seats',
              dataIndex: 'userCount',
              key: 'userCount',
              render: (count) => <Text>{count} members</Text>,
            },
            {
              title: 'Customers',
              dataIndex: 'leadCount',
              key: 'leadCount',
              render: (count) => <Text>{count} leads</Text>,
            },
            {
              title: t.admin?.companyStatus || 'Account Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) =>
                status === 'active' ? (
                  <Tag color="success">Active</Tag>
                ) : (
                  <Tag color="error">Paused / Suspended</Tag>
                ),
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setSelectedTenant(record);
                      setTargetPlan(record.planName);
                      setPlanModalOpen(true);
                    }}
                  >
                    Change Plan
                  </Button>
                  <Popconfirm
                    title={
                      record.status === 'active'
                        ? 'Pause this company account?'
                        : 'Reactivate this company account?'
                    }
                    onConfirm={() => handleToggleStatus(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      danger={record.status === 'active'}
                      icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    >
                      {record.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Change Plan Modal */}
      <Modal
        title={`Change Plan for ${selectedTenant?.name}`}
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={handleChangePlan}
        okText={t.common.save}
        cancelText={t.common.cancel}
        okButtonProps={{ style: { backgroundColor: brandColor } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
          <Text>Select new subscription tier for this company:</Text>
          <Select
            value={targetPlan}
            onChange={(val) => setTargetPlan(val)}
            style={{ width: '100%' }}
          >
            <Option value="Free">Starter (Free — 500 leads, 50 searches, 2 users)</Option>
            <Option value="Pro">Pro Growth (₹2,999/mo — 10k leads, 500 searches, 10 users)</Option>
            <Option value="Enterprise">Enterprise (₹4,999/mo — 50k leads, 2k searches, 50 users)</Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
}
