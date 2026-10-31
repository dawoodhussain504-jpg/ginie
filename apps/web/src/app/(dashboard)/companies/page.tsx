'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Space, message } from 'antd';
import { ShopOutlined, GlobalOutlined, TeamOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text } = Typography;

export default function CompaniesPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/companies');
      setCompanies(res || []);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (ind: string) => (ind ? <Tag color="blue">{ind}</Tag> : '—'),
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (site: string) =>
        site ? (
          <a href={site} target="_blank" rel="noopener noreferrer">
            <GlobalOutlined /> Visit
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: 'People Linked',
      key: 'people',
      render: (_: any, record: any) => (
        <Space>
          <TeamOutlined />
          <span>{record.contacts?.length || 0}</span>
        </Space>
      ),
    },
    {
      title: 'Date Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateIndian(date),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.nav.companies}
        </Title>
        <Text type="secondary">All business organizations and client accounts.</Text>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={companies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: 'No companies added yet.' }}
        />
      </Card>
    </div>
  );
}
