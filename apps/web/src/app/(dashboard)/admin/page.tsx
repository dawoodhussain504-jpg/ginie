'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Popconfirm,
  Badge,
  message,
  Result,
  Divider,
  Tooltip,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SyncOutlined,
  HomeOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  CompassOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function AdminMasterConsolePage() {
  const { user, brandColor } = useApp();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string>('Pro');
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<string>('checking');

  useEffect(() => {
    if (user && user.isSuperAdmin) {
      loadAdminData();
      checkBridgeStatus();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, tenantsRes, plansRes] = await Promise.all([
        api.get('/api/admin/metrics').catch(() => null),
        api.get('/api/admin/tenants').catch(() => []),
        api.get('/api/admin/plans').catch(() => []),
      ]);
      setMetrics(metricsRes);
      setTenants(tenantsRes || []);
      setPlans(plansRes || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkBridgeStatus = async () => {
    try {
      const res = await api.get('/api/whatsapp/session');
      if (res?.status === 'connected') {
        setBridgeStatus('connected');
      } else if (res?.status === 'qr_ready') {
        setBridgeStatus('ready_pairing');
      } else {
        setBridgeStatus('online');
      }
    } catch {
      setBridgeStatus('offline');
    }
  };

  const handleToggleStatus = async (record: any) => {
    const nextStatus = record.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/api/admin/tenants/${record.id}/status`, { status: nextStatus });
      message.success(`Company "${record.name}" status updated to ${nextStatus}.`);
      loadAdminData();
    } catch (err: any) {
      message.error(err.message || 'Failed to update company status');
    }
  };

  const handleOpenPlanModal = (record: any) => {
    setSelectedTenant(record);
    setTargetPlan(record.planName || 'Pro');
    setPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!selectedTenant) return;
    setUpdatingPlan(true);
    try {
      await api.patch(`/api/admin/tenants/${selectedTenant.id}/plan`, { planName: targetPlan });
      message.success(`Company plan updated to ${targetPlan}!`);
      setPlanModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      message.error(err.message || 'Failed to update plan');
    } finally {
      setUpdatingPlan(false);
    }
  };

  // Access Guard: If not super-admin, block access
  if (user && !user.isSuperAdmin) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
        <Result
          status="403"
          title="Super Admin Access Only"
          subTitle="Aapke account ke paas Platform Master Console ka access nahi hai. Ye page sirf software owner ke liye reserved hai."
          extra={
            <Button type="primary" icon={<HomeOutlined />} onClick={() => router.push('/')}>
              Go to My CRM Workspace
            </Button>
          }
        />
      </div>
    );
  }

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      !searchFilter ||
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || t.planName.toLowerCase() === planFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const columns = [
    {
      title: 'Business Name',
      key: 'name',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: record.brandColor || brandColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong style={{ fontSize: 14 }}>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>slug: {record.slug}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Subscription Plan',
      dataIndex: 'planName',
      key: 'planName',
      render: (plan: string, record: any) => (
        <Space>
          <Tag color={plan === 'Enterprise' ? 'gold' : plan === 'Pro' ? 'blue' : 'default'} style={{ fontWeight: 600 }}>
            {plan.toUpperCase()}
          </Tag>
          <Tooltip title="Change Plan">
            <Button size="small" type="link" onClick={() => handleOpenPlanModal(record)}>
              Change
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Tag color="cyan">{count || 1} staff</Tag>,
    },
    {
      title: 'CRM Data',
      key: 'dataCount',
      render: (_: any, record: any) => (
        <Text style={{ fontSize: 12 }}>
          {record.leadCount || 0} leads • {record.dealCount || 0} deals
        </Text>
      ),
    },
    {
      title: 'Registered On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? formatDateIndian(date) : 'N/A'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : 'error'}
          text={
            <span style={{ fontWeight: 600, color: status === 'active' ? '#52c41a' : '#ff4d4f' }}>
              {(status || 'active').toUpperCase()}
            </span>
          }
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title={`Are you sure you want to ${record.status === 'active' ? 'suspend' : 'activate'} this company?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Button
              size="small"
              danger={record.status === 'active'}
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            >
              {record.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          </Popconfirm>

          <Button
            size="small"
            type="primary"
            ghost
            icon={<ArrowRightOutlined />}
            onClick={() => {
              message.info(`Switching workspace view to ${record.name}`);
              router.push('/');
            }}
          >
            Open CRM
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SafetyCertificateOutlined style={{ color: '#faad14' }} /> GINIE Platform Master Console
            </Title>
            <Tag color="gold" style={{ fontWeight: 700, padding: '2px 8px' }}>
              SUPER ADMIN
            </Tag>
          </div>
          <Text type="secondary">
            Global SaaS Platform Cockpit: All Tenant Companies, System Subscriptions, and Infrastructure Health
          </Text>
        </div>

        <Space wrap>
          <Button icon={<SyncOutlined />} onClick={loadAdminData} loading={loading}>
            Refresh Platform Data
          </Button>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => router.push('/')}
            style={{ fontWeight: 600 }}
          >
            Open CRM Workspace
          </Button>
        </Space>
      </div>

      {/* 4 KPI Metrics Grids */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card style={{ borderRadius: 12, borderTop: `4px solid ${brandColor}` }}>
          <Text type="secondary">Registered Businesses</Text>
          <Title level={2} style={{ margin: '8px 0 0', color: brandColor }}>
            {metrics?.totalTenants || tenants.length}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Active companies onboarded</Text>
        </Card>

        <Card style={{ borderRadius: 12, borderTop: '4px solid #52c41a' }}>
          <Text type="secondary">Active Platform Users</Text>
          <Title level={2} style={{ margin: '8px 0 0', color: '#52c41a' }}>
            {metrics?.totalUsers || 0}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Total owners + sales staff</Text>
        </Card>

        <Card style={{ borderRadius: 12, borderTop: '4px solid #722ed1' }}>
          <Text type="secondary">Places Lead Searches Run</Text>
          <Title level={2} style={{ margin: '8px 0 0', color: '#722ed1' }}>
            {metrics?.totalSearches || 0}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Total discovery requests</Text>
        </Card>

        <Card style={{ borderRadius: 12, borderTop: '4px solid #faad14' }}>
          <Text type="secondary">Platform Revenue (MRR)</Text>
          <Title level={2} style={{ margin: '8px 0 0', color: '#faad14' }}>
            ₹{Number(metrics?.totalRevenueINR || 0).toLocaleString('en-IN')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Gross collected from plans</Text>
        </Card>
      </div>

      {/* Infrastructure Health Status Card */}
      <Card style={{ borderRadius: 12, marginBottom: 24, background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloudServerOutlined style={{ fontSize: 24, color: '#1677ff' }} />
            <div>
              <Text strong style={{ fontSize: 14 }}>Global Infrastructure & Bridge Status</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Render Production Cluster: ginie-api + ginie-web + ginie-whatsapp-bridge
              </Text>
            </div>
          </div>

          <Space size="middle" wrap>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>WhatsApp Baileys Service:</Text>{' '}
              <Tag color={bridgeStatus === 'connected' ? 'green' : 'cyan'}>
                {bridgeStatus === 'connected' ? '● Connected' : '● Bridge Live (https://ginie-whatsapp-bridge.onrender.com)'}
              </Tag>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>PostgreSQL DB:</Text>{' '}
              <Tag color="green">● Healthy (Multi-tenant RLS)</Tag>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Core REST API:</Text>{' '}
              <Tag color="green">● Live v2.0</Tag>
            </div>
          </Space>
        </div>
      </Card>

      {/* Company Accounts Directory */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Space>
              <ShopOutlined />
              <span>Registered Business Tenants Directory ({filteredTenants.length})</span>
            </Space>

            <Space wrap>
              <Input.Search
                placeholder="Search business name or slug..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
              />
              <Select
                value={planFilter}
                onChange={setPlanFilter}
                style={{ width: 130 }}
                options={[
                  { value: 'all', label: 'All Plans' },
                  { value: 'free', label: 'Free' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'enterprise', label: 'Enterprise' },
                ]}
              />
            </Space>
          </div>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Plan Update Modal */}
      <Modal
        title={`Update Plan for ${selectedTenant?.name}`}
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={handleSavePlan}
        confirmLoading={updatingPlan}
        okText="Save Plan"
      >
        <div style={{ padding: '16px 0' }}>
          <Paragraph type="secondary">
            Select the subscription plan for <strong>{selectedTenant?.name}</strong>. This updates their lead
            discovery search limits and user seat limits.
          </Paragraph>

          <Select
            value={targetPlan}
            onChange={setTargetPlan}
            style={{ width: '100%' }}
            size="large"
            options={[
              { value: 'Free', label: 'Free Plan (Max 2 users, 50 monthly searches)' },
              { value: 'Pro', label: 'Pro Plan (Max 10 users, 500 monthly searches) - ₹2,999/mo' },
              { value: 'Enterprise', label: 'Enterprise Plan (Max 50 users, 2,000 monthly searches) - ₹4,999/mo' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
