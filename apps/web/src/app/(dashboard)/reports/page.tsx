'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Button,
  Statistic,
  message,
  Tag,
  Space,
  Progress,
  Tooltip,
} from 'antd';
import {
  DownloadOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency } from '@ginie/i18n';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#ff4d4f'];

interface CommissionRecord {
  id: string;
  name: string;
  target: number;
  revenueWon: number;
  commissionRate: number; // e.g. 3.5 for 3.5%
  payoutStatus: 'paid' | 'pending';
  lastPayoutDate?: string;
}

export default function ReportsPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    sources: any[];
    funnel: any[];
    team: any[];
    totalCustomers: number;
  }>({
    sources: [],
    funnel: [],
    team: [],
    totalCustomers: 0,
  });

  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    {
      id: 'c-1',
      name: 'Rajesh Sharma',
      target: 500000,
      revenueWon: 680000,
      commissionRate: 5.0,
      payoutStatus: 'paid',
      lastPayoutDate: '2026-10-31',
    },
    {
      id: 'c-2',
      name: 'Pooja Verma',
      target: 400000,
      revenueWon: 395000,
      commissionRate: 3.5,
      payoutStatus: 'pending',
    },
    {
      id: 'c-3',
      name: 'Amit Deshmukh',
      target: 600000,
      revenueWon: 740000,
      commissionRate: 5.0,
      payoutStatus: 'pending',
    },
    {
      id: 'c-4',
      name: 'Sunil Rao',
      target: 350000,
      revenueWon: 280000,
      commissionRate: 3.0,
      payoutStatus: 'paid',
      lastPayoutDate: '2026-10-25',
    },
  ]);

  useEffect(() => {
    loadReports();
    const savedComm = localStorage.getItem('ginie_staff_commissions');
    if (savedComm) {
      try {
        setCommissions(JSON.parse(savedComm));
      } catch {}
    }
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/reports/overview');
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayout = (id: string) => {
    const updated = commissions.map((c) => {
      if (c.id === id) {
        const nextStatus = c.payoutStatus === 'paid' ? 'pending' : 'paid';
        return {
          ...c,
          payoutStatus: nextStatus as 'paid' | 'pending',
          lastPayoutDate: nextStatus === 'paid' ? new Date().toISOString().split('T')[0] : c.lastPayoutDate,
        };
      }
      return c;
    });
    setCommissions(updated);
    localStorage.setItem('ginie_staff_commissions', JSON.stringify(updated));
    message.success('Staff commission payout status updated.');
  };

  const handleExportCSV = () => {
    if (data.team.length === 0) return;
    const headers = ['Team Member', 'Assigned Customers', 'Active Deals', 'Won Deals', 'Revenue Won'];
    const rows = data.team.map((u) => [
      `"${u.name}"`,
      u.assignedCustomers,
      u.totalSales,
      u.wonSales,
      u.revenueWon,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `sales_report_${Date.now()}.csv`;
    link.click();
  };

  const handleExportCommissionStatement = () => {
    const headers = ['Staff Member', 'Target (INR)', 'Revenue Won (INR)', 'Achievement %', 'Commission Rate %', 'Commission Earned (INR)', 'Payout Status', 'Payout Date'];
    const rows = commissions.map((c) => {
      const pct = Math.round((c.revenueWon / c.target) * 100);
      const earned = Math.round((c.revenueWon * c.commissionRate) / 100);
      return [
        `"${c.name}"`,
        c.target,
        c.revenueWon,
        `${pct}%`,
        `${c.commissionRate}%`,
        earned,
        c.payoutStatus.toUpperCase(),
        c.lastPayoutDate || 'Pending',
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `staff_commission_statement_${Date.now()}.csv`;
    link.click();
    message.success('Staff commission statement exported.');
  };

  const totalCommissionEarned = commissions.reduce((sum, c) => sum + Math.round((c.revenueWon * c.commissionRate) / 100), 0);
  const totalCommissionPaid = commissions
    .filter((c) => c.payoutStatus === 'paid')
    .reduce((sum, c) => sum + Math.round((c.revenueWon * c.commissionRate) / 100), 0);
  const totalCommissionPending = totalCommissionEarned - totalCommissionPaid;

  const teamColumns = [
    {
      title: 'Team Member',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Assigned Customers',
      dataIndex: 'assignedCustomers',
      key: 'assignedCustomers',
    },
    {
      title: 'Deals in Progress',
      dataIndex: 'totalSales',
      key: 'totalSales',
    },
    {
      title: 'Sales Won',
      dataIndex: 'wonSales',
      key: 'wonSales',
      render: (val: number) => <Text strong style={{ color: '#52c41a' }}>{val}</Text>,
    },
    {
      title: 'Revenue Won',
      dataIndex: 'revenueWon',
      key: 'revenueWon',
      render: (val: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatIndianCurrency(Number(val))}
        </Text>
      ),
    },
  ];

  const commissionColumns = [
    {
      title: 'Sales Executive',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Monthly Target',
      dataIndex: 'target',
      key: 'target',
      render: (val: number) => formatIndianCurrency(val),
    },
    {
      title: 'Closed Revenue',
      dataIndex: 'revenueWon',
      key: 'revenueWon',
      render: (val: number) => (
        <Text strong style={{ color: '#059669' }}>
          {formatIndianCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Target Achievement',
      key: 'achievement',
      render: (_: any, record: CommissionRecord) => {
        const pct = Math.min(Math.round((record.revenueWon / record.target) * 100), 200);
        return (
          <div style={{ width: 140 }}>
            <Progress
              percent={pct}
              size="small"
              status={pct >= 100 ? 'success' : 'active'}
              strokeColor={pct >= 100 ? '#10b981' : '#3b82f6'}
            />
          </div>
        );
      },
    },
    {
      title: 'Commission Slab',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      render: (rate: number, r: CommissionRecord) => {
        const isBonus = r.revenueWon >= r.target;
        return (
          <Tag color={isBonus ? 'purple' : 'blue'}>
            {rate}% {isBonus ? '★ Achiever' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Net Commission (₹)',
      key: 'netCommission',
      render: (_: any, record: CommissionRecord) => {
        const earned = Math.round((record.revenueWon * record.commissionRate) / 100);
        return (
          <Text strong style={{ color: '#7c3aed', fontSize: 14 }}>
            {formatIndianCurrency(earned)}
          </Text>
        );
      },
    },
    {
      title: 'Payout Status',
      dataIndex: 'payoutStatus',
      key: 'payoutStatus',
      render: (st: string) =>
        st === 'paid' ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>PAID</Tag>
        ) : (
          <Tag color="orange" icon={<ClockCircleOutlined />}>PENDING</Tag>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: CommissionRecord) => (
        <Button
          size="small"
          type={record.payoutStatus === 'paid' ? 'default' : 'primary'}
          onClick={() => handleTogglePayout(record.id)}
          style={record.payoutStatus !== 'paid' ? { background: '#059669', borderColor: '#059669' } : {}}
        >
          {record.payoutStatus === 'paid' ? 'Mark Pending' : 'Approve & Pay'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.reports.title}
          </Title>
          <Text type="secondary">{t.reports.subtitle}</Text>
        </div>

        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Download Deals CSV
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCommissionStatement}
            style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
          >
            Commission Statement CSV
          </Button>
        </Space>
      </div>

      {/* Commission & Incentive Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #7c3aed' }}>
            <Statistic
              title="Total Commission Earned"
              value={formatIndianCurrency(totalCommissionEarned)}
              prefix={<DollarCircleOutlined style={{ color: '#7c3aed' }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Calculated across active sales team</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #10b981' }}>
            <Statistic
              title="Commission Disbursed (Paid)"
              value={formatIndianCurrency(totalCommissionPaid)}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Transferred to staff bank / UPI</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderTop: '4px solid #f59e0b' }}>
            <Statistic
              title="Pending Incentive Approval"
              value={formatIndianCurrency(totalCommissionPending)}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<ClockCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Awaiting manager sign-off</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={t.reports.customerSources} loading={loading} style={{ height: '100%', borderRadius: 12 }}>
            {data.sources.length > 0 ? (
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.sources}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.count}`}
                    >
                      {data.sources.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Text type="secondary">No source data recorded yet.</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t.reports.funnelOverview} loading={loading} style={{ height: '100%', borderRadius: 12 }}>
            {data.funnel.length > 0 ? (
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.funnel} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        name === 'totalValue' ? formatIndianCurrency(val) : val,
                        name === 'totalValue' ? 'Total Pipeline Value' : 'Deals Count',
                      ]}
                    />
                    <Bar dataKey="dealCount" fill={brandColor} radius={[4, 4, 0, 0]} name="dealCount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Text type="secondary">No pipeline data recorded yet.</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Staff Commission Tracker Table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💼 Staff Sales Commission & Incentive Tracker</span>
            <Button size="small" icon={<DownloadOutlined />} onClick={handleExportCommissionStatement}>
              Export Statement
            </Button>
          </div>
        }
        style={{ borderRadius: 12, marginBottom: 24 }}
      >
        <Table
          dataSource={commissions}
          columns={commissionColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title={t.reports.teamLeaderboard} loading={loading} style={{ borderRadius: 12 }}>
        <Table
          dataSource={data.team}
          columns={teamColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No team activity recorded yet.' }}
        />
      </Card>
    </div>
  );
}
