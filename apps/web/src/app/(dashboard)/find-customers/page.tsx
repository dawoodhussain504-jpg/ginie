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
  Modal,
  Select,
  message,
  Divider,
  Progress,
  Tooltip,
  Checkbox,
  Drawer,
  List,
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
  SafetyCertificateOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  SendOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FilterOutlined,
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
  const [isCachedResult, setIsCachedResult] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [usage, setUsage] = useState({ used: 0, total: 50, remaining: 50, isUnlimited: false });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [createDealInPipeline, setCreateDealInPipeline] = useState(true);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);

  // WhatsApp Outreach Modal State
  const [waModalVisible, setWaModalVisible] = useState(false);
  const [waRecipient, setWaRecipient] = useState<any | null>(null);
  const [waMessageText, setWaMessageText] = useState('');
  const [sendingWa, setSendingWa] = useState(false);

  useEffect(() => {
    loadUsage();
    loadStatuses();
    loadSavedSearches();
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

  const loadSavedSearches = async () => {
    try {
      const res = await api.get('/api/discovery/searches');
      setSavedSearches(res || []);
    } catch {}
  };

  const onSearch = async (values: any) => {
    setLoading(true);
    setSelectedRowKeys([]);
    setIsCachedResult(false);
    try {
      const res = await api.post('/api/discovery/search', values);
      setCurrentSearchId(res.searchId);
      setIsCachedResult(!!res.cached);

      // Load results
      const resultsRes = await api.get(`/api/discovery/${res.searchId}`);
      setSearchResults(resultsRes.results || []);

      if (res.cached) {
        message.success(`⚡ 7-day cache hit! Loaded ${resultsRes.results?.length || 0} results with 0 API cost.`);
      } else {
        message.success(t.discovery.foundResults.replace('{count}', String(resultsRes.results?.length || 0)));
      }

      loadUsage();
      loadSavedSearches();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleReRunSearch = async (saved: any) => {
    form.setFieldsValue({
      country: saved.country || 'India',
      city: saved.city,
      pincode: saved.pincode,
      category: saved.category,
    });
    setSavedDrawerOpen(false);
    onSearch({
      country: saved.country || 'India',
      city: saved.city,
      pincode: saved.pincode,
      category: saved.category,
    });
  };

  const handleSingleAddToSales = async (record: any) => {
    if (!currentSearchId) return;
    try {
      const res = await api.post(`/api/discovery/${currentSearchId}/import`, {
        resultIds: [record.id],
        createDeal: true,
        tags: ['Google Maps', 'Quick Add'],
      });
      message.success(res.message);
      // Refresh
      const resultsRes = await api.get(`/api/discovery/${currentSearchId}`);
      setSearchResults(resultsRes.results || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to add customer');
    }
  };

  const handleImport = async (values: any) => {
    if (!currentSearchId || selectedRowKeys.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post(`/api/discovery/${currentSearchId}/import`, {
        resultIds: selectedRowKeys,
        statusId: values.statusId,
        createDeal: createDealInPipeline,
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

  const handleAddAllNew = () => {
    const unimportedIds = searchResults.filter((r) => !r.isImported).map((r) => r.id);
    if (unimportedIds.length === 0) {
      message.info('All leads in current results are already in your Customers list.');
      return;
    }
    setSelectedRowKeys(unimportedIds);
    setImportModalVisible(true);
  };

  const handleExportCSV = () => {
    if (searchResults.length === 0) return;
    const headers = ['Business Name', 'Address', 'Phone', 'Website', 'Rating', 'Lead Quality'];
    const rows = searchResults.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`,
      `"${r.website || ''}"`,
      `"${r.rating || ''}"`,
      `"${(r.quality || 'weak').toUpperCase()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ginie_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenWhatsAppModal = (record: any) => {
    setWaRecipient(record);
    const businessName = record.name || 'Sir/Ma\'am';
    setWaMessageText(
      `Namaste! I came across ${businessName} on Google Maps and wanted to reach out regarding our operational software and business solutions. Would you be open to a quick 2-minute overview?`
    );
    setWaModalVisible(true);
  };

  const handleTemplateChange = (templateKey: string) => {
    if (!waRecipient) return;
    const businessName = waRecipient.name || 'Sir/Ma\'am';
    if (templateKey === 'intro') {
      setWaMessageText(`Namaste! I came across ${businessName} on Google Maps and wanted to reach out regarding our operational software and business solutions. Would you be open to a quick 2-minute overview?`);
    } else if (templateKey === 'offer') {
      setWaMessageText(`Hello ${businessName}, we are currently offering an exclusive free consultation and 15% discount for local businesses in your area. Can I share our service details with you?`);
    } else if (templateKey === 'quick') {
      setWaMessageText(`Hi there! Wanted to check if ${businessName} is currently looking for tools to automate daily billing, customer management, and WhatsApp marketing? Happy to share a quick demo!`);
    }
  };

  const handleLaunchWhatsApp = () => {
    if (!waRecipient?.phone) return;
    let cleanPhone = waRecipient.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessageText)}`, '_blank');
  };

  const handleSendViaBridge = async () => {
    if (!waRecipient?.phone || !waMessageText.trim()) return;
    setSendingWa(true);
    let cleanPhone = waRecipient.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    try {
      await api.post('/api/whatsapp/messages', {
        phone: cleanPhone,
        message: waMessageText,
      });
      message.success('Message queued and dispatched via WhatsApp Bridge!');
      setWaModalVisible(false);
    } catch {
      handleLaunchWhatsApp();
    } finally {
      setSendingWa(false);
    }
  };

  // Filtered by Quality Tag
  const filteredResults = searchResults.filter((r) => {
    if (qualityFilter === 'all') return true;
    return r.quality === qualityFilter;
  });

  const columns = [
    {
      title: t.discovery.table.name,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Space direction="vertical" size={2}>
            <Text strong>{text}</Text>
            <Space size={4} wrap>
              {/* Quality Tag */}
              {record.quality === 'good' && (
                <Tag color="success">🟢 Good (Phone + Web)</Tag>
              )}
              {record.quality === 'average' && (
                <Tag color="warning">🟡 Average (Phone only)</Tag>
              )}
              {record.quality === 'weak' && (
                <Tag color="default">⚪ Weak (No phone)</Tag>
              )}

              {/* Duplicate Indicator */}
              {record.isExistingCustomer && (
                <Tooltip title={`Matched existing ${record.existingMatch?.type || 'Customer'}: ${record.existingMatch?.name || ''}`}>
                  <Tag color="blue" icon={<CheckCircleOutlined />}>
                    Already in Customers ({record.existingMatch?.type || 'Match'})
                  </Tag>
                </Tooltip>
              )}
              {!record.isExistingCustomer && record.isImported && (
                <Tag color="green">{t.customers.alreadyAdded}</Tag>
              )}
            </Space>
          </Space>
        </div>
      ),
    },
    {
      title: t.discovery.table.address,
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: t.discovery.table.phone,
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) =>
        text ? (
          <Space size="small">
            <PhoneOutlined style={{ color: '#52c41a' }} />
            <Text copyable={{ text }}>{text}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: t.discovery.table.website,
      dataIndex: 'website',
      key: 'website',
      render: (text: string) =>
        text ? (
          <Button
            size="small"
            type="link"
            href={text}
            target="_blank"
            icon={<GlobalOutlined />}
            style={{ padding: 0 }}
          >
            Visit Site
          </Button>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: t.discovery.table.rating,
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number, record: any) =>
        rating ? (
          <Space size="small">
            <StarFilled style={{ color: '#faad14' }} />
            <Text strong>{rating.toFixed(1)}</Text>
            {record.userRatingsTotal && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({record.userRatingsTotal})
              </Text>
            )}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.isImported ? (
            <Tag color="default">Added</Tag>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleSingleAddToSales(record)}
            >
              Add to Sales
            </Button>
          )}

          {record.phone && (
            <Button
              size="small"
              icon={<WhatsAppOutlined />}
              style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 600 }}
              onClick={() => handleOpenWhatsAppModal(record)}
            >
              Pitch
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.discovery.title}
          </Title>
          <Text type="secondary">{t.discovery.subtitle}</Text>
        </div>
        <Space>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => setSavedDrawerOpen(true)}
          >
            Saved Searches ({savedSearches.length})
          </Button>
        </Space>
      </div>

      {/* Plan-Wise Search Limits & Status Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid #f0f0f0',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            {usage.isUnlimited ? (
              <Tag color="gold" icon={<SafetyCertificateOutlined />} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}>
                Enterprise Plan: Unlimited Places Searches
              </Tag>
            ) : (
              <Space direction="vertical" size={2}>
                <Space>
                  <Text strong style={{ fontSize: 13 }}>Monthly Search Quota:</Text>
                  <Tag color={usage.remaining > 5 ? 'blue' : 'volcano'}>
                    {usage.used} of {usage.total} used ({usage.remaining} searches left)
                  </Tag>
                </Space>
                <Progress
                  percent={Math.min(100, Math.round((usage.used / usage.total) * 100))}
                  size="small"
                  status={usage.remaining <= 0 ? 'exception' : 'active'}
                  style={{ width: 220 }}
                />
              </Space>
            )}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Total Searches This Month: <strong style={{ color: brandColor }}>{usage.used}</strong>
            </Text>
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
              disabled={!usage.isUnlimited && usage.remaining <= 0}
            >
              {t.discovery.searchButton}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Results Table Card */}
      <Card
        title={
          <Space wrap>
            <span>
              {searchResults.length > 0
                ? t.discovery.foundResults.replace('{count}', String(searchResults.length))
                : t.discovery.title}
            </span>
            {isCachedResult && (
              <Tag color="cyan" icon={<ThunderboltOutlined />}>
                Instant Cache Hit (0 Quota Spent)
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space wrap>
            {searchResults.length > 0 && (
              <>
                <Select
                  value={qualityFilter}
                  onChange={setQualityFilter}
                  style={{ width: 160 }}
                  prefix={<FilterOutlined />}
                  options={[
                    { value: 'all', label: 'All Qualities' },
                    { value: 'good', label: '🟢 Good (Phone+Web)' },
                    { value: 'average', label: '🟡 Average (Phone)' },
                    { value: 'weak', label: '⚪ Weak (No phone)' },
                  ]}
                />
                <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                  {t.discovery.exportExcel}
                </Button>
                <Button onClick={handleAddAllNew}>
                  Add All New to Sales
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => setImportModalVisible(true)}
            >
              Add Selected ({selectedRowKeys.length}) to Sales
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
          dataSource={filteredResults}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: t.discovery.empty }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Saved / Recent Searches Drawer */}
      <Drawer
        title="Saved & Recent Searches"
        placement="right"
        width={360}
        onClose={() => setSavedDrawerOpen(false)}
        open={savedDrawerOpen}
      >
        <List
          dataSource={savedSearches}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button
                  key="rerun"
                  type="link"
                  icon={<SearchOutlined />}
                  onClick={() => handleReRunSearch(item)}
                >
                  Re-run
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.category}</Text>}
                description={
                  <div>
                    <Text type="secondary">
                      {item.city}{item.pincode ? ` (${item.pincode})` : ''}, {item.country}
                    </Text>
                    <br />
                    <Tag color="blue">{item.resultCount} results found</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Direct WhatsApp Outreach Modal */}
      <Modal
        title={
          <Space>
            <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
            <span>Direct WhatsApp Pitch Outreach</span>
          </Space>
        }
        open={waModalVisible}
        onCancel={() => setWaModalVisible(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        {waRecipient && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text strong>{waRecipient.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Phone: <strong style={{ color: '#15803d' }}>{waRecipient.phone}</strong>
              </Text>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Choose Outreach Pitch Template:
              </Text>
              <Select
                defaultValue="intro"
                onChange={handleTemplateChange}
                style={{ width: '100%' }}
                options={[
                  { value: 'intro', label: '1. Introduction & Overview' },
                  { value: 'offer', label: '2. Exclusive Local Business Offer / Discount' },
                  { value: 'quick', label: '3. Quick Inquiry on Billing / Operations' },
                ]}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Message Text (Personalized):
              </Text>
              <Input.TextArea
                rows={4}
                value={waMessageText}
                onChange={(e) => setWaMessageText(e.target.value)}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                onClick={handleLaunchWhatsApp}
                block
                style={{ height: 42, background: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
              >
                Launch WhatsApp (Web / App)
              </Button>
              <Button
                icon={<SendOutlined />}
                loading={sendingWa}
                onClick={handleSendViaBridge}
                block
              >
                Send via System Bridge (Human-Like Delay)
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(waMessageText);
                  message.success('Pitch copied to clipboard!');
                }}
                block
              >
                Copy Message Text
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Import to Potential Customers Modal */}
      <Modal
        title="Add to Sales & Customers"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleImport}>
          <Paragraph type="secondary">
            Adding <strong>{selectedRowKeys.length}</strong> business(es) to your customer database. Existing duplicates will be automatically skipped.
          </Paragraph>

          <Form.Item name="statusId" label="Lead Initial Status">
            <Select
              placeholder="Select initial lead stage (default: New Lead)"
              options={statuses.map((s) => ({ value: s.id, label: s.name }))}
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Checkbox
              checked={createDealInPipeline}
              onChange={(e) => setCreateDealInPipeline(e.target.checked)}
            >
              <strong>Also create Deal in Sales Pipeline (Stage 0)</strong>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setImportModalVisible(false)}>
                {t.common.cancel}
              </Button>
              <Button type="primary" htmlType="submit" loading={importing}>
                Confirm & Add to Sales
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
