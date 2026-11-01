'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Select } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function RegisterPage() {
  const { t, login, locale, setLocale, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/api/auth/register', values);
      login(res.tokens.accessToken, res.user);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
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
          maxWidth: 460,
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
              width: 54,
              height: 54,
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
            {locale === 'hi' ? 'नया बिजनेस अकाउंट बनाएं' : 'Create Business Account'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
            {locale === 'hi'
              ? '30 सेकंड में अपना CRM सेटअप करें — कोई क्रेडिट कार्ड नहीं चाहिए'
              : 'Set up your smart CRM in 30 seconds — No card required'}
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
            label={locale === 'hi' ? 'दुकान / बिजनेस / कंपनी का नाम' : 'Business / Company Name'}
            name="companyName"
            rules={[
              { required: true, message: 'Please enter your business or company name' },
              { min: 2, message: 'Must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder={locale === 'hi' ? 'उदा. शर्मा इलेक्ट्रॉनिक्स' : 'e.g. Apex Engineering, Sharma Traders'}
            />
          </Form.Item>

          <Form.Item
            label={locale === 'hi' ? 'आपका पूरा नाम' : 'Your Full Name'}
            name="name"
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 2, message: 'Must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={locale === 'hi' ? 'उदा. अमित शर्मा' : 'e.g. Rajesh Sharma'}
            />
          </Form.Item>

          <Form.Item
            label={locale === 'hi' ? 'मोबाइल / व्हाट्सएप नंबर' : 'Phone / WhatsApp Number'}
            name="phone"
            rules={[{ required: false }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="e.g. +91 98765 43210"
            />
          </Form.Item>

          <Form.Item
            label={locale === 'hi' ? 'ईमेल एड्रेस' : 'Email Address'}
            name="email"
            rules={[
              { required: true, message: 'Please enter a valid email address' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="owner@yourbusiness.com"
            />
          </Form.Item>

          <Form.Item
            label={locale === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 600, fontSize: 15 }}
            >
              {locale === 'hi' ? 'अकाउंट बनाएं और शुरू करें' : 'Create Business Account'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {locale === 'hi' ? 'पहले से अकाउंट है? ' : 'Already have an account? '}
              <Link href="/login" style={{ color: brandColor, fontWeight: 600 }}>
                {locale === 'hi' ? 'साइन इन करें' : 'Sign In'}
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
