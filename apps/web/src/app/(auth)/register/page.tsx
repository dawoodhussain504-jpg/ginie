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
  WhatsAppOutlined,
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
      const cleanDigits = (values.phone || '').replace(/\D/g, '');
      const last10 = cleanDigits.slice(-10);
      const payload = {
        ...values,
        email: values.email.trim(),
        phone: `+91 ${last10}`,
      };
      const res = await api.post('/api/auth/register', payload);
      login(res.tokens.accessToken, res.user, res.tokens.refreshToken);
      router.push('/dashboard');
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
            closable
            onClose={() => setErrorMessage(null)}
            action={
              (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('log in') || errorMessage.toLowerCase().includes('sign in')) ? (
                <Link href="/login">
                  <Button size="small" type="primary" style={{ background: '#2563eb', fontWeight: 600 }}>
                    {locale === 'hi' ? 'साइन इन करें' : 'Sign In Now'}
                  </Button>
                </Link>
              ) : undefined
            }
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
            label={locale === 'hi' ? 'बिजनेस की श्रेणी (Business Category)' : 'Business Category / Industry'}
            name="businessType"
            initialValue="retail"
            rules={[{ required: true, message: 'Please select your business category' }]}
          >
            <Select
              options={[
                { value: 'retail', label: locale === 'hi' ? 'दुकान, रीटेल, इलेक्ट्रॉनिक्स व किराना (Retail & Store)' : 'Retail Store, Kirana & Electronics' },
                { value: 'restaurant', label: locale === 'hi' ? 'रेस्टोरेंट, कैफे व फूड (Restaurant, Cafe & Food)' : 'Restaurant, Cafe & Food' },
                { value: 'wholesale', label: locale === 'hi' ? 'थोक व्यापार, डिस्ट्रीब्यूशन व बी2बी (Wholesale & B2B)' : 'Wholesale, Distribution & B2B' },
                { value: 'clinic', label: locale === 'hi' ? 'क्लिनिक, डॉक्टर व स्वास्थ्य (Clinic & Healthcare)' : 'Clinic, Doctor & Healthcare' },
                { value: 'services', label: locale === 'hi' ? 'सर्विस, कंसल्टिंग व एजेंसी (Services & Agency)' : 'Services, Consulting & Agency' },
                { value: 'factory', label: locale === 'hi' ? 'फैक्ट्री, मैन्युफैक्चरिंग व उद्योग (Factory & Manufacturing)' : 'Factory & Manufacturing' },
              ]}
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
            label={locale === 'hi' ? 'मोबाइल / व्हाट्सएप नंबर (अनिवार्य)' : 'Phone / WhatsApp Number (Required)'}
            name="phone"
            rules={[
              { required: true, message: locale === 'hi' ? 'कृपया अपना 10-अंकों का व्हाट्सएप नंबर दर्ज करें' : 'Please enter your 10-digit WhatsApp number' },
              {
                validator: (_, value) => {
                  const digits = (value || '').replace(/\D/g, '');
                  if (!digits || digits.length < 10) {
                    return Promise.reject(new Error(locale === 'hi' ? 'कम से कम 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Must be a valid 10-digit mobile number'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra={
              <Text type="secondary" style={{ fontSize: 11 }}>
                {locale === 'hi'
                  ? 'इस नंबर से आप बाद में 1-क्लिक व्हाट्सएप OTP से लॉगिन कर सकेंगे'
                  : 'You will use this number for 1-click passwordless WhatsApp OTP sign in'}
              </Text>
            }
          >
            <Input
              prefix={<PhoneOutlined />}
              addonBefore="+91"
              placeholder="98765 43210"
              maxLength={15}
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
            <div style={{ marginTop: 12 }}>
              <a
                href="https://wa.me/918797186001?text=Hello%20Team%20GINIE%2C%20I%20need%20assistance%20with%20registration"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#64748b',
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <WhatsAppOutlined style={{ color: '#25D366', fontSize: 14 }} />
                <span>{locale === 'hi' ? 'मदद चाहिए? Chat with GINIE' : 'Need help? Chat with GINIE'}</span>
              </a>
            </div>
          </div>
        </Form>
      </Card>

      {/* Floating "Chat with GINIE" WhatsApp Support Button */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100 }}>
        <a
          href="https://wa.me/918797186001?text=Hello%20Team%20GINIE%2C%20I%20need%20assistance%20with%20registration"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#25D366',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.35)',
            textDecoration: 'none',
          }}
        >
          <WhatsAppOutlined style={{ fontSize: 18 }} />
          <span>Chat with GINIE</span>
        </a>
      </div>
    </div>
  );
}
