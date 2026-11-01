'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Select } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label={t.auth.emailLabel}
            name="email"
            initialValue="admin@ginie.space"
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

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontWeight: 600 }}>
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
