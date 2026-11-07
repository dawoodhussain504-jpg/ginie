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
  FireOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';
import { AppButton } from '@/components/common';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const { Title, Text } = Typography;

function formatDueTime(dueAt?: string | Date) {
  if (!dueAt) return 'Aaj';
  const date = new Date(dueAt);
  if (isNaN(date.getTime())) return 'Aaj';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `Aaj, ${timeStr}`;
  if (isTomorrow) return `Kal, ${timeStr}`;
  return `${formatDateIndian(date)} ${timeStr}`;
}

function maskPhoneNumber(phone?: string) {
  if (!phone) return 'Online ●';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length >= 10) {
    const last3 = clean.slice(-3);
    const first2 = clean.slice(clean.length - 10, clean.length - 8);
    return `+91 ${first2}*** **${last3}`;
  }
  return 'Online ●';
}

export default function HomePage() {
  const { t, user, brandColor } = useApp();
  const router = useRouter();
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
      setWaSession(sessionRes);

      // Deduplicate tasks by title and id to guarantee unique, realistic rows
      const rawTasks = tasksRes || [];
      const seen = new Set<string>();
      const uniqueTasks: any[] = [];
      rawTasks.forEach((t: any) => {
        const key = (t.title || '').trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueTasks.push(t);
        }
      });
      setTodayTasks(uniqueTasks);

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
        tasksDueCount: uniqueTasks.length,
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
      message.success('Kaam poora hua! Sabash! 🎉');
      setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
      setStats((prev) => ({ ...prev, tasksDueCount: Math.max(0, prev.tasksDueCount - 1) }));
    } catch (err: any) {
      message.error(err.message || 'Task update nahi ho saka.');
    }
  };

  const handleOpenWhatsAppChat = (phone: string, customerName: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const target = clean.length === 10 ? '91' + clean : clean;
    router.push(`/whatsapp?phone=${target}`);
  };

  const columns = [
    {
      title: t.customers.fields.name,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Link href="/customers" style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>
            {text}
          </Link>
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
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.dashboard.title}
          </Title>
          <Text type="secondary">
            Namaste {user?.name || 'Vyapari'} ji! Aapka business ek nazar mein.
          </Text>
        </div>

        <Space wrap>
          <Link href="/customers">
            <AppButton icon={<UsergroupAddOutlined />}>
              + Customer
            </AppButton>
          </Link>
          <Link href="/billing">
            <AppButton icon={<span style={{ fontWeight: 700, fontSize: 14 }}>₹</span>}>
              Invoice Banayein
            </AppButton>
          </Link>
          <Link href="/find-customers">
            <AppButton type="primary" icon={<CompassOutlined />}>
              Naye Customer Dhundhein
            </AppButton>
          </Link>
        </Space>
      </div>

      {/* KPI Statistic Cards (Visible in First Fold Above Tasks) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={12} lg={6}>
          <Link href="/customers" style={{ textDecoration: 'none' }}>
            <Card loading={loading} hoverable style={{ borderRadius: 12, cursor: 'pointer' }} bodyStyle={{ padding: '14px 12px' }}>
              <Statistic
                title={t.dashboard.newCustomersCard}
                value={stats.newCustomersCount}
                prefix={<UsergroupAddOutlined style={{ color: brandColor, marginRight: 8 }} />}
              />
            </Card>
          </Link>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Link href="/sales" style={{ textDecoration: 'none' }}>
            <Card loading={loading} hoverable style={{ borderRadius: 12, cursor: 'pointer' }} bodyStyle={{ padding: '14px 12px' }}>
              <Statistic
                title={t.dashboard.activeSalesCard}
                value={stats.activeSalesCount}
                prefix={<FundProjectionScreenOutlined style={{ color: '#faad14', marginRight: 8 }} />}
              />
            </Card>
          </Link>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Link href="/sales" style={{ textDecoration: 'none' }}>
            <Card loading={loading} hoverable style={{ borderRadius: 12, cursor: 'pointer' }} bodyStyle={{ padding: '14px 12px' }}>
              <Statistic
                title={t.dashboard.wonSalesCard}
                value={stats.salesWonAmount}
                formatter={(val) => formatIndianCurrency(Number(val))}
                prefix={<TrophyOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              />
            </Card>
          </Link>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Link href="/tasks" style={{ textDecoration: 'none' }}>
            <Card loading={loading} hoverable style={{ borderRadius: 12, cursor: 'pointer' }} bodyStyle={{ padding: '14px 12px' }}>
              <Statistic
                title={t.dashboard.tasksDueCard}
                value={stats.tasksDueCount}
                prefix={<CheckCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
              />
            </Card>
          </Link>
        </Col>
      </Row>

      {/* AAJ KA KAAM (Action Area - Single Language, No Jargon) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          border: '1.5px solid #bae0ff',
          borderRadius: 16,
          padding: '16px 14px',
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(22, 119, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#1677ff',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <ThunderboltFilled style={{ marginRight: 6 }} /> Aaj Ka Kaam
            </span>
            <Text strong style={{ fontSize: 15, color: '#0958d9' }}>
              Priority Actions & Follow-ups
            </Text>
          </div>

          <Space size="middle">
            {waSession?.status === 'connected' ? (
              <Badge status="success" text={<span style={{ fontSize: 12, color: '#389e0d' }}>WhatsApp Active ({maskPhoneNumber(waSession.phone)})</span>} />
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
          {/* Left Column: Scheduled Calls & Tasks */}
          <Col xs={24} lg={14}>
            <Card
              size="small"
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1677ff' }} />
                  <span>Scheduled Calls & Tasks</span>
                  <Tag color="blue">{todayTasks.length} Pending</Tag>
                </Space>
              }
              extra={
                <Link href="/tasks">
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    View all ({todayTasks.length}) <ArrowRightOutlined />
                  </Button>
                </Link>
              }
              style={{ borderRadius: 12, height: '100%' }}
            >
              {todayTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {todayTasks.slice(0, 4).map((task) => {
                    const phone = task.contactPhone || '';
                    const contactName = task.contactName || '';

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
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <Tag color={task.priority === 'high' ? 'red' : 'blue'} style={{ fontSize: 11, borderRadius: 4, margin: 0 }}>
                              {formatDueTime(task.dueAt)}
                            </Tag>
                            <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                              {task.title}
                            </Text>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {task.description && <span>{task.description}</span>}
                            {contactName && (
                              <span style={{ marginLeft: task.description ? 6 : 0 }}>
                                {task.description ? '• ' : ''}
                                <Link href="/customers" style={{ color: '#1677ff', fontWeight: 600, textDecoration: 'none' }}>
                                  {contactName}
                                </Link>
                              </span>
                            )}
                          </div>
                        </div>

                        <Space size="small" style={{ flexShrink: 0 }}>
                          {phone && (
                            <>
                              <Tooltip title={`Call ${phone}`}>
                                <a href={`tel:${phone}`}>
                                  <Button
                                    size="small"
                                    type="primary"
                                    shape="circle"
                                    aria-label={`Call ${phone}`}
                                    icon={<PhoneOutlined />}
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                  />
                                </a>
                              </Tooltip>

                              <Tooltip title="Send WhatsApp message">
                                <Button
                                  size="small"
                                  shape="circle"
                                  aria-label="Send WhatsApp message"
                                  icon={<WhatsAppOutlined />}
                                  onClick={() => handleOpenWhatsAppChat(phone, contactName || task.title)}
                                  style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                                />
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Kaam ho gaya (Mark Done)">
                            <Button
                              size="small"
                              shape="circle"
                              aria-label="Mark task as done"
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

          {/* Right Column: Stuck Deals & Inquiries */}
          <Col xs={24} lg={10}>
            <Card
              size="small"
              title={
                <Space>
                  <FireOutlined style={{ color: '#fa8c16' }} />
                  <span>Stuck Deals & Inquiries</span>
                </Space>
              }
              extra={
                <Link href="/sales">
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    Deals <ArrowRightOutlined />
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
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 13, display: 'block', color: '#1e293b' }}>
                          {deal.title}
                        </Text>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          <span>{deal.company?.name || deal.contact?.name || 'Direct Customer'}</span>
                          <span style={{ margin: '0 4px' }}>•</span>
                          <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>{deal.stageName || 'In Progress'}</Tag>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
                  <div style={{ fontWeight: 600 }}>Deals are moving smoothly!</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>No deals are stalled right now.</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

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
              scroll={{ x: 600 }}
              locale={{ emptyText: t.customers.empty }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
