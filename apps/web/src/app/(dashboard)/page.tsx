'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Space } from 'antd';
import {
  UsergroupAddOutlined,
  FundProjectionScreenOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const { Title, Text } = Typography;

export default function HomePage() {
  const { t, user, brandColor } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newCustomersCount: 0,
    activeSalesCount: 0,
    salesWonAmount: 0,
    tasksDueCount: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [stageStats, setStageStats] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, pipelinesRes, tasksRes] = await Promise.all([
        api.get('/api/leads?pageSize=5'),
        api.get('/api/deals/pipelines'),
        api.get('/api/tasks?status=pending'),
      ]);

      const leads = leadsRes.items || [];
      setRecentCustomers(leads);

      let activeSales = 0;
      let wonAmount = 0;
      const stageData: any[] = [];

      if (pipelinesRes && pipelinesRes.length > 0) {
        const pipeline = pipelinesRes[0];
        pipeline.stages?.forEach((st: any) => {
          const dealCount = st.deals?.length || 0;
          let dealSum = 0;
          st.deals?.forEach((d: any) => {
            const val = Number(d.value) || 0;
            dealSum += val;
            if (d.status === 'won') {
              wonAmount += val;
            } else if (d.status === 'open') {
              activeSales += 1;
            }
          });

          stageData.push({
            name: st.name,
            count: dealCount,
            value: dealSum,
          });
        });
      }

      setStageStats(stageData);
      setStats({
        newCustomersCount: leadsRes.total || 0,
        activeSalesCount: activeSales,
        salesWonAmount: wonAmount,
        tasksDueCount: (tasksRes || []).length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t.customers.fields.name,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          {record.companyName && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.companyName}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t.customers.fields.phone,
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '—',
    },
    {
      title: t.customers.fields.city,
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || '—',
    },
    {
      title: t.customers.fields.status,
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => (
        <Tag color={status?.color || 'blue'}>{status?.name || 'New'}</Tag>
      ),
    },
    {
      title: t.customers.fields.created,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateIndian(date),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.dashboard.title}
          </Title>
          <Text type="secondary">
            {t.dashboard.welcome.replace('{name}', user?.name || 'there')}
          </Text>
        </div>

        <Link href="/find-customers">
          <Button type="primary" size="large" icon={<CompassOutlined />}>
            {t.discovery.title}
          </Button>
        </Link>
      </div>

      {/* KPI Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable>
            <Statistic
              title={t.dashboard.newCustomersCard}
              value={stats.newCustomersCount}
              prefix={<UsergroupAddOutlined style={{ color: brandColor, marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable>
            <Statistic
              title={t.dashboard.activeSalesCard}
              value={stats.activeSalesCount}
              prefix={<FundProjectionScreenOutlined style={{ color: '#faad14', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable>
            <Statistic
              title={t.dashboard.wonSalesCard}
              value={stats.salesWonAmount}
              formatter={(val) => formatIndianCurrency(Number(val))}
              prefix={<TrophyOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable>
            <Statistic
              title={t.dashboard.tasksDueCard}
              value={stats.tasksDueCount}
              prefix={<CheckCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts & Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={t.dashboard.salesFunnelTitle}
            loading={loading}
            extra={
              <Link href="/sales">
                <Button type="link" size="small">
                  {t.sales.boardView} <ArrowRightOutlined />
                </Button>
              </Link>
            }
            style={{ height: '100%' }}
          >
            {stageStats.length > 0 ? (
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageStats} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === 'value' ? formatIndianCurrency(value) : value,
                        name === 'value' ? 'Total Value' : 'Deals',
                      ]}
                    />
                    <Bar dataKey="count" fill={brandColor} radius={[4, 4, 0, 0]} name="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Text type="secondary">{t.sales.emptyColumn}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={t.dashboard.recentCustomersTitle}
            loading={loading}
            extra={
              <Link href="/customers">
                <Button type="link" size="small">
                  {t.customers.title} <ArrowRightOutlined />
                </Button>
              </Link>
            }
            style={{ height: '100%' }}
          >
            <Table
              dataSource={recentCustomers}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: t.customers.empty }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
