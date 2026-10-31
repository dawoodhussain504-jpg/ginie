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
  message,
} from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { t, brandColor, setBrandColor, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any | null>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [compRes, teamRes] = await Promise.all([
        api.get('/api/settings/company'),
        api.get('/api/settings/team'),
      ]);
      setCompany(compRes);
      setTeam(teamRes || []);
      form.setFieldsValue({
        name: compRes.name,
      });
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
      render: (role: any) => <Tag color="blue">{role?.name || 'Member'}</Tag>,
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
      render: (date: string) => formatDateIndian(date),
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
              <Input placeholder="e.g. Acme Traders" />
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
          <Title level={5}>Advanced Settings & Auto-Connect</Title>
          <Paragraph type="secondary">
            Settings here are for technical setup and developer integrations. Normal daily CRM functions do not require touching these.
          </Paragraph>
          <Divider />
          <Paragraph>
            <strong>Your Company ID:</strong> <Text code>{company?.id || user?.tenantId}</Text>
          </Paragraph>
          <Paragraph>
            <strong>Domain:</strong> <Text code>ginie.space</Text>
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
        <Text type="secondary">Manage your company branding, team permissions, and account settings.</Text>
      </div>

      <Tabs items={tabItems} size="large" />
    </div>
  );
}
