'use client';

import React from 'react';
import { Card, Button, Typography, Result } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function RegisterPage() {
  const { brandColor } = useApp();
  const router = useRouter();

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
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          borderRadius: 16,
          border: '1px solid #334155',
          textAlign: 'center',
        }}
      >
        <Result
          icon={<LockOutlined style={{ color: '#faad14', fontSize: 64 }} />}
          title={<Title level={3} style={{ margin: 0 }}>Registration Closed</Title>}
          subTitle={
            <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 14 }}>
              This GINIE CRM installation is configured exclusively for <strong>Master Administrator</strong> use.
              Public sign-ups and third-party company accounts are disabled.
            </Paragraph>
          }
          extra={[
            <Button
              type="primary"
              key="signin"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/login')}
              style={{ height: 42, paddingLeft: 24, paddingRight: 24, fontWeight: 600 }}
            >
              Sign In as Master Admin
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}
