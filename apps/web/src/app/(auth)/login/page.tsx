'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Select,
  Checkbox,
  Space,
  Tabs,
  Modal,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t, login, locale, setLocale, brandColor } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WhatsApp OTP Login States
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // New user registration fields when signing up via WhatsApp
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Forgot password modal
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [emailForm] = Form.useForm();
  const [phoneForm] = Form.useForm();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('ginie_remembered_email');
    if (rememberedEmail) {
      emailForm.setFieldsValue({
        email: rememberedEmail,
        remember: true,
      });
    }
  }, [emailForm]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 1. Email/Password Login
  const onEmailLogin = async (values: any) => {
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
      message.success(locale === 'hi' ? 'सफलतापूर्वक साइन इन किया!' : 'Signed in successfully!');

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

  // 2. Send WhatsApp OTP
  const handleSendOtp = async (values?: any) => {
    const rawPhone = values?.phone || phone;
    const cleanDigits = rawPhone.replace(/\D/g, '');

    if (cleanDigits.length < 10) {
      message.error(locale === 'hi' ? 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/api/auth/otp/send', { phone: rawPhone });
      setPhone(rawPhone);
      setOtpSent(true);
      setIsNewUser(!!res.isNewUser);
      setCountdown(45);
      message.success(res.message || 'OTP sent to your WhatsApp number!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify WhatsApp OTP & Login
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 6) {
      message.error(locale === 'hi' ? 'कृपया 6-अंकों का OTP कोड दर्ज करें' : 'Please enter the 6-digit OTP code');
      return;
    }

    if (isNewUser && (!newCompanyName.trim() || !newUserName.trim())) {
      message.error('Please enter your Business Name and Full Name to complete setup.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const payload: any = {
        phone,
        otp: otpCode.trim(),
      };

      if (isNewUser) {
        payload.registrationData = {
          companyName: newCompanyName.trim(),
          name: newUserName.trim(),
        };
      }

      const res = await api.post('/api/auth/otp/verify', payload);

      login(res.tokens.accessToken, res.user);
      message.success(
        isNewUser
          ? 'Business Account created & signed in! Welcome to GINIE!'
          : (locale === 'hi' ? 'सफलतापूर्वक साइन इन किया!' : 'Signed in successfully!')
      );

      if (res.user?.isSuperAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Request Password Reset
  const handleRequestReset = async () => {
    if (!forgotIdentifier.trim()) {
      message.error('Please enter your registered email or WhatsApp number');
      return;
    }
    setForgotLoading(true);
    try {
      await api.post('/api/auth/forgot-password/request', { identifier: forgotIdentifier });
      message.success('Verification code sent to your WhatsApp / Email!');
      setForgotStep(2);
    } catch (err: any) {
      message.error(err.message || 'Failed to send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 5. Submit Password Reset
  const handleSubmitReset = async () => {
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      message.error('Please enter the 6-digit verification code');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      message.error('New password must be at least 6 characters');
      return;
    }
    setForgotLoading(true);
    try {
      await api.post('/api/auth/forgot-password/reset', {
        identifier: forgotIdentifier,
        otp: forgotOtp.trim(),
        newPassword: forgotNewPass,
      });
      message.success('Password reset successfully! Please sign in with your new password.');
      setForgotModalVisible(false);
      setForgotStep(1);
      setActiveTab('email');
    } catch (err: any) {
      message.error(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
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
      {/* Language Switcher */}
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
          maxWidth: 440,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          borderRadius: 18,
          border: '1px solid #334155',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: brandColor,
              color: '#fff',
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 10,
              boxShadow: '0 8px 16px rgba(22, 119, 255, 0.35)',
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
            closable
            onClose={() => setErrorMessage(null)}
            style={{ marginBottom: 18 }}
          />
        )}

        {/* Dual Mode Login Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k as any);
            setErrorMessage(null);
          }}
          centered
          size="middle"
          style={{ marginBottom: 16 }}
          items={[
            {
              key: 'whatsapp',
              label: (
                <Space>
                  <WhatsAppOutlined style={{ color: '#25D366', fontSize: 16 }} />
                  <span>{locale === 'hi' ? 'व्हाट्सएप लॉगिन' : 'WhatsApp OTP'}</span>
                </Space>
              ),
              children: (
                <div>
                  {!otpSent ? (
                    /* Step 1: Enter Phone Number */
                    <Form form={phoneForm} layout="vertical" onFinish={handleSendOtp} size="large">
                      <Form.Item
                        label={locale === 'hi' ? 'व्हाट्सएप मोबाइल नंबर' : 'WhatsApp Mobile Number'}
                        name="phone"
                        rules={[
                          { required: true, message: 'Please enter your mobile number' },
                          { min: 10, message: 'Must be at least 10 digits' },
                        ]}
                        extra={
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {locale === 'hi'
                              ? 'हम आपके व्हाट्सएप नंबर पर 6-अंकों का वेरिफिकेशन कोड भेजेंगे'
                              : 'We will send a 6-digit one-time code to your WhatsApp'}
                          </Text>
                        }
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: '#888' }} />}
                          addonBefore="+91"
                          placeholder="98765 43210"
                          maxLength={15}
                          autoFocus
                        />
                      </Form.Item>

                      <Form.Item style={{ marginTop: 20, marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          icon={<WhatsAppOutlined />}
                          style={{
                            height: 44,
                            fontWeight: 600,
                            background: '#25D366',
                            borderColor: '#25D366',
                          }}
                        >
                          {locale === 'hi' ? 'व्हाट्सएप पर कोड भेजें' : 'Send Code on WhatsApp'}
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    /* Step 2: Enter 6-digit OTP */
                    <div>
                      <div
                        style={{
                          background: '#f6ffed',
                          border: '1px solid #b7eb8f',
                          padding: '12px 14px',
                          borderRadius: 10,
                          marginBottom: 16,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <Text strong style={{ color: '#389e0d', display: 'block', fontSize: 12 }}>
                            ✓ Code sent to WhatsApp
                          </Text>
                          <Text style={{ fontSize: 13, color: '#333' }}>+91 {phone.replace(/\D/g, '').slice(-10)}</Text>
                        </div>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setCountdown(0);
                          }}
                          style={{ padding: 0 }}
                        >
                          Change
                        </Button>
                      </div>

                      {isNewUser && (
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: brandColor }}>
                            ★ New business setup:
                          </Text>
                          <Input
                            placeholder="Your Business / Shop Name"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            style={{ marginBottom: 8 }}
                          />
                          <Input
                            placeholder="Your Full Name"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                          />
                        </div>
                      )}

                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                          Enter 6-Digit Verification Code:
                        </Text>
                        <Input.OTP
                          length={6}
                          value={otpCode}
                          onChange={(val) => setOtpCode(val)}
                          size="large"
                          autoFocus
                          style={{ width: '100%', justifyContent: 'space-between' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Didn't receive code?
                        </Text>
                        {countdown > 0 ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Resend in {countdown}s
                          </Text>
                        ) : (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => handleSendOtp({ phone })}
                            style={{ padding: 0, fontSize: 12 }}
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>

                      <Button
                        type="primary"
                        onClick={handleVerifyOtp}
                        loading={loading}
                        block
                        style={{ height: 44, fontWeight: 600, fontSize: 15 }}
                      >
                        {locale === 'hi' ? 'वेरीफाई करें और साइन इन करें' : 'Verify & Sign In'}
                      </Button>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'email',
              label: (
                <Space>
                  <MailOutlined style={{ fontSize: 15 }} />
                  <span>{locale === 'hi' ? 'ईमेल और पासवर्ड' : 'Email & Password'}</span>
                </Space>
              ),
              children: (
                <Form form={emailForm} layout="vertical" onFinish={onEmailLogin} size="large">
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
                      placeholder="owner@yourcompany.com"
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

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>{locale === 'hi' ? 'मुझे याद रखें' : 'Remember me'}</Checkbox>
                    </Form.Item>

                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotModalVisible(true);
                      }}
                      style={{ fontSize: 12, color: brandColor, fontWeight: 600 }}
                    >
                      {locale === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                    </a>
                  </div>

                  <Form.Item style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ height: 44, fontWeight: 600, fontSize: 15 }}
                    >
                      {t.auth.signInButton}
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        {/* Create Account Link Footer */}
        <div style={{ textAlign: 'center', marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {locale === 'hi' ? 'नया बिजनेस है? ' : 'New to GINIE? '}
            <Link href="/register" style={{ color: brandColor, fontWeight: 600 }}>
              {locale === 'hi' ? 'नया अकाउंट बनाएं' : 'Create Business Account'}
            </Link>
          </Text>
        </div>
      </Card>

      {/* SELF-SERVICE FORGOT PASSWORD MODAL */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: brandColor }} />
            <span>Reset Your Password</span>
          </Space>
        }
        open={forgotModalVisible}
        onCancel={() => {
          setForgotModalVisible(false);
          setForgotStep(1);
          setForgotOtp('');
          setForgotNewPass('');
        }}
        footer={null}
        destroyOnClose
        width={420}
      >
        <div style={{ paddingTop: 8 }}>
          {forgotStep === 1 ? (
            <div>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                Enter your registered Email or WhatsApp mobile number. We will send a secure 6-digit verification code.
              </Text>

              <Form.Item label="Email or WhatsApp Phone" required>
                <Input
                  prefix={<UserOutlined />}
                  placeholder="owner@business.com or 9876543210"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                onClick={handleRequestReset}
                loading={forgotLoading}
                block
                size="large"
                style={{ height: 42, fontWeight: 600 }}
              >
                Send Verification Code
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ background: '#f6ffed', padding: 10, borderRadius: 8, marginBottom: 14, border: '1px solid #b7eb8f' }}>
                <Text strong style={{ color: '#389e0d', fontSize: 12 }}>
                  ✓ Verification code sent to {forgotIdentifier}
                </Text>
              </div>

              <Form.Item label="6-Digit Verification Code" required>
                <Input.OTP
                  length={6}
                  value={forgotOtp}
                  onChange={(val) => setForgotOtp(val)}
                  size="large"
                />
              </Form.Item>

              <Form.Item label="New Password (min 6 characters)" required>
                <Input.Password
                  placeholder="Enter your new password"
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  size="large"
                />
              </Form.Item>

              <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                <Button
                  type="primary"
                  onClick={handleSubmitReset}
                  loading={forgotLoading}
                  block
                  size="large"
                  style={{ height: 42, fontWeight: 600 }}
                >
                  Reset Password & Continue
                </Button>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setForgotStep(1)}
                  block
                  size="small"
                >
                  Back to enter email/phone
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
