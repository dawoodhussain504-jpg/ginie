'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Typography, Breadcrumb, Form, Input, Button, Row, Col, Space, Tag, message, Select } from 'antd';
import {
  ThunderboltFilled,
  ArrowLeftOutlined,
  WhatsAppOutlined,
  MailOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function ContactPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (values: any) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      message.success('Thank you! Your query has been logged. Our team will reach out via WhatsApp shortly.');
      
      // Also offer instant WhatsApp launch
      const queryText = encodeURIComponent(
        `Hello Team GINIE, I have an inquiry:\nName: ${values.name}\nBusiness: ${values.businessName || 'N/A'}\nTrade: ${values.trade || 'General'}\nQuery: ${values.message}`
      );
      window.open(`https://wa.me/918797186001?text=${queryText}`, '_blank');
      form.resetFields();
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Top Header */}
      <header
        style={{
          background: '#0B0F19',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThunderboltFilled style={{ color: '#ffffff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>GINIE</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: 999 }}>
              Support & Help
            </span>
          </Link>
          <Link href="/" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftOutlined /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: 1040, margin: '40px auto 80px', padding: '0 24px' }}>
        <Breadcrumb
          style={{ marginBottom: 20 }}
          items={[
            { title: <Link href="/">Home</Link> },
            { title: 'Contact & Support' },
          ]}
        />

        <Row gutter={[32, 32]}>
          {/* Left Column: Contact Channels */}
          <Col xs={24} md={10}>
            <div style={{ marginBottom: 24 }}>
              <Tag color="blue" style={{ fontWeight: 700, marginBottom: 8 }}>WE ARE HERE TO HELP</Tag>
              <Title level={2} style={{ fontSize: 28, fontWeight: 900, margin: 0, color: '#0f172a' }}>
                Get in Touch with Team GINIE
              </Title>
              <Paragraph style={{ color: '#64748b', fontSize: 15, marginTop: 10 }}>
                Whether you need assistance setting up your Barcode POS, configuring your 0% commission storefront, or have billing inquiries, our team is at your service.
              </Paragraph>
            </div>

            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              {/* WhatsApp Card */}
              <Card
                style={{
                  borderRadius: 12,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <WhatsAppOutlined style={{ color: '#fff', fontSize: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#166534' }}>Direct WhatsApp Helpdesk</div>
                    <div style={{ fontSize: 13, color: '#15803d', margin: '4px 0 10px' }}>
                      Fastest response for onboarding, bug reports, and UPI verification.
                    </div>
                    <a
                      href="https://wa.me/918797186001?text=Hello%20Team%20GINIE%2C%20I%20need%20support"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#ffffff',
                        background: '#16a34a',
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      <WhatsAppOutlined /> Message +91 8797186001
                    </a>
                  </div>
                </div>
              </Card>

              {/* Email & Hours */}
              <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 20 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <MailOutlined style={{ fontSize: 20, color: '#2563eb', marginTop: 3 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Email Addresses</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Support: support@ginie.space</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Billing & Invoicing: billing@ginie.space</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b', marginTop: 3 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Operating Hours</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Monday – Saturday: 9:30 AM – 7:30 PM IST</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Sunday: Closed (Emergency automated support)</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <EnvironmentOutlined style={{ fontSize: 20, color: '#dc2626', marginTop: 3 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Headquarters</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>GINIE Technologies, India</div>
                    </div>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Right Column: Query Form */}
          <Col xs={24} md={14}>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
              bodyStyle={{ padding: 32 }}
            >
              <Title level={3} style={{ fontSize: 22, fontWeight: 800, marginTop: 0, marginBottom: 6, color: '#0f172a' }}>
                Send Us a Message
              </Title>
              <Paragraph style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Fill in the details below and our technical specialists will reach back promptly.
              </Paragraph>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Your Name / आपका नाम"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                      <Input placeholder="e.g. Ramesh Kumar" style={{ height: 42, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="WhatsApp Mobile / मोबाइल नंबर"
                      rules={[{ required: true, message: 'Please enter 10-digit number' }]}
                    >
                      <Input placeholder="e.g. 9876543210" maxLength={10} style={{ height: 42, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="businessName" label="Business / Shop Name (दुकान का नाम)">
                      <Input placeholder="e.g. Sharma Kirana & General Store" style={{ height: 42, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="trade" label="Business Trade / श्रेणी" initialValue="retail">
                      <Select style={{ height: 42, borderRadius: 8 }}>
                        <Option value="retail">Retail & Kirana</Option>
                        <Option value="wholesale">Wholesale & B2B</Option>
                        <Option value="automobile">Automobile & Garage</Option>
                        <Option value="pharmacy">Pharmacy & Medical</Option>
                        <Option value="jewellery">Jewellery & Gold</Option>
                        <Option value="restaurant">Restaurant & F&B</Option>
                        <Option value="salon">Salon & Spa</Option>
                        <Option value="education">Coaching & Education</Option>
                        <Option value="clinic">Clinic & Healthcare</Option>
                        <Option value="manufacturing">Manufacturing</Option>
                        <Option value="services">Services & Agency</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="message"
                  label="Your Query / मैसेज"
                  rules={[{ required: true, message: 'Please enter your query' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="How can we help your business today? (e.g. Barcode POS setup, lead discovery query, or digital store connection)"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  icon={<SendOutlined />}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  Submit Query & Connect on WhatsApp
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B0F19', color: '#64748b', padding: '24px', textAlign: 'center', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        &copy; {new Date().getFullYear()} GINIE Space. All rights reserved. Built with pride for Indian Businesses.
      </footer>
    </div>
  );
}
