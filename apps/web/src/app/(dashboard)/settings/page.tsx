'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Typography,
  Table,
  Tag,
  Space,
  ColorPicker,
  Divider,
  Switch,
  Alert,
  message,
} from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  BellOutlined,
  MobileOutlined,
  SendOutlined,
  WhatsAppOutlined,
  CheckCircleOutlined,
  AndroidOutlined,
  AppleOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  FormOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  DollarOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import OnboardingWizardModal from '@/components/OnboardingWizardModal';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

function SettingsContent() {
  const { t, brandColor, setBrandColor, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [testingAlert, setTestingAlert] = useState<string | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Owner Control state
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [adminTenants, setAdminTenants] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const [m, t] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/admin/tenants'),
      ]);
      setAdminMetrics(m);
      setAdminTenants(t || []);
    } catch {
      // Fallback
      setAdminMetrics({ totalTenants: 1, totalUsers: 1, totalSearches: 20, totalRevenueINR: 0 });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleTenantStatus = async (tenant: any) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/status`, { status: nextStatus });
      setAdminTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: nextStatus } : t));
      message.success(`Company account is now ${nextStatus}`);
    } catch {
      message.error('Failed to update status');
    }
  };

  const [team, setTeam] = useState<any[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    telegramBotToken: '',
    telegramChatId: '',
    adminWhatsAppPhone: '',
    leadAlertsEnabled: true,
  });

  const [form] = Form.useForm();
  const [alertsForm] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [compRes, teamRes, alertsRes] = await Promise.all([
        api.get('/api/settings/company').catch(() => ({})),
        api.get('/api/settings/team').catch(() => []),
        api.get('/api/settings/alerts').catch(() => ({})),
      ]);
      setCompany(compRes);
      setTeam(teamRes || []);
      form.setFieldsValue({
        name: compRes?.name || 'Acme Enterprises',
      });
      if (alertsRes) {
        setAlertSettings(alertsRes);
        alertsForm.setFieldsValue(alertsRes);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (values: any) => {
    setLoading(true);
    try {
      await api.patch('/api/settings/company', {
        name: values.name,
        brandColor,
      });
      message.success(t.common.success);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlerts = async (values: any) => {
    setLoading(true);
    try {
      await api.patch('/api/settings/alerts', values);
      setAlertSettings(values);
      message.success('Personal alert channels saved successfully!');
    } catch (err: any) {
      message.error(err.message || 'Failed to update alert settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlert = async (channel: 'telegram' | 'whatsapp') => {
    setTestingAlert(channel);
    try {
      const values = alertsForm.getFieldsValue();
      const res: any = await api.post('/api/settings/alerts/test', {
        channel,
        botToken: values.telegramBotToken,
        chatId: values.telegramChatId,
        phone: values.adminWhatsAppPhone,
      });

      if (res?.success) {
        message.success(res.message || `Test message sent on ${channel}!`);
      } else {
        message.warning(res?.message || `Could not deliver test to ${channel}.`);
      }
    } catch (err: any) {
      message.error(err.message || `Test alert failed for ${channel}`);
    } finally {
      setTestingAlert(null);
    }
  };

  const teamColumns = [
    {
      title: 'Member Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Team Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => <Tag color="blue">{role?.name || 'Master Admin'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? formatDateIndian(date) : 'Today'),
    },
  ];

  const tabItems: any[] = [
    {
      key: 'profile',
      label: (
        <span>
          <ShopOutlined /> {t.settings.companyProfile}
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Form form={form} layout="vertical" onFinish={handleSaveCompany}>
            <Form.Item
              name="name"
              label={t.auth.companyNameLabel}
              rules={[{ required: true, message: t.common.pleaseCheckField }]}
            >
              <Input placeholder="e.g. Acme Enterprises" />
            </Form.Item>

            <Form.Item label={t.settings.brandColor}>
              <Space>
                <ColorPicker
                  value={brandColor}
                  onChange={(color) => setBrandColor(color.toHexString())}
                  showText
                />
                <Text type="secondary">This sets your primary button and theme accents.</Text>
              </Space>
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {t.common.save}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'onboarding',
      label: (
        <span>
          <AppstoreOutlined /> Business Wizard
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 680, borderRadius: 12 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Industry Setup & Business Template
          </Title>
          <Paragraph type="secondary">
            Configure GINIE for your exact business type (Shop, School, Clinic, Factory, Services, etc.).
            This automatically sets up industry pipeline stages, customer fields, and WhatsApp message templates.
          </Paragraph>

          <div style={{ background: '#f6ffed', padding: '16px 20px', borderRadius: 10, border: '1px solid #b7eb8f', marginBottom: 20 }}>
            <Text strong style={{ color: '#389e0d', display: 'block' }}>
              ✓ Current Business Configuration: {company?.businessType ? company.businessType.toUpperCase() : 'General Business'}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              You can re-run the wizard at any time to switch industry templates or update your pipeline stages.
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<AppstoreOutlined />}
            onClick={() => setOnboardingOpen(true)}
          >
            Launch Business Setup Wizard
          </Button>
        </Card>
      ),
    },
    {
      key: 'team',
      label: (
        <span>
          <TeamOutlined /> {t.settings.teamAccess}
        </span>
      ),
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Table
            dataSource={team}
            columns={teamColumns}
            rowKey="id"
            pagination={false}
            loading={loading}
          />
        </Card>
      ),
    },
    {
      key: 'alerts',
      label: (
        <span>
          <BellOutlined /> Admin Alerts
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 700, borderRadius: 12 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Instant Lead & Inquiry Alerts
          </Title>
          <Paragraph type="secondary">
            Jab bhi koi naya customer add ho ya public website form se inquiry aaye, GINIE automatically
            aapke phone par Telegram ya WhatsApp par instant message bhej dega.
          </Paragraph>

          <Form form={alertsForm} layout="vertical" onFinish={handleSaveAlerts}>
            <Form.Item
              name="leadAlertsEnabled"
              valuePropName="checked"
              label="Instant Alerts Active"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Divider orientation="left">
              <Space>
                <SendOutlined style={{ color: '#0088cc' }} />
                <span>Telegram Bot Notifications</span>
              </Space>
            </Divider>

            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Free & Instant Telegram Setup"
              description="Telegram par @BotFather se bot banayein aur uska token yahan daalein. Chat ID ke liye @userinfobot ko message karein."
            />

            <Form.Item name="telegramBotToken" label="Telegram Bot Token">
              <Input.Password placeholder="Enter bot token from @BotFather" />
            </Form.Item>

            <Form.Item name="telegramChatId" label="Your Telegram Chat ID">
              <Input placeholder="Enter your numeric Chat ID" />
            </Form.Item>

            <Form.Item>
              <Button
                icon={<SendOutlined />}
                loading={testingAlert === 'telegram'}
                onClick={() => handleTestAlert('telegram')}
              >
                Send Test Alert to Telegram
              </Button>
            </Form.Item>

            <Divider orientation="left">
              <Space>
                <WhatsAppOutlined style={{ color: '#25D366' }} />
                <span>Personal Admin WhatsApp Alert</span>
              </Space>
            </Divider>

            <Form.Item name="adminWhatsAppPhone" label="Your Personal WhatsApp Phone Number">
              <Input placeholder="e.g. +91 9876543210" />
            </Form.Item>

            <Form.Item>
              <Button
                icon={<WhatsAppOutlined />}
                loading={testingAlert === 'whatsapp'}
                onClick={() => handleTestAlert('whatsapp')}
              >
                Send Test Alert to WhatsApp
              </Button>
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save Alert Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'forms',
      label: (
        <span>
          <FormOutlined /> Public Forms
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Title level={4}>Public Website Forms</Title>
          <Paragraph type="secondary">
            Embed responsive lead capture forms on your website or share direct links with clients.
          </Paragraph>
          <Button type="primary" onClick={() => router.push('/forms')}>
            Manage Web Forms
          </Button>
        </Card>
      ),
    },
    {
      key: 'automations',
      label: (
        <span>
          <ThunderboltOutlined /> Auto Actions
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Title level={4}>Automated Follow-ups & Rules</Title>
          <Paragraph type="secondary">
            Configure automatic WhatsApp greeting replies, deal stage movement triggers, and notifications.
          </Paragraph>
          <Button type="primary" onClick={() => router.push('/automations')}>
            Manage Auto Actions
          </Button>
        </Card>
      ),
    },
    {
      key: 'subscriptions',
      label: (
        <span>
          <CreditCardOutlined /> Plan & Quotas
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Title level={4}>Subscription & Usage Quotas</Title>
          <Paragraph type="secondary">
            View your current monthly limits for Google Places searches, WhatsApp messaging, and seats.
          </Paragraph>
          <Button type="primary" onClick={() => router.push('/subscriptions')}>
            View Plan Details
          </Button>
        </Card>
      ),
    },
    {
      key: 'audit-logs',
      label: (
        <span>
          <HistoryOutlined /> Activity History
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Title level={4}>Security & Audit Trail</Title>
          <Paragraph type="secondary">
            Track user logins, export activities, deal stage transitions, and critical platform actions.
          </Paragraph>
          <Button type="primary" onClick={() => router.push('/audit-logs')}>
            View Full Audit Logs
          </Button>
        </Card>
      ),
    },
  ];

  // Strictly add Owner Control panel only if user is Super Admin
  if (user?.isSuperAdmin) {
    tabItems.push({
      key: 'owner-control',
      label: (
        <span style={{ color: '#faad14', fontWeight: 600 }}>
          <SafetyCertificateOutlined /> Owner Control Panel
        </span>
      ),
      children: (
        <div>
          <Title level={4}>Platform Owner Control Panel</Title>
          <Paragraph type="secondary">
            Platform-wide company management, tenant statuses, and resource usage metrics.
          </Paragraph>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <Card style={{ borderRadius: 10 }}>
              <Text type="secondary">Total Registered Companies</Text>
              <Title level={3} style={{ margin: '4px 0 0', color: brandColor }}>
                {adminMetrics?.totalTenants || 0}
              </Title>
            </Card>

            <Card style={{ borderRadius: 10 }}>
              <Text type="secondary">Active Team Members</Text>
              <Title level={3} style={{ margin: '4px 0 0', color: '#52c41a' }}>
                {adminMetrics?.totalUsers || 0}
              </Title>
            </Card>

            <Card style={{ borderRadius: 10 }}>
              <Text type="secondary">Total Searches Run</Text>
              <Title level={3} style={{ margin: '4px 0 0', color: '#722ed1' }}>
                {adminMetrics?.totalSearches || 0}
              </Title>
            </Card>

            <Card style={{ borderRadius: 10 }}>
              <Text type="secondary">Platform Revenue</Text>
              <Title level={3} style={{ margin: '4px 0 0', color: '#faad14' }}>
                ₹{Number(adminMetrics?.totalRevenueINR || 0).toLocaleString('en-IN')}
              </Title>
            </Card>
          </div>

          <Card title={<Text strong>Registered Companies</Text>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={adminTenants}
              rowKey="id"
              loading={adminLoading}
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
                  title: 'Plan',
                  dataIndex: 'planName',
                  key: 'planName',
                  render: (p) => <Tag color="gold">{p || 'Pro'}</Tag>,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (st) => <Tag color={st === 'active' ? 'green' : 'red'}>{st?.toUpperCase()}</Tag>,
                },
                {
                  title: 'Users',
                  dataIndex: 'userCount',
                  key: 'userCount',
                  render: (c) => c || 1,
                },
                {
                  title: 'Actions',
                  key: 'action',
                  render: (_, record) => (
                    <Button
                      size="small"
                      danger={record.status === 'active'}
                      icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => handleToggleTenantStatus(record)}
                    >
                      {record.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      ),
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.settings.title}
        </Title>
        <Text type="secondary">
          Manage your company branding, admin alert channels, and mobile app installation.
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => {
          setActiveTab(k);
          router.push(`/settings?tab=${k}`);
        }}
        items={tabItems}
      />

      <OnboardingWizardModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onSuccess={() => loadSettings()}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Loading settings...</div>}>
      <SettingsContent />
    </React.Suspense>
  );
}
