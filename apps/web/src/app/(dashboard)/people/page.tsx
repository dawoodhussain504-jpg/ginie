'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Space, message } from 'antd';
import { TeamOutlined, PhoneOutlined, MailOutlined, ShopOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text } = Typography;

export default function PeoplePage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/contacts');
      setPeople(res || []);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          {record.designation && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.designation}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (company: any) =>
        company ? (
          <Space>
            <ShopOutlined />
            <span>{company.name}</span>
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) =>
        phone ? (
          <a href={`tel:${phone}`}>
            <PhoneOutlined /> {phone}
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <a href={`mailto:${email}`}>
            <MailOutlined /> {email}
          </a>
        ) : (
          '—'
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
          {t.nav.people}
        </Title>
        <Text type="secondary">All business contacts and individuals linked to your company.</Text>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={people}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: 'No contacts added yet.' }}
        />
      </Card>
    </div>
  );
}
