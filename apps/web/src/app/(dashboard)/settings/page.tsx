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
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { t, brandColor, setBrandColor, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [testingAlert, setTestingAlert] = useState<string | null>(null);
  const [company, setCompany] = useState<any | null>(null);
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

  const tabItems = [
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
      key: 'alerts',
      label: (
        <span>
          <BellOutlined /> Admin Alert Channels
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
              description="Telegram par @BotFather se bot banayein aur uska token yahan daalein. Apna Chat ID paane ke liye Telegram par @userinfobot ko message karein."
            />

            <Form.Item
              name="telegramBotToken"
              label="Telegram Bot Token"
              extra="Example: 7123456789:AAFxz_SAMPLE_TOKEN_HERE"
            >
              <Input.Password placeholder="Enter bot token from @BotFather" />
            </Form.Item>

            <Form.Item
              name="telegramChatId"
              label="Your Telegram Chat ID"
              extra="Example: 123456789 (Your personal Telegram numerical user ID)"
            >
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

            <Form.Item
              name="adminWhatsAppPhone"
              label="Your Personal WhatsApp Phone Number"
              extra="New lead aane par bridge ke zariye aapke is personal number par alert dispatch hoga."
            >
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
      key: 'mobile-pwa',
      label: (
        <span>
          <MobileOutlined /> Mobile App (PWA)
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 700, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
              }}
            >
              🧞
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                GINIE Cockpit Mobile PWA
              </Title>
              <Text type="secondary">
                App Store ya Play Store ke bina apne phone par standalone app install karein.
              </Text>
            </div>
          </div>

          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="PWA Manifest & Service Worker Active"
            description="GINIE me Progressive Web App configuration complete hai. Mobile browser me kholne par ye direct full-screen app ki tarah kaam karta hai."
            style={{ marginBottom: 24 }}
          />

          <Tabs
            defaultActiveKey="android"
            items={[
              {
                key: 'android',
                label: (
                  <span>
                    <AndroidOutlined /> Android (Chrome)
                  </span>
                ),
                children: (
                  <div style={{ padding: '8px 0' }}>
                    <Paragraph>
                      1. Apne mobile Chrome browser me GINIE URL open karein.
                    </Paragraph>
                    <Paragraph>
                      2. Top-right corner me <strong>3 dots (⋮)</strong> menu par tap karein.
                    </Paragraph>
                    <Paragraph>
                      3. <strong>"Install App"</strong> ya <strong>"Add to Home screen"</strong> select karein.
                    </Paragraph>
                    <Paragraph>
                      4. GINIE app aapke mobile home screen par ek native app icon ke sath add ho jayega!
                    </Paragraph>
                  </div>
                ),
              },
              {
                key: 'ios',
                label: (
                  <span>
                    <AppleOutlined /> iPhone / iPad (Safari)
                  </span>
                ),
                children: (
                  <div style={{ padding: '8px 0' }}>
                    <Paragraph>
                      1. iPhone Safari me GINIE open karein.
                    </Paragraph>
                    <Paragraph>
                      2. Bottom bar me <strong>Share button (Square with up arrow)</strong> par tap karein.
                    </Paragraph>
                    <Paragraph>
                      3. Scroll karke <strong>"Add to Home Screen"</strong> par tap karein.
                    </Paragraph>
                    <Paragraph>
                      4. Top-right me <strong>"Add"</strong> dabayein. GINIE full-screen native feel me chalega!
                    </Paragraph>
                  </div>
                ),
              },
            ]}
          />
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
      key: 'advanced',
      label: 'Advanced',
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Title level={5}>Advanced Settings & Cockpit Status</Title>
          <Paragraph type="secondary">
            Settings here are for technical setup and developer integrations.
          </Paragraph>
          <Divider />
          <Paragraph>
            <strong>Your Company ID:</strong> <Text code>{company?.id || user?.tenantId}</Text>
          </Paragraph>
          <Paragraph>
            <strong>Domain:</strong> <Text code>ginie.space</Text>
          </Paragraph>
          <Paragraph>
            <strong>Cockpit Operating Mode:</strong> <Tag color="gold">Master Sovereign Admin</Tag>
          </Paragraph>
        </Card>
      ),
    },
  ];

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

      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
}
