'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Typography,
  Tag,
  Alert,
  Modal,
  Select,
  Progress,
  message,
  Tooltip,
} from 'antd';
import {
  CompassOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  StarFilled,
  GlobalOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function FindCustomersPage() {
  const { t, brandColor } = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [usage, setUsage] = useState({ used: 0, total: 50, remaining: 50 });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [mapModalPlace, setMapModalPlace] = useState<any | null>(null);

  useEffect(() => {
    loadUsage();
    loadStatuses();
  }, []);

  const loadUsage = async () => {
    try {
      const res = await api.get('/api/discovery/usage');
      setUsage(res);
    } catch (err) {
      console.error('Failed to load search usage:', err);
    }
  };

  const loadStatuses = async () => {
    try {
      const res = await api.get('/api/leads/statuses');
      setStatuses(res || []);
    } catch {}
  };

  const onSearch = async (values: any) => {
    setLoading(true);
    setSelectedRowKeys([]);
    try {
      const res = await api.post('/api/discovery/search', values);
      setCurrentSearchId(res.searchId);

      // Load results
      const resultsRes = await api.get(`/api/discovery/${res.searchId}`);
      setSearchResults(resultsRes.results || []);
      message.success(t.discovery.foundResults.replace('{count}', String(resultsRes.results?.length || 0)));
      loadUsage();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (values: any) => {
    if (!currentSearchId || selectedRowKeys.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post(`/api/discovery/${currentSearchId}/import`, {
        resultIds: selectedRowKeys,
        statusId: values.statusId,
        tags: values.tags || ['Google Maps'],
      });
      message.success(res.message);
      setImportModalVisible(false);

      // Refresh search results to show imported status
      const resultsRes = await api.get(`/api/discovery/${currentSearchId}`);
      setSearchResults(resultsRes.results || []);
      setSelectedRowKeys([]);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (searchResults.length === 0) return;
    const headers = ['Business Name', 'Address', 'Phone', 'Website', 'Rating'];
    const rows = searchResults.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      `"${r.website || ''}"`,
      `"${r.rating || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ginie_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: t.discovery.table.name,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Space direction="vertical" size={2}>
            <Text strong>{text}</Text>
            {record.isImported && (
              <Tag color="green">{t.customers.alreadyAdded}</Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: t.discovery.table.address,
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <span style={{ fontSize: 13, color: '#595959' }}>{address}</span>
      ),
    },
    {
      title: t.discovery.table.phone,
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
      title: t.discovery.table.website,
      dataIndex: 'website',
      key: 'website',
      render: (website: string) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            <GlobalOutlined /> Visit
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: t.discovery.table.rating,
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number, record: any) =>
        rating ? (
          <Space size={4}>
            <StarFilled style={{ color: '#faad14' }} />
            <Text strong>{rating.toFixed(1)}</Text>
            {record.userRatingsTotal && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                ({record.userRatingsTotal})
              </Text>
            )}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: t.discovery.table.googleMaps,
      key: 'maps',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.mapsUrl && (
            <Button
              size="small"
              type="link"
              href={record.mapsUrl}
              target="_blank"
              icon={<EnvironmentOutlined />}
            >
              Google Maps
            </Button>
          )}
          <Button
            size="small"
            onClick={() => setMapModalPlace(record)}
          >
            Pin
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.discovery.title}
        </Title>
        <Text type="secondary">{t.discovery.subtitle}</Text>
      </div>

      {/* Quota & Search Card */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 14 }}>
              {t.discovery.quotaNotice
                .replace('{used}', String(usage.used))
                .replace('{total}', String(usage.total))}
            </Text>
          </div>
          <div style={{ width: 160 }}>
            <Progress
              percent={Math.min(100, Math.round((usage.used / usage.total) * 100))}
              size="small"
              strokeColor={brandColor}
            />
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSearch}
          initialValues={{ country: 'India', city: 'Mumbai' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Form.Item
              name="country"
              label={t.discovery.countryLabel}
              rules={[{ required: true, message: t.common.pleaseCheckField }]}
            >
              <Input placeholder="India" />
            </Form.Item>

            <Form.Item
              name="city"
              label={t.discovery.cityLabel}
              rules={[{ required: true, message: t.common.pleaseCheckField }]}
            >
              <Input placeholder="e.g. Mumbai, Pune, Delhi" />
            </Form.Item>

            <Form.Item name="pincode" label={t.discovery.pincodeLabel}>
              <Input placeholder="e.g. 400001" />
            </Form.Item>

            <Form.Item
              name="category"
              label={t.discovery.categoryLabel}
              rules={[{ required: true, message: t.common.pleaseCheckField }]}
            >
              <Input placeholder={t.discovery.categoryPlaceholder} />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
              size="large"
            >
              {t.discovery.searchButton}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Results Table Card */}
      <Card
        title={
          searchResults.length > 0
            ? t.discovery.foundResults.replace('{count}', String(searchResults.length))
            : t.discovery.title
        }
        extra={
          <Space>
            {searchResults.length > 0 && (
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                {t.discovery.exportExcel}
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => setImportModalVisible(true)}
            >
              {t.discovery.addToCustomers} ({selectedRowKeys.length})
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record: any) => ({
              disabled: record.isImported,
            }),
          }}
          columns={columns}
          dataSource={searchResults}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: t.discovery.empty }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Import to Potential Customers Modal */}
      <Modal
        title={t.discovery.addToCustomers}
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={handleImport}
          initialValues={{ statusId: statuses[0]?.id }}
        >
          <Paragraph>
            Add <strong>{selectedRowKeys.length}</strong> selected business(es) to your customer list.
          </Paragraph>

          <Form.Item
            name="statusId"
            label={t.customers.fields.status}
            rules={[{ required: true }]}
          >
            <Select
              options={statuses.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setImportModalVisible(false)}>
              {t.common.cancel}
            </Button>
            <Button type="primary" htmlType="submit" loading={importing}>
              {t.discovery.addToCustomers}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Map Location Preview Modal */}
      <Modal
        title={mapModalPlace?.name || 'Location Pin'}
        open={!!mapModalPlace}
        onCancel={() => setMapModalPlace(null)}
        footer={[
          <Button key="close" onClick={() => setMapModalPlace(null)}>
            {t.common.cancel}
          </Button>,
          mapModalPlace?.mapsUrl ? (
            <Button
              key="maps"
              type="primary"
              href={mapModalPlace.mapsUrl}
              target="_blank"
            >
              Open in Google Maps
            </Button>
          ) : null,
        ]}
      >
        {mapModalPlace && (
          <div>
            <div
              style={{
                height: 220,
                background: '#e6f4ff',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                border: '1px solid #91caff',
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 36, color: brandColor, marginBottom: 8 }} />
              <Text strong>{mapModalPlace.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lat: {mapModalPlace.lat || '19.0760'}, Lng: {mapModalPlace.lng || '72.8777'}
              </Text>
            </div>
            <Paragraph>
              <strong>Address:</strong> {mapModalPlace.address}
            </Paragraph>
            {mapModalPlace.phone && (
              <Paragraph>
                <strong>Phone:</strong> {mapModalPlace.phone}
              </Paragraph>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
