'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  List,
  Badge,
  Divider,
} from 'antd';
import {
  CrownOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  UsergroupAddOutlined,
  WhatsAppOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';

const { Title, Text, Paragraph } = Typography;

export default function SubscriptionsPage() {
  const { brandColor } = useApp();
  const [stats, setStats] = useState({
    leadsUsed: 0,
    discoveryUsed: 0,
    workflowsActive: 4,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('ginie_token');
      const res = await fetch('http://localhost:4000/api/subscriptions/current', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          leadsUsed: data.usage?.leadsUsed || 0,
          discoveryUsed: data.usage?.discoveryUsed || 0,
          workflowsActive: 4,
        });
      }
    } catch {}
  };

  const unlockedFeatures = [
    { title: 'Unlimited Google Places Lead Discovery', desc: 'No monthly search cap or per-query restrictions.' },
    { title: 'Autonomous WhatsApp Outreach', desc: 'Baileys bridge daemon with randomized human delay auto-replies.' },
    { title: 'AI Customer Intelligence', desc: 'Automatic 4-tone reply drafting, deal scoring, and call summaries.' },
    { title: 'Full Master Admin Ownership', desc: 'Permanent platform-level control with zero paywalls or recurring fees.' },
    { title: 'Two-Tier Database Isolation', desc: 'Prisma Client enforcement and PostgreSQL Row-Level Security (RLS).' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size="middle">
          <CrownOutlined style={{ fontSize: 28, color: '#faad14' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Master Admin Sovereign License
            </Title>
            <Text type="secondary">
              Private Instance &bull; All Platform Capabilities Permanently Unlocked
            </Text>
          </div>
        </Space>
      </div>

      {/* License Header Banner */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          color: '#fff',
        }}
      >
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Tag color="gold" icon={<SafetyCertificateOutlined />} style={{ padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
                SOVEREIGN OWNER TIER
              </Tag>
              <Badge status="processing" text={<span style={{ color: '#52c41a', fontWeight: 600 }}>Active &bull; Unlimited Lifetime</span>} />
            </div>
            <Title level={2} style={{ color: '#fff', margin: 0, marginTop: 4 }}>
              Zero SaaS Paywalls &bull; Full Administrator Power
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: 0, marginTop: 8, fontSize: 14 }}>
              This GINIE instance is dedicated strictly to your private business operations. Public registration, per-user seat licenses, and search quotas are completely disabled.
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 18, borderRadius: 12, display: 'inline-block', textAlign: 'center', minWidth: 160 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>RECURRING FEE</Text>
              <div style={{ color: '#52c41a', fontSize: 32, fontWeight: 800 }}>₹0</div>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Self-Hosted Private</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Quotas & Capacity Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space orientation="vertical" size={4}>
              <Space>
                <CompassOutlined style={{ color: brandColor, fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Google Places Searches</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>
                Unlimited
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Used this month: <strong>{stats.discoveryUsed}</strong>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space orientation="vertical" size={4}>
              <Space>
                <UsergroupAddOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Customer Leads</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
                Unlimited
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current database: <strong>{stats.leadsUsed}</strong>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space orientation="vertical" size={4}>
              <Space>
                <WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>WhatsApp Outreach</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#25D366' }}>
                Direct Bridge
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Human-like delay engine
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space orientation="vertical" size={4}>
              <Space>
                <DatabaseOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Architecture</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>
                Single Admin
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Zero public access
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Features Unlocked List */}
      <Card title="Permanent Sovereign Capabilities" style={{ borderRadius: 12 }}>
        <List
          itemLayout="horizontal"
          dataSource={unlockedFeatures}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 20, marginTop: 4 }} />}
                title={<strong style={{ fontSize: 15 }}>{item.title}</strong>}
                description={item.desc}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
