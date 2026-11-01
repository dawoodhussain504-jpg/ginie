'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Select, Checkbox, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined, KeyOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t, login, locale, setLocale, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoChips, setShowDemoChips] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('ginie_remembered_email');
    if (rememberedEmail) {
      form.setFieldsValue({
        email: rememberedEmail,
        remember: true,
      });
    }
  }, [form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (values.remember) {
        localStorage.setItem('ginie_remembered_email', values.email.trim());
      } else {
        localStorage.removeItem('ginie_remembered_email');
      }

      const res = await api.post('/api/auth/login', {
        email: values.email.trim(),
        password: values.password,
      });
      login(res.tokens.accessToken, res.user);
      if (res.user?.isSuperAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 24,
      }}
    >
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <Select
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'हिन्दी (Hindi)' },
          ]}
          prefix={<GlobalOutlined />}
        />
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          borderRadius: 16,
          border: '1px solid #334155',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 58,
              height: 58,
              borderRadius: 14,
              background: brandColor,
              color: '#fff',
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 12,
              boxShadow: '0 8px 16px rgba(22, 119, 255, 0.3)',
            }}
          >
            G
          </div>
          <Title level={3} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            GINIE CRM
          </Title>
          <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
            {locale === 'hi' ? 'अपने बिजनेस वर्कस्पेस में साइन इन करें' : 'Sign in to your business workspace'}
          </Text>
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label={t.auth.emailLabel}
            name="email"
            rules={[
              { required: true, message: t.common.pleaseCheckField },
              { type: 'email', message: t.common.pleaseCheckField },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label={t.auth.passwordLabel}
            name="password"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{locale === 'hi' ? 'मुझे याद रखें' : 'Remember me'}</Checkbox>
            </Form.Item>
            <a
              onClick={(e) => {
                e.preventDefault();
                setShowDemoChips(!showDemoChips);
              }}
              style={{ fontSize: 12, color: '#8c8c8c' }}
            >
              <KeyOutlined /> {showDemoChips ? 'Hide test login' : 'Test logins'}
            </a>
          </div>

          {showDemoChips && (
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, marginBottom: 16, border: '1px dashed #cbd5e1' }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                Quick Test Accounts:
              </Text>
              <Space wrap size="small">
                <Button
                  size="small"
                  onClick={() => form.setFieldsValue({ email: 'admin@ginie.space', password: 'Admin@123' })}
                >
                  Super Admin
                </Button>
                <Button
                  size="small"
                  onClick={() => form.setFieldsValue({ email: 'sunil@acme.in', password: 'password123' })}
                >
                  Sales Staff (Sunil)
                </Button>
              </Space>
            </div>
          )}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              {t.auth.signInButton}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {locale === 'hi' ? 'नया बिजनेस है? ' : 'New to GINIE? '}
              <Link href="/register" style={{ color: brandColor, fontWeight: 600 }}>
                {locale === 'hi' ? 'नया अकाउंट बनाएं' : 'Create Business Account'}
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
