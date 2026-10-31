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
} from 'antd';
import {
  DownloadOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency } from '@ginie/i18n';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#ff4d4f'];

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

  useEffect(() => {
    loadReports();
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
            {t.reports.title}
          </Title>
          <Text type="secondary">{t.reports.subtitle}</Text>
        </div>

        <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
          Download as Excel
        </Button>
      </div>

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
                    <Tooltip />
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
                    <Tooltip
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
