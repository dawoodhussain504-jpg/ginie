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
  Button,
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
  ArrowRightOutlined,
  QrcodeOutlined,
  ShopOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function SubscriptionsPage() {
  const { user, brandColor } = useApp();
  const [stats, setStats] = useState({
    leadsUsed: 0,
    discoveryUsed: 0,
    workflowsActive: 4,
    hasDiscoveryActive: false,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/subscriptions/current');
      if (data) {
        setStats({
          leadsUsed: data.usage?.leadsUsed || 0,
          discoveryUsed: data.usage?.discoveryUsed || 0,
          workflowsActive: data.usage?.workflowsActive || 0,
          hasDiscoveryActive: Boolean(data.plan?.name?.includes('Discovery') || data.subscription?.status === 'active'),
        });
      }
    } catch (err) {
      console.error('Failed to load subscription stats:', err);
    }
  };

  const isSuperAdmin = Boolean(user?.isSuperAdmin);

  const coreFeatures = [
    { title: 'Multi-Trade ERP & Barcode POS Counter', desc: '11 specialized trade interfaces with instant camera/laser scanning.' },
    { title: '0% Fee Digital Storefront', desc: 'Public store link (ginie.space/store/...) connected directly to your inventory.' },
    { title: 'Visual Kanban Sales CRM & Daybook', desc: 'Custom deal stages, daily follow-ups cockpit, and cash register logs.' },
    { title: 'GST Invoices with Dynamic UPI QR', desc: 'Direct bank settlement via PhonePe, GPay, Paytm with zero gateway fees.' },
    { title: '1-Click Direct WhatsApp Outreach', desc: 'Pre-written sales pitch scripts without saving contacts to phonebook.' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size="middle">
          {isSuperAdmin ? (
            <CrownOutlined style={{ fontSize: 28, color: '#faad14' }} />
          ) : (
            <SafetyCertificateOutlined style={{ fontSize: 28, color: '#10b981' }} />
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {isSuperAdmin ? 'Master Admin Sovereign License' : 'GINIE & Add-ons'}
            </Title>
            <Text type="secondary">
              {isSuperAdmin
                ? 'Private Instance &bull; All Platform Capabilities Permanently Unlocked'
                : '100% Free Core Suite &bull; Transparent On-Demand Growth Add-ons'}
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
              <Tag
                color={isSuperAdmin ? 'gold' : 'green'}
                icon={<SafetyCertificateOutlined />}
                style={{ padding: '4px 12px', fontSize: 13, fontWeight: 700 }}
              >
                {isSuperAdmin ? 'SOVEREIGN OWNER TIER' : '100% FREE CORE TIER'}
              </Tag>
              <Badge
                status="processing"
                text={
                  <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    Active &bull; Lifetime Free Forever
                  </span>
                }
              />
            </div>
            <Title level={2} style={{ color: '#fff', margin: 0, marginTop: 4 }}>
              {isSuperAdmin
                ? 'Zero SaaS Paywalls &bull; Full Administrator Power'
                : 'Free Lifetime Access for Your Business'}
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: 0, marginTop: 8, fontSize: 14 }}>
              {isSuperAdmin
                ? 'This GINIE instance is dedicated strictly to private business operations. Public registration and search quotas are completely disabled.'
                : 'Your sales CRM, 11-trade POS counter, inventory ERP, and digital storefront are 100% free forever for you and your staff. No recurring auto-debit.'}
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 18,
                borderRadius: 12,
                display: 'inline-block',
                textAlign: 'center',
                minWidth: 160,
              }}
            >
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>RECURRING SOFTWARE FEE</Text>
              <div style={{ color: '#52c41a', fontSize: 32, fontWeight: 800 }}>₹0</div>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Lifetime Free Core</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* On-Demand Growth Add-on Card for Tenants */}
      {!isSuperAdmin && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            border: '2px solid #2563eb',
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row justify="space-between" align="middle" gutter={[20, 20]}>
            <Col xs={24} md={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Tag color="blue" style={{ fontWeight: 800 }}>ON-DEMAND GROWTH ADD-ON</Tag>
                {stats.hasDiscoveryActive ? (
                  <Tag color="green">Active Subscription</Tag>
                ) : (
                  <Tag color="default">Pay When Needed</Tag>
                )}
              </div>
              <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
                Google Maps Lead Discovery (Find Customers)
              </Title>
              <Paragraph style={{ color: '#475569', fontSize: 14, margin: '6px 0 0' }}>
                Extract verified local business mobile numbers, addresses, and Google star ratings directly into your CRM sales pipeline. One-time ₹599 UPI QR payment — zero auto-debit lock-in.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#2563eb' }}>₹599</span>
                <span style={{ fontSize: 13, color: '#64748b' }}> / Month</span>
              </div>
              <Link href="/find-customers">
                <Button
                  type="primary"
                  icon={<CompassOutlined />}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    fontWeight: 700,
                    borderRadius: 8,
                    height: 40,
                  }}
                >
                  {stats.hasDiscoveryActive ? 'Open Find Customers' : 'Activate via UPI QR'}
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>
      )}

      {/* Quotas & Capacity Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={4}>
              <Space>
                <CompassOutlined style={{ color: brandColor, fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Google Places Searches</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>
                {isSuperAdmin ? 'Unlimited' : (stats.hasDiscoveryActive ? 'Active' : 'On-Demand')}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Used this month: <strong>{stats.discoveryUsed}</strong>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={4}>
              <Space>
                <UsergroupAddOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Customer Leads</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
                Unlimited
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Active in pipeline: <strong>{stats.leadsUsed}</strong>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={4}>
              <Space>
                <BarcodeOutlined style={{ color: '#722ed1', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>ERP & POS Products</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>
                Unlimited
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                SKUs & Barcodes: <strong>Active</strong>
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={4}>
              <Space>
                <ShopOutlined style={{ color: '#ea580c', fontSize: 18 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Digital Storefront</Text>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ea580c' }}>
                0% Commission
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Public Catalog: <strong>Enabled</strong>
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Included Core Capabilities */}
      <Card
        title={
          <Space>
            <CheckCircleFilled style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 700 }}>
              {isSuperAdmin ? 'Permanently Unlocked Platform Capabilities' : 'Included 100% Free Core Features'}
            </span>
          </Space>
        }
        style={{ borderRadius: 16 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={coreFeatures}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleFilled style={{ color: '#52c41a', fontSize: 18, marginTop: 4 }} />}
                title={<Text strong style={{ fontSize: 15 }}>{item.title}</Text>}
                description={<Text type="secondary">{item.desc}</Text>}
              />
              <Tag color="green" style={{ fontWeight: 600 }}>Active</Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
