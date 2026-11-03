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
  Tabs,
  Form,
  Alert,
  Spin,
  Row,
  Col,
  Image,
  QRCode,
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
  WhatsAppOutlined,
  QrcodeOutlined,
  KeyOutlined,
  SendOutlined,
  DisconnectOutlined,
  EyeOutlined,
  PlusOutlined,
  DatabaseOutlined,
  AuditOutlined,
  ApiOutlined,
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function AdminMasterConsolePage() {
  const { user, brandColor, login } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Overview & Tenants
  const [metrics, setMetrics] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modals
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string>('Pro');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const [createTenantModalOpen, setCreateTenantModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [creatingTenant, setCreatingTenant] = useState(false);

  // WhatsApp Bridge Hub State
  const [bridgeStatus, setBridgeStatus] = useState<any>(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [pairingPhone, setPairingPhone] = useState('');
  const [generatedPairingCode, setGeneratedPairingCode] = useState<string | null>(null);
  const [pairingLoading, setPairingLoading] = useState(false);

  const [testRecipient, setTestRecipient] = useState('');
  const [testMessageText, setTestMessageText] = useState('');
  const [testSending, setTestSending] = useState(false);

  // System Health & Audit
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);

  // Discovery & UPI Settings State
  const [platformUpi, setPlatformUpi] = useState({
    upiId: '8797186001@paytm',
    payeeName: 'GINIE Space Platform Admin',
    qrCodeUrl: '',
    amount: 599,
    instructions: 'Scan UPI QR code, pay ₹599, and upload payment screenshot with 12-digit UTR number.',
  });
  const [savingUpi, setSavingUpi] = useState(false);
  const [discoveryRequests, setDiscoveryRequests] = useState<any[]>([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [approvingTenantId, setApprovingTenantId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTenantId, setRejectingTenantId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (user && user.isSuperAdmin) {
      loadAdminData();
      loadBridgeStatus();
      loadHealthAndAudit();
      loadUpiAndDiscovery();
    }
  }, [user]);

  // Periodic Bridge Refresh when in WhatsApp tab
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      loadBridgeStatus();
      const interval = setInterval(loadBridgeStatus, 12000);
      return () => clearInterval(interval);
    }
    if (activeTab === 'discovery') {
      loadUpiAndDiscovery();
    }
  }, [activeTab]);

  const loadUpiAndDiscovery = async () => {
    setLoadingDiscovery(true);
    try {
      const [upiRes, reqsRes] = await Promise.all([
        api.get('/api/admin/upi-settings').catch(() => null),
        api.get('/api/admin/discovery-requests').catch(() => []),
      ]);
      if (upiRes) {
        setPlatformUpi((prev) => ({
          ...prev,
          ...upiRes,
        }));
      }
      if (reqsRes) setDiscoveryRequests(reqsRes);
    } catch (err) {
      console.error('Failed to load UPI or discovery requests:', err);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      message.error('QR image 3MB se kam honi chahiye.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPlatformUpi((prev) => ({
        ...prev,
        qrCodeUrl: event.target?.result as string,
      }));
      message.success('Custom QR code preview update ho gaya. "Save UPI Settings" par click karein.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpiSettings = async () => {
    if (!platformUpi.upiId.trim()) {
      message.error('UPI ID zaroori hai (e.g. 8797186001@paytm)');
      return;
    }
    setSavingUpi(true);
    try {
      await api.post('/api/admin/upi-settings', platformUpi);
      message.success('Platform UPI QR & Payment settings saved successfully!');
    } catch (err: any) {
      message.error(err.message || 'Failed to save UPI settings');
    } finally {
      setSavingUpi(false);
    }
  };

  const handleApproveDiscovery = async (tenantId: string, days = 30) => {
    setApprovingTenantId(tenantId);
    try {
      const res = await api.post(`/api/admin/discovery-requests/${tenantId}/approve`, { days });
      message.success(res.message || `Discovery plan approved and activated for ${days} days!`);
      loadUpiAndDiscovery();
    } catch (err: any) {
      message.error(err.message || 'Failed to approve request');
    } finally {
      setApprovingTenantId(null);
    }
  };

  const handleRejectDiscovery = async () => {
    if (!rejectingTenantId) return;
    setRejecting(true);
    try {
      const res = await api.post(`/api/admin/discovery-requests/${rejectingTenantId}/reject`, {
        reason: rejectReason.trim() || 'Payment screenshot or UTR could not be verified.',
      });
      message.success(res.message || 'Discovery request marked as rejected.');
      setRejectModalOpen(false);
      setRejectingTenantId(null);
      setRejectReason('');
      loadUpiAndDiscovery();
    } catch (err: any) {
      message.error(err.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

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

  const loadBridgeStatus = async () => {
    setBridgeLoading(true);
    try {
      const res = await api.get('/api/admin/bridge/status');
      setBridgeStatus(res);
    } catch (err: any) {
      setBridgeStatus({ status: 'disconnected', error: err.message });
    } finally {
      setBridgeLoading(false);
    }
  };

  const loadHealthAndAudit = async () => {
    setHealthLoading(true);
    try {
      const [healthRes, auditRes] = await Promise.all([
        api.get('/api/admin/system-health').catch(() => null),
        api.get('/api/admin/audit-logs').catch(() => []),
      ]);
      setSystemHealth(healthRes);
      setAuditLogs(auditRes || []);
    } catch (err: any) {
      console.error('Failed to load health/audit:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  // 1. Generate WhatsApp 8-Digit Pairing Code
  const handleRequestPairingCode = async () => {
    const clean = pairingPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      message.error('Please enter a valid 10-digit mobile number for pairing.');
      return;
    }
    setPairingLoading(true);
    setGeneratedPairingCode(null);
    try {
      const res = await api.post('/api/admin/bridge/pairing-code', { phone: clean });
      if (res.pairingCode) {
        setGeneratedPairingCode(res.pairingCode);
        message.success('Pairing code generated! Enter it on your WhatsApp app.');
      } else {
        message.info(res.message || 'Connecting to WhatsApp servers...');
      }
      loadBridgeStatus();
    } catch (err: any) {
      message.error(err.message || 'Failed to generate pairing code. Ensure bridge is running.');
    } finally {
      setPairingLoading(false);
    }
  };

  // 2. Send Live Test WhatsApp Message
  const handleSendTestMessage = async () => {
    const clean = testRecipient.replace(/\D/g, '');
    if (clean.length < 10) {
      message.error('Please enter a valid recipient 10-digit mobile number.');
      return;
    }
    setTestSending(true);
    try {
      await api.post('/api/admin/bridge/test-message', {
        phone: clean,
        text: testMessageText.trim() || undefined,
      });
      message.success(`✓ Live test WhatsApp message dispatched successfully to +91 ${clean.slice(-10)}!`);
      setTestMessageText('');
    } catch (err: any) {
      message.error(err.message || 'Failed to dispatch test message. Is WhatsApp linked?');
    } finally {
      setTestSending(false);
    }
  };

  // 3. Disconnect WhatsApp Bridge
  const handleDisconnectBridge = async () => {
    try {
      await api.post('/api/admin/bridge/disconnect');
      message.success('WhatsApp session disconnected and auth cache reset.');
      setGeneratedPairingCode(null);
      loadBridgeStatus();
    } catch (err: any) {
      message.error(err.message || 'Failed to disconnect session.');
    }
  };

  // 4. Create New Business Tenant Manually
  const handleCreateTenant = async (values: any) => {
    setCreatingTenant(true);
    try {
      const res = await api.post('/api/admin/tenants', values);
      message.success(`Business "${res.tenantName}" created successfully! Initial password: ${values.password || 'Ginie@123'}`);
      setCreateTenantModalOpen(false);
      createForm.resetFields();
      loadAdminData();
    } catch (err: any) {
      message.error(err.message || 'Failed to create business.');
    } finally {
      setCreatingTenant(false);
    }
  };

  // 5. Impersonate / Open CRM as Business Owner
  const handleImpersonate = async (record: any) => {
    try {
      const res = await api.post(`/api/admin/tenants/${record.id}/impersonate`);
      if (res.accessToken && res.user) {
        // Save current super admin session so we can easily return
        const currentToken = localStorage.getItem('ginie_token');
        const currentUser = localStorage.getItem('ginie_user');
        if (currentToken && currentUser) {
          sessionStorage.setItem('admin_master_token', currentToken);
          sessionStorage.setItem('admin_master_user', currentUser);
        }

        // Login as client
        login(res.accessToken, res.user);
        message.success(`Switched context to "${record.name}". You are now viewing their CRM.`);
        router.push('/dashboard');
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to switch to client workspace.');
    }
  };

  // 6. Suspend / Activate Tenant
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

  // 7. Save Subscription Plan
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

  // Access Guard
  if (user && !user.isSuperAdmin) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
        <Result
          status="403"
          title="Super Admin Access Only"
          subTitle="Aapke account ke paas Platform Master Console ka access nahi hai. Ye page sirf platform owner ke liye reserved hai."
          extra={
            <Button type="primary" icon={<HomeOutlined />} onClick={() => router.push('/dashboard')}>
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

  const tenantColumns = [
    {
      title: 'Business Name',
      key: 'name',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
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
            <Button size="small" type="link" onClick={() => { setSelectedTenant(record); setTargetPlan(record.planName || 'Pro'); setPlanModalOpen(true); }}>
              Change
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Team Size',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Tag color="cyan">{count || 1} staff</Tag>,
    },
    {
      title: 'CRM Data Volume',
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
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            style={{ fontWeight: 600, background: '#1677ff' }}
            onClick={() => handleImpersonate(record)}
          >
            Login as Client
          </Button>

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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 40 }}>
      {/* ─── Master Header with Mode Switcher ──────────────────────────────── */}
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '20px 24px',
          borderRadius: 14,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyCertificateOutlined style={{ color: '#faad14', fontSize: 24 }} />
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              GINIE Master Console
            </Title>
            <Tag color="gold" style={{ fontWeight: 800, padding: '2px 8px' }}>
              SUPER ADMIN
            </Tag>
          </div>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, display: 'block' }}>
            Platform Command Center: Multi-tenant SaaS Management, Global WhatsApp Bridge & Infrastructure Health
          </Text>
        </div>

        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => router.push('/dashboard')}
            style={{
              height: 40,
              fontWeight: 600,
              background: '#2563eb',
              borderColor: '#2563eb',
              borderRadius: 8,
            }}
          >
            Switch to CRM Workspace ➔
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={() => { loadAdminData(); loadBridgeStatus(); loadHealthAndAudit(); }}
            loading={loading}
            style={{ height: 40, borderRadius: 8 }}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* ─── 4 Professional Master Tabs ───────────────────────────────────── */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        type="card"
        style={{ marginBottom: 20 }}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <DashboardOutlined />
                <span style={{ fontWeight: 600 }}>Cockpit Overview</span>
              </Space>
            ),
            children: (
              <div>
                {/* 4 Primary KPI Cards */}
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
                    <Text type="secondary">Google Maps Searches</Text>
                    <Title level={2} style={{ margin: '8px 0 0', color: '#722ed1' }}>
                      {metrics?.totalSearches || 0}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Total discovery requests</Text>
                  </Card>

                  <Card style={{ borderRadius: 12, borderTop: '4px solid #faad14' }}>
                    <Text type="secondary">Gross Revenue (MRR)</Text>
                    <Title level={2} style={{ margin: '8px 0 0', color: '#faad14' }}>
                      ₹{Number(metrics?.totalRevenueINR || 0).toLocaleString('en-IN')}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>Collected from plans</Text>
                  </Card>
                </div>

                {/* 3 Quick Launch Action Cards */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab('whatsapp')}
                      style={{ borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4' }}
                    >
                      <Space align="center" style={{ marginBottom: 12 }}>
                        <WhatsAppOutlined style={{ fontSize: 28, color: '#16a34a' }} />
                        <Title level={5} style={{ margin: 0, color: '#15803d' }}>
                          WhatsApp Master Bridge
                        </Title>
                      </Space>
                      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
                        Status:{' '}
                        <b>{bridgeStatus?.status === 'connected' ? `Connected (+${bridgeStatus?.phone})` : 'Disconnected / QR Ready'}</b>
                        <br />
                        PostgreSQL Session Persistence: <b>Active</b>
                      </Paragraph>
                      <Button type="primary" size="small" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                        Manage Bridge & QR ➔
                      </Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab('tenants')}
                      style={{ borderRadius: 12, border: '1px solid #bfdbfe', background: '#eff6ff' }}
                    >
                      <Space align="center" style={{ marginBottom: 12 }}>
                        <ShopOutlined style={{ fontSize: 28, color: '#2563eb' }} />
                        <Title level={5} style={{ margin: 0, color: '#1d4ed8' }}>
                          Client Businesses & Plans
                        </Title>
                      </Space>
                      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
                        Total Onboarded: <b>{tenants.length} Companies</b>
                        <br />
                        Manage subscriptions, suspend/activate, or login as client.
                      </Paragraph>
                      <Button type="primary" size="small" style={{ background: '#2563eb', borderColor: '#2563eb' }}>
                        View Businesses ➔
                      </Button>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      hoverable
                      onClick={() => setActiveTab('health')}
                      style={{ borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    >
                      <Space align="center" style={{ marginBottom: 12 }}>
                        <CloudServerOutlined style={{ fontSize: 28, color: '#475569' }} />
                        <Title level={5} style={{ margin: 0, color: '#334155' }}>
                          System Health & Security
                        </Title>
                      </Space>
                      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
                        DB Latency: <b>{systemHealth?.database?.latencyMs || 0}ms</b>
                        <br />
                        Places API & AI Engine status monitoring.
                      </Paragraph>
                      <Button size="small">
                        View Server Diagnostics ➔
                      </Button>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'whatsapp',
            label: (
              <Space>
                <WhatsAppOutlined style={{ color: '#25D366' }} />
                <span style={{ fontWeight: 600 }}>WhatsApp Master Hub</span>
                {bridgeStatus?.status === 'connected' && <Badge status="success" />}
              </Space>
            ),
            children: (
              <div>
                {/* Real-time Connection Status Header */}
                <Card
                  style={{
                    borderRadius: 12,
                    marginBottom: 20,
                    background: bridgeStatus?.status === 'connected' ? '#f0fdf4' : '#fffbeb',
                    border: bridgeStatus?.status === 'connected' ? '1px solid #86efac' : '1px solid #fde68a',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <WhatsAppOutlined style={{ fontSize: 36, color: bridgeStatus?.status === 'connected' ? '#16a34a' : '#d97706' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Title level={4} style={{ margin: 0 }}>
                            {bridgeStatus?.status === 'connected' ? `Linked Device: +${bridgeStatus.phone}` : 'WhatsApp Web Bridge Disconnected'}
                          </Title>
                          <Tag color={bridgeStatus?.status === 'connected' ? 'green' : 'gold'} style={{ fontWeight: 700 }}>
                            {bridgeStatus?.status === 'connected' ? 'CONNECTED & ACTIVE' : 'PAIRING REQUIRED'}
                          </Tag>
                          <Tag color="cyan">
                            ✓ PostgreSQL Session Persistence Active
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Daemon: <code>{bridgeStatus?.bridgeUrl || 'https://ginie-whatsapp-bridge.onrender.com'}</code> • PushName: <b>{bridgeStatus?.pushName || 'Merchant'}</b>
                        </Text>
                      </div>
                    </div>

                    <Space wrap>
                      <Button icon={<SyncOutlined />} onClick={loadBridgeStatus} loading={bridgeLoading}>
                        Check Live Status
                      </Button>
                      {bridgeStatus?.status === 'connected' && (
                        <Popconfirm
                          title="Are you sure you want to unlink and disconnect this WhatsApp device?"
                          onConfirm={handleDisconnectBridge}
                          okText="Disconnect"
                          cancelText="Cancel"
                        >
                          <Button danger icon={<DisconnectOutlined />}>
                            Unlink WhatsApp
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                </Card>

                {/* 2-Column Pairing Grid */}
                <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                  {/* Option A: Live QR Code */}
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <QrcodeOutlined style={{ color: '#1677ff' }} />
                          <span>Method 1: Scan QR Code with Phone</span>
                        </Space>
                      }
                      style={{ borderRadius: 12, height: '100%' }}
                    >
                      {bridgeStatus?.status === 'connected' ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                          <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a', marginBottom: 16 }} />
                          <Title level={4}>WhatsApp is Connected!</Title>
                          <Paragraph type="secondary">
                            Aapka WhatsApp device successfully linked hai. Credentials PostgreSQL database me permanently saved hain aur restart par bhi disconnect nahi honge.
                          </Paragraph>
                        </div>
                      ) : bridgeStatus?.qrCode || bridgeStatus?.qr ? (
                        <div style={{ textAlign: 'center', padding: 10 }}>
                          <img
                            src={bridgeStatus.qrCode || bridgeStatus.qr}
                            alt="WhatsApp Pairing QR"
                            style={{
                              width: 260,
                              height: 260,
                              borderRadius: 12,
                              border: '1px solid #e2e8f0',
                              padding: 8,
                              background: '#fff',
                            }}
                          />
                          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
                            1. Open WhatsApp on your phone.<br />
                            2. Tap <b>Settings / 3-dots ➔ Linked Devices ➔ Link a Device</b>.<br />
                            3. Point your camera at this QR code.
                          </Paragraph>
                          <Button size="small" icon={<SyncOutlined />} onClick={loadBridgeStatus}>
                            Refresh QR Code
                          </Button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                          <Spin tip="Generating fresh pairing handshake with WhatsApp servers..." />
                        </div>
                      )}
                    </Card>
                  </Col>

                  {/* Option B: 8-Digit Pairing Code */}
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <KeyOutlined style={{ color: '#faad14' }} />
                          <span>Method 2: Link with Phone Number (No Camera Needed)</span>
                        </Space>
                      }
                      style={{ borderRadius: 12, height: '100%' }}
                    >
                      <Paragraph type="secondary" style={{ fontSize: 13 }}>
                        Agar camera scan nahi karna, toh apna WhatsApp number dalein aur screen par aane wala 8-digit code apne WhatsApp app me enter karein:
                      </Paragraph>

                      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        <Input
                          addonBefore="+91"
                          placeholder="8797186001"
                          value={pairingPhone}
                          onChange={(e) => setPairingPhone(e.target.value)}
                          maxLength={15}
                        />
                        <Button
                          type="primary"
                          onClick={handleRequestPairingCode}
                          loading={pairingLoading}
                          style={{ fontWeight: 600 }}
                        >
                          Get 8-Digit Code
                        </Button>
                      </div>

                      {generatedPairingCode && (
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '2px dashed #3b82f6',
                            padding: '16px 20px',
                            borderRadius: 12,
                            textAlign: 'center',
                            marginBottom: 16,
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            Enter this code on your phone in WhatsApp:
                          </Text>
                          <Title level={2} style={{ margin: 0, letterSpacing: '4px', color: '#1d4ed8' }}>
                            {generatedPairingCode}
                          </Title>
                          <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                            WhatsApp ➔ Linked Devices ➔ Link with phone number instead.
                          </Text>
                        </div>
                      )}

                      <Alert
                        message="Anti-Disconnect Protection Active"
                        description="Once paired, session credentials are securely synced to PostgreSQL. The bridge will never lose pairing even on Render cold restarts."
                        type="info"
                        showIcon
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Live Test Message Dispatcher */}
                <Card
                  title={
                    <Space>
                      <SendOutlined style={{ color: '#16a34a' }} />
                      <span>Live WhatsApp Test Message Dispatcher</span>
                    </Space>
                  }
                  style={{ borderRadius: 12 }}
                >
                  <Paragraph type="secondary" style={{ fontSize: 13 }}>
                    Live delivery verify karne ke liye yahan koi bhi mobile number dalein aur 1-click test ping dispatch karein:
                  </Paragraph>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Input
                        addonBefore="+91"
                        placeholder="8797186001"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        style={{ marginBottom: 10 }}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <Input
                        placeholder="Custom message (Optional, default live ping text will be sent)"
                        value={testMessageText}
                        onChange={(e) => setTestMessageText(e.target.value)}
                        style={{ marginBottom: 10 }}
                      />
                    </Col>
                    <Col xs={24} md={4}>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendTestMessage}
                        loading={testSending}
                        block
                        style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
                      >
                        Send Test Ping
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </div>
            ),
          },
          {
            key: 'discovery',
            label: (
              <Space>
                <QrcodeOutlined style={{ color: '#2563eb' }} />
                <span style={{ fontWeight: 600 }}>Discovery Plans & UPI</span>
                {discoveryRequests.filter((r) => r.plan?.status === 'pending').length > 0 && (
                  <Badge
                    count={discoveryRequests.filter((r) => r.plan?.status === 'pending').length}
                    style={{ backgroundColor: '#f59e0b' }}
                  />
                )}
              </Space>
            ),
            children: (
              <div>
                <Row gutter={[24, 24]}>
                  {/* Left Column: Platform UPI QR Settings */}
                  <Col xs={24} lg={9}>
                    <Card
                      title={
                        <Space>
                          <QrcodeOutlined style={{ color: '#2563eb' }} />
                          <span style={{ fontWeight: 700 }}>Platform UPI QR & Payment Info</span>
                        </Space>
                      }
                      style={{ borderRadius: 12 }}
                    >
                      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                        Jab bhi koi client Google Maps discovery tab me UPI paywall dekhega, ye QR code aur UPI details dikhengi:
                      </Paragraph>

                      <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: 12,
                            background: '#fff',
                            borderRadius: 14,
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            marginBottom: 12,
                          }}
                        >
                          {platformUpi.qrCodeUrl ? (
                            <Image
                              src={platformUpi.qrCodeUrl}
                              alt="Platform QR Code"
                              width={200}
                              height={200}
                              style={{ objectFit: 'contain', borderRadius: 8 }}
                            />
                          ) : (
                            <QRCode
                              value={`upi://pay?pa=${platformUpi.upiId}&pn=${encodeURIComponent(
                                platformUpi.payeeName,
                              )}&am=${platformUpi.amount}&cu=INR`}
                              size={200}
                            />
                          )}
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'inline-block',
                              padding: '6px 14px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 13,
                              color: '#334155',
                            }}
                          >
                            <UploadOutlined style={{ marginRight: 6 }} />
                            {platformUpi.qrCodeUrl ? 'Change QR Image (JPG/PNG)' : 'Upload Custom QR Image (JPG/PNG)'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              style={{ display: 'none' }}
                              onChange={handleQrUpload}
                            />
                          </label>
                          {platformUpi.qrCodeUrl && (
                            <Button
                              type="link"
                              danger
                              size="small"
                              style={{ display: 'block', margin: '4px auto 0' }}
                              onClick={() => setPlatformUpi((p) => ({ ...p, qrCodeUrl: '' }))}
                            >
                              Reset to Dynamic QR
                            </Button>
                          )}
                        </div>
                      </div>

                      <Form layout="vertical">
                        <Form.Item label="UPI ID (VPA)" required>
                          <Input
                            placeholder="e.g. 8797186001@paytm"
                            value={platformUpi.upiId}
                            onChange={(e) => setPlatformUpi((p) => ({ ...p, upiId: e.target.value.trim() }))}
                          />
                        </Form.Item>

                        <Form.Item label="Payee Name">
                          <Input
                            placeholder="e.g. GINIE Space Platform Admin"
                            value={platformUpi.payeeName}
                            onChange={(e) => setPlatformUpi((p) => ({ ...p, payeeName: e.target.value }))}
                          />
                        </Form.Item>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item label="Price (₹ / Month)">
                              <Input
                                type="number"
                                prefix="₹"
                                value={platformUpi.amount}
                                onChange={(e) => setPlatformUpi((p) => ({ ...p, amount: Number(e.target.value) || 599 }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Validity (Days)">
                              <Input value="30 Days" disabled />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Instructions shown to Tenants">
                          <Input.TextArea
                            rows={2}
                            value={platformUpi.instructions}
                            onChange={(e) => setPlatformUpi((p) => ({ ...p, instructions: e.target.value }))}
                          />
                        </Form.Item>

                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          loading={savingUpi}
                          onClick={handleSaveUpiSettings}
                          block
                          style={{
                            height: 40,
                            background: '#2563eb',
                            borderColor: '#2563eb',
                            fontWeight: 700,
                          }}
                        >
                          Save UPI Settings
                        </Button>
                      </Form>
                    </Card>
                  </Col>

                  {/* Right Column: Discovery Payment Approvals Table */}
                  <Col xs={24} lg={15}>
                    <Card
                      title={
                        <Space>
                          <DollarCircleOutlined style={{ color: '#16a34a' }} />
                          <span style={{ fontWeight: 700 }}>Discovery Payment Approvals Queue</span>
                          <Badge
                            count={discoveryRequests.filter((r) => r.plan?.status === 'pending').length}
                            overflowCount={99}
                            style={{ backgroundColor: '#f59e0b' }}
                          />
                        </Space>
                      }
                      extra={
                        <Button icon={<SyncOutlined />} onClick={loadUpiAndDiscovery} loading={loadingDiscovery}>
                          Refresh
                        </Button>
                      }
                      style={{ borderRadius: 12 }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <Table
                        columns={[
                          {
                            title: 'Business & Contact',
                            key: 'business',
                            render: (_: any, r: any) => (
                              <div>
                                <Text strong style={{ fontSize: 14 }}>{r.name}</Text>
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                  {r.owner?.name || 'Owner'} • {r.owner?.phone || 'No phone'}
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                  {r.owner?.email}
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: 'UTR & Amount',
                            key: 'utr',
                            render: (_: any, r: any) => (
                              <div>
                                <Tag color="green" style={{ fontWeight: 600 }}>
                                  ₹{r.plan?.amount || 599}
                                </Tag>
                                <div style={{ marginTop: 4 }}>
                                  {r.plan?.utr ? (
                                    <Text copyable={{ text: r.plan.utr }} code strong style={{ fontSize: 12 }}>
                                      {r.plan.utr}
                                    </Text>
                                  ) : (
                                    <Text type="secondary" style={{ fontSize: 12 }}>No UTR</Text>
                                  )}
                                </div>
                                {r.plan?.notes && (
                                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                                    "{r.plan.notes}"
                                  </div>
                                )}
                              </div>
                            ),
                          },
                          {
                            title: 'Screenshot',
                            key: 'screenshot',
                            render: (_: any, r: any) =>
                              r.plan?.screenshot ? (
                                <Image
                                  src={r.plan.screenshot}
                                  alt="Payment Proof"
                                  width={56}
                                  height={56}
                                  style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }}
                                />
                              ) : (
                                <Text type="secondary" style={{ fontSize: 12 }}>None</Text>
                              ),
                          },
                          {
                            title: 'Status & Expiry',
                            key: 'status',
                            render: (_: any, r: any) => {
                              const s = r.plan?.status;
                              if (s === 'active') {
                                return (
                                  <Space direction="vertical" size={2}>
                                    <Tag color="success">🟢 Active</Tag>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {r.plan?.remainingDays}d left ({r.plan?.expiresAt ? new Date(r.plan.expiresAt).toLocaleDateString('en-IN') : ''})
                                    </Text>
                                  </Space>
                                );
                              }
                              if (s === 'pending') {
                                return (
                                  <Space direction="vertical" size={2}>
                                    <Tag color="warning">⏳ Pending Review</Tag>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {r.plan?.submittedAt ? new Date(r.plan.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </Text>
                                  </Space>
                                );
                              }
                              if (s === 'rejected') {
                                return (
                                  <Space direction="vertical" size={2}>
                                    <Tag color="error">❌ Rejected</Tag>
                                    {r.plan?.rejectionReason && (
                                      <Text type="secondary" style={{ fontSize: 11 }}>
                                        {r.plan.rejectionReason}
                                      </Text>
                                    )}
                                  </Space>
                                );
                              }
                              return <Tag color="default">Inactive</Tag>;
                            },
                          },
                          {
                            title: 'Actions',
                            key: 'actions',
                            render: (_: any, r: any) => (
                              <Space wrap>
                                <Dropdown
                                  menu={{
                                    items: [
                                      { key: '30', label: 'Approve 30 Days (Standard)' },
                                      { key: '60', label: 'Approve 60 Days (2 Months)' },
                                      { key: '90', label: 'Approve 90 Days (Quarterly)' },
                                      { key: '365', label: 'Approve 365 Days (1 Year)' },
                                      { key: '9999', label: 'Approve Lifetime Access' },
                                    ],
                                    onClick: ({ key }) => handleApproveDiscovery(r.id, Number(key)),
                                  }}
                                >
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    loading={approvingTenantId === r.id}
                                    style={{
                                      background: '#16a34a',
                                      borderColor: '#16a34a',
                                      fontWeight: 600,
                                      fontSize: 12,
                                    }}
                                  >
                                    {r.plan?.status === 'active' ? 'Extend Plan' : 'Approve Plan'}
                                  </Button>
                                </Dropdown>
                                {r.plan?.status !== 'rejected' && (
                                  <Button
                                    danger
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => {
                                      setRejectingTenantId(r.id);
                                      setRejectReason('');
                                      setRejectModalOpen(true);
                                    }}
                                    style={{ fontSize: 12 }}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </Space>
                            ),
                          },
                        ]}
                        dataSource={discoveryRequests}
                        rowKey="id"
                        loading={loadingDiscovery}
                        pagination={{ pageSize: 8 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'tenants',
            label: (
              <Space>
                <ShopOutlined />
                <span style={{ fontWeight: 600 }}>Businesses & Plans</span>
                <Badge count={tenants.length} overflowCount={999} style={{ backgroundColor: '#2563eb' }} />
              </Space>
            ),
            children: (
              <div>
                {/* Search & Actions Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <Space wrap>
                    <Input.Search
                      placeholder="Search business name or slug..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      style={{ width: 260 }}
                      allowClear
                    />

                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 140 }}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'active', label: 'Active Only' },
                        { value: 'suspended', label: 'Suspended Only' },
                      ]}
                    />

                    <Select
                      value={planFilter}
                      onChange={setPlanFilter}
                      style={{ width: 140 }}
                      options={[
                        { value: 'all', label: 'All Plans' },
                        { value: 'free', label: 'Free' },
                        { value: 'pro', label: 'Pro' },
                        { value: 'enterprise', label: 'Enterprise' },
                      ]}
                    />
                  </Space>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateTenantModalOpen(true)}
                    style={{ fontWeight: 600 }}
                  >
                    + Onboard New Business
                  </Button>
                </div>

                {/* Businesses Directory Table */}
                <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
                  <Table
                    columns={tenantColumns}
                    dataSource={filteredTenants}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} client businesses` }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'health',
            label: (
              <Space>
                <CloudServerOutlined />
                <span style={{ fontWeight: 600 }}>System & Server Health</span>
              </Space>
            ),
            children: (
              <div>
                {/* Diagnostic Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} md={8}>
                    <Card title={<Space><DatabaseOutlined style={{ color: '#1677ff' }} /><span>Managed PostgreSQL</span></Space>} style={{ borderRadius: 12 }}>
                      <Text type="secondary">Latency / Response Time:</Text>
                      <Title level={3} style={{ margin: '4px 0 8px', color: '#1677ff' }}>
                        {systemHealth?.database?.latencyMs || 2} ms
                      </Title>
                      <Tag color="green">● Status: Healthy (Multi-tenant RLS)</Tag>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                        Region: Oregon (AWS/Render Cluster)
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card title={<Space><CompassOutlined style={{ color: '#722ed1' }} /><span>Google Places API (New)</span></Space>} style={{ borderRadius: 12 }}>
                      <Text type="secondary">Searches Run This Month:</Text>
                      <Title level={3} style={{ margin: '4px 0 8px', color: '#722ed1' }}>
                        {systemHealth?.placesApi?.searchesThisMonth || 0}
                      </Title>
                      <Tag color="cyan">● Unlimited Sovereign Mode</Tag>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                        FieldMask Cost Optimizer: Active
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card title={<Space><ApiOutlined style={{ color: '#faad14' }} /><span>Google Gemini AI Copilot</span></Space>} style={{ borderRadius: 12 }}>
                      <Text type="secondary">Model Version:</Text>
                      <Title level={3} style={{ margin: '4px 0 8px', color: '#faad14' }}>
                        Gemini 1.5 Flash
                      </Title>
                      <Tag color="green">● Online & Ready</Tag>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                        Customer Interest Scoring & Smart Replies
                      </Text>
                    </Card>
                  </Col>
                </Row>

                {/* Audit Logs Table */}
                <Card
                  title={<Space><AuditOutlined style={{ color: '#1677ff' }} /><span>Recent Platform Activity & Audit Logs</span></Space>}
                  style={{ borderRadius: 12 }}
                  extra={
                    <Button size="small" icon={<SyncOutlined />} onClick={loadHealthAndAudit} loading={healthLoading}>
                      Refresh Logs
                    </Button>
                  }
                >
                  <Table
                    size="small"
                    dataSource={auditLogs}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                    columns={[
                      {
                        title: 'Timestamp',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (t: string) => formatDateIndian(t),
                      },
                      {
                        title: 'User',
                        key: 'user',
                        render: (_: any, r: any) => r.user?.name || 'System / Admin',
                      },
                      {
                        title: 'Action',
                        dataIndex: 'action',
                        key: 'action',
                        render: (act: string) => <Tag color="blue">{act}</Tag>,
                      },
                      {
                        title: 'Target Entity',
                        dataIndex: 'entityType',
                        key: 'entityType',
                        render: (e: string) => <Tag>{e}</Tag>,
                      },
                    ]}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* ─── Modal 1: Plan Upgrade / Downgrade ─────────────────────────────── */}
      <Modal
        title={`Change Subscription Plan for "${selectedTenant?.name}"`}
        open={planModalOpen}
        onOk={handleSavePlan}
        confirmLoading={updatingPlan}
        onCancel={() => setPlanModalOpen(false)}
        okText="Apply Plan"
      >
        <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 10 }}>
          Select the SaaS subscription tier to allocate to this business account:
        </Paragraph>
        <Select
          value={targetPlan}
          onChange={setTargetPlan}
          style={{ width: '100%', marginTop: 8 }}
          options={[
            { value: 'Free', label: 'Free (Starter Limits)' },
            { value: 'Pro', label: 'Pro Growth (Unlimited Features)' },
            { value: 'Enterprise', label: 'Enterprise (VIP Support & Dedicated Quota)' },
          ]}
        />
      </Modal>

      {/* ─── Modal 2: Onboard New Business ─────────────────────────────────── */}
      <Modal
        title="Onboard New Business Client"
        open={createTenantModalOpen}
        onOk={() => createForm.submit()}
        confirmLoading={creatingTenant}
        onCancel={() => setCreateTenantModalOpen(false)}
        okText="Create Business & Account"
      >
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Naye client ka business name aur owner credentials enter karein. Unka dedicated CRM workspace turant activate ho jayega:
        </Paragraph>
        <Form form={createForm} layout="vertical" onFinish={handleCreateTenant}>
          <Form.Item
            name="name"
            label="Business / Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="e.g. Royal Auto Spares" />
          </Form.Item>

          <Form.Item
            name="ownerName"
            label="Owner Full Name"
            rules={[{ required: true, message: 'Please enter owner name' }]}
          >
            <Input placeholder="e.g. Rajesh Sharma" />
          </Form.Item>

          <Form.Item
            name="ownerEmail"
            label="Owner Email Address"
            rules={[
              { required: true, message: 'Please enter owner email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="e.g. rajesh@example.com" />
          </Form.Item>

          <Form.Item name="ownerPhone" label="WhatsApp Mobile Number">
            <Input addonBefore="+91" placeholder="98765 43210" maxLength={15} />
          </Form.Item>

          <Form.Item name="planName" label="Subscription Plan" initialValue="Pro">
            <Select
              options={[
                { value: 'Free', label: 'Free Plan' },
                { value: 'Pro', label: 'Pro Growth (Recommended)' },
                { value: 'Enterprise', label: 'Enterprise VIP' },
              ]}
            />
          </Form.Item>

          <Form.Item name="password" label="Initial Login Password" initialValue="Ginie@123">
            <Input placeholder="Default: Ginie@123" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── Modal 3: Reject Discovery Payment ────────────────────────────── */}
      <Modal
        title="Reject Discovery Plan Payment"
        open={rejectModalOpen}
        onOk={handleRejectDiscovery}
        confirmLoading={rejecting}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectingTenantId(null);
        }}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Kripya rejection ka reason enter karein. Ye reason client ko unke Discovery tab me dikhaya jayega:
        </Paragraph>
        <Input.TextArea
          rows={3}
          placeholder="e.g. UTR number not matching bank statement, or invalid screenshot uploaded."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

function DashboardOutlined(props: any) {
  return <SafetyCertificateOutlined {...props} />;
}
