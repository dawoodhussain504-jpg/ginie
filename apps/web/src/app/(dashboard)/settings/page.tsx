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
  Modal,
  Select,
  Popconfirm,
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
  UserAddOutlined,
  DeleteOutlined,
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



  const [team, setTeam] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    telegramBotToken: '',
    telegramChatId: '',
    adminWhatsAppPhone: '',
    leadAlertsEnabled: true,
  });

  const [form] = Form.useForm();
  const [alertsForm] = Form.useForm();
  const [addMemberForm] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [compRes, teamRes, alertsRes, rolesRes] = await Promise.all([
        api.get('/api/settings/company').catch(() => ({})),
        api.get('/api/settings/team').catch(() => []),
        api.get('/api/settings/alerts').catch(() => ({})),
        api.get('/api/settings/roles').catch(() => []),
      ]);
      setCompany(compRes);
      setTeam(teamRes || []);
      setRoles(rolesRes || []);
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

  const handleAddMember = async (values: any) => {
    setSavingMember(true);
    try {
      const res = await api.post('/api/settings/team', values);
      message.success(res.message || 'Team member added successfully!');
      setAddMemberModalOpen(false);
      addMemberForm.resetFields();
      const updatedTeam = await api.get('/api/settings/team');
      setTeam(updatedTeam || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to add team member');
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/api/settings/team/${userId}`);
      message.success('Team member removed.');
      const updatedTeam = await api.get('/api/settings/team');
      setTeam(updatedTeam || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to remove team member');
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
      title: 'Email (Sign-in ID)',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Team Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: any, record: any) => (
        <Tag color={record.isSuperAdmin ? 'gold' : role?.name === 'Owner' ? 'purple' : 'blue'}>
          {record.isSuperAdmin ? 'Platform Admin' : role?.name || 'Staff'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>{(status || 'active').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? formatDateIndian(date) : 'Today'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        if (record.id === user?.id) {
          return <Tag color="default">You (Active)</Tag>;
        }
        if (record.isSuperAdmin) {
          return <Tag color="gold">Protected</Tag>;
        }
        return (
          <Popconfirm
            title="Are you sure you want to remove this team member?"
            onConfirm={() => handleRemoveMember(record.id)}
            okText="Remove"
            cancelText="Cancel"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        );
      },
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Team & Staff Members</Title>
              <Text type="secondary">Invite and manage employees, sales executives, and their permissions</Text>
            </div>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                addMemberForm.resetFields();
                setAddMemberModalOpen(true);
              }}
            >
              Add Team Member
            </Button>
          </div>
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

  // If navigated with ?tab=owner-control, redirect to dedicated /admin Master Console
  useEffect(() => {
    if (initialTab === 'owner-control') {
      router.replace('/admin');
    }
  }, [initialTab, router]);

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

      {/* Add Team Member Modal */}
      <Modal
        title="Add New Team Member"
        open={addMemberModalOpen}
        onCancel={() => setAddMemberModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={addMemberForm} layout="vertical" onFinish={handleAddMember}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter staff member name' }]}
          >
            <Input placeholder="e.g. Sunil Verma" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address (Login ID)"
            rules={[
              { required: true, message: 'Please enter valid email' },
              { type: 'email', message: 'Valid email required' },
            ]}
          >
            <Input placeholder="e.g. sunil@acme.in" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number (Optional)">
            <Input placeholder="+91 9876543210" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Assign Team Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue={roles.find((r) => r.name === 'Sales Executive')?.id || roles[0]?.id}
          >
            <Select
              options={roles.map((r) => ({
                value: r.id,
                label: `${r.name} ${r.name === 'Sales Executive' ? '(Staff / Sales)' : r.name === 'Owner' ? '(Co-Owner)' : ''}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Initial Password"
            initialValue="Staff@123"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
            extra="Share this password with your employee so they can sign in."
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setAddMemberModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={savingMember}>
                Add Member
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
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
