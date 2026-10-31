'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t, login, locale, setLocale, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/api/auth/login', values);
      login(res.tokens.accessToken, res.user);
      router.push('/');
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
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f4ff 100%)',
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
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 54,
              height: 54,
              borderRadius: 12,
              background: brandColor,
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            G
          </div>
          <Title level={3} style={{ margin: 0 }}>
            {t.auth.signInTitle}
          </Title>
          <Text type="secondary">{t.auth.signInSubtitle}</Text>
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label={t.auth.emailLabel}
            name="email"
            rules={[
              { required: true, message: t.common.pleaseCheckField },
              { type: 'email', message: t.common.pleaseCheckField },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@ginie.space" />
          </Form.Item>

          <Form.Item
            label={t.auth.passwordLabel}
            name="password"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t.auth.signInButton}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link href="/register" style={{ color: brandColor }}>
              {t.auth.dontHaveAccount}
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
