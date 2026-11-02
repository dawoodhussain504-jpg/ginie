'use client';

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Badge,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  UsergroupAddOutlined,
  FundProjectionScreenOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  ArrowRightOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  DollarCircleOutlined,
  PlusOutlined,
  FireOutlined,
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const { Title, Text, Paragraph } = Typography;

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
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [stuckDeals, setStuckDeals] = useState<any[]>([]);
  const [waSession, setWaSession] = useState<any | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, pipelinesRes, tasksRes, sessionRes] = await Promise.all([
        api.get('/api/leads?pageSize=5').catch(() => ({ items: [], total: 0 })),
        api.get('/api/deals/pipelines').catch(() => []),
        api.get('/api/tasks?status=pending').catch(() => []),
        api.get('/api/whatsapp/session').catch(() => null),
      ]);

      const leads = leadsRes?.items || [];
      setRecentCustomers(leads);
      setTodayTasks(tasksRes || []);
      setWaSession(sessionRes);

      let activeSales = 0;
      let wonAmount = 0;
      const stageData: any[] = [];
      const extractedDeals: any[] = [];

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
              extractedDeals.push({
                ...d,
                stageName: st.name,
              });
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
      setStuckDeals(extractedDeals.slice(0, 3));
      setStats({
        newCustomersCount: leadsRes?.total || leads.length || 0,
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

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { status: 'completed' });
      message.success('Task marked as completed! Sabash! 🎉');
      setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
      setStats((prev) => ({ ...prev, tasksDueCount: Math.max(0, prev.tasksDueCount - 1) }));
    } catch (err: any) {
      message.error(err.message || 'Failed to update task.');
    }
  };

  const handleOpenWhatsAppChat = (phone: string, customerName: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const target = clean.length === 10 ? '91' + clean : clean;
    const msg = `Namaste ${customerName || 'Ji'}, following up regarding our discussion. How can we assist you today?`;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(msg)}`, '_blank');
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
      {/* Top Welcome & Quick Actions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.dashboard.title}
          </Title>
          <Text type="secondary">
            Namaste {user?.name || 'there'}! Aapka business cockpit taiyaar hai.
          </Text>
        </div>

        <Space wrap>
          <Link href="/customers">
            <Button icon={<UsergroupAddOutlined />}>
              + New Lead
            </Button>
          </Link>
          <Link href="/billing">
            <Button icon={<DollarCircleOutlined />}>
              + GST Invoice
            </Button>
          </Link>
          <Link href="/find-customers">
            <Button type="primary" icon={<CompassOutlined />}>
              {t.discovery.title}
            </Button>
          </Link>
        </Space>
      </div>

      {/* AAJ KA KAAM (TODAY'S WORK ACTION COCKPIT) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          border: '1.5px solid #bae0ff',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(22, 119, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background: '#1677ff',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              ⚡ AAJ KA KAAM (आज का काम)
            </span>
            <Text strong style={{ fontSize: 16, color: '#0958d9' }}>
              Priority Actions & Follow-ups
            </Text>
          </div>

          <Space size="middle">
            {waSession?.status === 'connected' ? (
              <Badge status="success" text={<span style={{ fontSize: 12, color: '#389e0d' }}>WhatsApp Active ({waSession.phone || 'Online'})</span>} />
            ) : (
              <Link href="/whatsapp">
                <Tag color="orange" icon={<WhatsAppOutlined />} style={{ cursor: 'pointer' }}>
                  Connect WhatsApp QR
                </Tag>
              </Link>
            )}
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {/* Left Column: Scheduled Calls & Follow-ups */}
          <Col xs={24} lg={14}>
            <Card
              size="small"
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1677ff' }} />
                  <span>Scheduled Calls & Tasks (कॉल और फॉलो-अप्स)</span>
                  <Tag color="blue">{todayTasks.length} Pending</Tag>
                </Space>
              }
              style={{ borderRadius: 12, height: '100%' }}
            >
              {todayTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {todayTasks.slice(0, 4).map((task) => {
                    const phone = task.contactPhone || '';
                    const contactName = task.contactName || task.title;

                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#fff',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
                            {task.priority === 'high' && <Tag color="red" style={{ fontSize: 10 }}>HIGH</Tag>}
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {task.description && <span>{task.description} &bull; </span>}
                            {task.contactName && <span style={{ color: '#1677ff', fontWeight: 600 }}>{task.contactName}</span>}
                          </div>
                        </div>

                        <Space size="small">
                          {phone && (
                            <>
                              <Tooltip title={`Call ${phone}`}>
                                <a href={`tel:${phone}`}>
                                  <Button
                                    size="small"
                                    type="primary"
                                    shape="circle"
                                    icon={<PhoneOutlined />}
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                  />
                                </a>
                              </Tooltip>

                              <Tooltip title="Send WhatsApp follow-up">
                                <Button
                                  size="small"
                                  shape="circle"
                                  icon={<WhatsAppOutlined />}
                                  onClick={() => handleOpenWhatsAppChat(phone, contactName)}
                                  style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                                />
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Mark as Done">
                            <Button
                              size="small"
                              shape="circle"
                              icon={<CheckOutlined />}
                              onClick={() => handleCompleteTask(task.id)}
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, color: '#389e0d' }}>All follow-up tasks completed!</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>You are completely caught up with today's schedule.</Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column: Stuck Deals & High Value Pipeline */}
          <Col xs={24} lg={10}>
            <Card
              size="small"
              title={
                <Space>
                  <FireOutlined style={{ color: '#fa8c16' }} />
                  <span>Stuck Deals & Hot Inquiries (अटके हुए सौदे)</span>
                </Space>
              }
              extra={
                <Link href="/sales">
                  <Button type="link" size="small">
                    Pipeline <ArrowRightOutlined />
                  </Button>
                </Link>
              }
              style={{ borderRadius: 12, height: '100%' }}
            >
              {stuckDeals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stuckDeals.map((deal) => (
                    <div
                      key={deal.id}
                      style={{
                        padding: '10px 12px',
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #fed7aa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>
                          {deal.title}
                        </Text>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {deal.company?.name || deal.contact?.name || 'Direct Lead'} &bull;{' '}
                          <Tag color="orange" style={{ fontSize: 10 }}>{deal.stageName || 'In Progress'}</Tag>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#d4380d' }}>
                          {formatIndianCurrency(Number(deal.value || 0))}
                        </div>
                        <Link href="/sales">
                          <Button size="small" type="link" style={{ padding: 0, height: 'auto', fontSize: 11 }}>
                            Follow up &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                  <div style={{ fontWeight: 600 }}>Pipeline is moving smoothly!</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>No deals are stalled right now.</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* KPI Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title={t.dashboard.newCustomersCard}
              value={stats.newCustomersCount}
              prefix={<UsergroupAddOutlined style={{ color: brandColor, marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title={t.dashboard.activeSalesCard}
              value={stats.activeSalesCount}
              prefix={<FundProjectionScreenOutlined style={{ color: '#faad14', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable style={{ borderRadius: 12 }}>
            <Statistic
              title={t.dashboard.wonSalesCard}
              value={stats.salesWonAmount}
              formatter={(val) => formatIndianCurrency(Number(val))}
              prefix={<TrophyOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} hoverable style={{ borderRadius: 12 }}>
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
            style={{ height: '100%', borderRadius: 12 }}
          >
            {stageStats.length > 0 ? (
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageStats} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip
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
            style={{ height: '100%', borderRadius: 12 }}
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
