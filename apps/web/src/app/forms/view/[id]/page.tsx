'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Result, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function PublicFormViewPage() {
  const params = useParams();
  const formId = params?.id as string;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post(`/api/public/forms/${formId}/submit`, values);
      setSubmitted(true);
    } catch (err: any) {
      message.error(err.message || 'Could not submit form. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f2f5',
          padding: 24,
        }}
      >
        <Card style={{ maxWidth: 500, width: '100%', borderRadius: 12, textAlign: 'center' }}>
          <Result
            status="success"
            title="Thank You!"
            subTitle="Your information has been received. Our team will contact you shortly."
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 540, width: '100%', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Get in Touch
          </Title>
          <Text type="secondary">
            Please fill in your details below and we will get back to you.
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="name"
            label="Your Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="e.g. Rahul Sharma" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input placeholder="+91 98200 00000" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="rahul@example.com" />
          </Form.Item>

          <Form.Item name="message" label="How can we help you?">
            <Input.TextArea rows={4} placeholder="Tell us about your requirements..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block>
            Submit Inquiry
          </Button>
        </Form>
      </Card>
    </div>
  );
}
