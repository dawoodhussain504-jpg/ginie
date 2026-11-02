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
  Alert,
  QRCode,
  Image,
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
  LockOutlined,
  UploadOutlined,
  QrcodeOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
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

  // ₹599 Discovery Plan & UPI Paywall State
  const [planStatus, setPlanStatus] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    loadPlanStatus();
    loadUsage();
    loadStatuses();
    loadSavedSearches();
  }, []);

  const loadPlanStatus = async () => {
    setPlanLoading(true);
    try {
      const res = await api.get('/api/discovery/plan-status');
      setPlanStatus(res);
      if (res?.utr && !paymentUtr) {
        setPaymentUtr(res.utr);
      }
    } catch (err) {
      console.error('Failed to load discovery plan status:', err);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      message.error('File size 4MB se kam honi chahiye. Kripya compressed screenshot upload karein.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPaymentScreenshot(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!paymentUtr.trim()) {
      message.error('Kripya 12-digit UPI / UTR Transaction ID dalein.');
      return;
    }
    if (!paymentScreenshot) {
      message.error('Kripya payment screenshot upload karein.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await api.post('/api/discovery/submit-payment', {
        utr: paymentUtr.trim(),
        screenshot: paymentScreenshot,
        notes: paymentNotes.trim(),
      });
      message.success(res.message || 'Payment details submitted successfully!');
      setPaywallModalOpen(false);
      loadPlanStatus();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit payment details.');
    } finally {
      setSubmittingPayment(false);
    }
  };

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
    if (planStatus && !planStatus.active) {
      setPaywallModalOpen(true);
      message.warning('Google Maps Lead Discovery ke liye ₹599/mo plan active hona zaroori hai.');
      return;
    }

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

      {/* Plan-Wise Status Banners */}
      {planStatus?.active ? (
        <Alert
          style={{
            marginBottom: 16,
            borderRadius: 12,
            border: '1.5px solid #b7eb8f',
            background: '#f6ffed',
          }}
          message={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Space>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 14, color: '#237804' }}>
                    ⚡ Google Maps Lead Discovery Active
                  </Text>
                  <Text style={{ marginLeft: 8, fontSize: 13, color: '#389e0d' }}>
                    {planStatus.isSuperAdmin
                      ? 'SuperAdmin Platform Access (Unlimited Google Maps Search)'
                      : `${planStatus.remainingDays} days remaining (Expires on ${
                          planStatus.expiresAt
                            ? new Date(planStatus.expiresAt).toLocaleDateString('en-IN')
                            : 'Active'
                        })`}
                  </Text>
                </div>
              </Space>
              {!planStatus.isSuperAdmin && (
                <Button size="small" onClick={() => setPaywallModalOpen(true)}>
                  Extend Plan (₹599)
                </Button>
              )}
            </div>
          }
          type="success"
        />
      ) : planStatus?.status === 'pending' ? (
        <Alert
          style={{
            marginBottom: 16,
            borderRadius: 12,
            border: '1.5px solid #ffe58f',
            background: '#fffbe6',
          }}
          message={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                <div>
                  <Text strong style={{ fontSize: 14, color: '#d48806' }}>
                    ⏳ Payment Verification Under Review (UTR: {planStatus.utr})
                  </Text>
                  <Text style={{ display: 'block', fontSize: 12, color: '#ad6800' }}>
                    Aapka ₹599 payment screenshot platform admin review kar rahe hain. 15-30 minute me activate ho jayega.
                  </Text>
                </div>
              </Space>
              <Button size="small" onClick={() => setPaywallModalOpen(true)}>
                View / Re-upload Payment
              </Button>
            </div>
          }
          type="warning"
        />
      ) : (
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1.5px solid #93c5fd',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <Space align="center" style={{ marginBottom: 4 }}>
                <LockOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                <Title level={5} style={{ margin: 0, color: '#1e3a8a' }}>
                  🔒 Unlock Google Maps B2B Lead Discovery (₹599 / month)
                </Title>
              </Space>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, maxWidth: 680 }}>
                Apne city ya area me naye dukaandar, distributors, factory aur businesses ke direct phone numbers, Google ratings aur address khojein. Instant 1-click WhatsApp outreach ke sath.
              </Paragraph>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<QrcodeOutlined />}
              onClick={() => setPaywallModalOpen(true)}
              style={{
                background: '#2563eb',
                borderColor: '#2563eb',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              ⚡ Scan UPI QR & Unlock (₹599)
            </Button>
          </div>
        </Card>
      )}

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
            {planStatus?.active ? (
              <Tag
                color="green"
                icon={<SafetyCertificateOutlined />}
                style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}
              >
                ₹599 Discovery Plan: Search Unlocked ({planStatus.remainingDays} Days Left)
              </Tag>
            ) : (
              <Tag
                color="red"
                icon={<LockOutlined />}
                style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}
              >
                Google Maps Lead Discovery Locked (Requires ₹599 Plan)
              </Tag>
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
              icon={planStatus?.active ? <SearchOutlined /> : <LockOutlined />}
              loading={loading}
              size="large"
              style={
                !planStatus?.active
                  ? { background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }
                  : undefined
              }
            >
              {planStatus?.active ? t.discovery.searchButton : '⚡ Unlock Lead Discovery (₹599)'}
            </Button>
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
      {/* ₹599 Discovery Plan UPI Paywall Modal */}
      <Modal
        title={
          <Space>
            <QrcodeOutlined style={{ color: '#2563eb', fontSize: 22 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Unlock Google Maps Lead Discovery — ₹599 / Month
            </span>
          </Space>
        }
        open={paywallModalOpen}
        onCancel={() => setPaywallModalOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Tag color="blue" style={{ fontSize: 12, padding: '2px 10px', marginBottom: 8 }}>
            Impulse Add-on • Core CRM Remains 100% Free
          </Tag>
          <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 16px' }}>
            Apne local city & pin code me kisi bhi category ke B2B clients, phone numbers aur Google Maps listing data search karein.
          </Paragraph>

          {/* QR Code Section */}
          <div
            style={{
              display: 'inline-block',
              padding: 12,
              background: '#fff',
              borderRadius: 16,
              border: '2px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              marginBottom: 12,
            }}
          >
            {planStatus?.platformUpi?.qrCodeUrl ? (
              <img
                src={planStatus.platformUpi.qrCodeUrl}
                alt="Platform UPI QR Code"
                style={{ width: 220, height: 220, objectFit: 'contain', display: 'block', borderRadius: 8 }}
              />
            ) : (
              <QRCode
                value={`upi://pay?pa=${planStatus?.platformUpi?.upiId || '8797186001@paytm'}&pn=${encodeURIComponent(
                  planStatus?.platformUpi?.payeeName || 'GINIE Space',
                )}&am=${planStatus?.platformUpi?.amount || 599}&cu=INR`}
                size={220}
              />
            )}
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: 10,
              textAlign: 'left',
              marginBottom: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>UPI ID:</Text>
              <Text copyable={{ text: planStatus?.platformUpi?.upiId || '8797186001@paytm' }} strong style={{ fontSize: 14 }}>
                {planStatus?.platformUpi?.upiId || '8797186001@paytm'}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Payee Name:</Text>
              <Text strong style={{ fontSize: 14 }}>{planStatus?.platformUpi?.payeeName || 'GINIE Space Platform Admin'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Amount to Pay:</Text>
              <Text strong style={{ fontSize: 16, color: '#16a34a' }}>₹{planStatus?.platformUpi?.amount || 599} / Month</Text>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '12px 0 16px' }}>
          <Text strong style={{ fontSize: 13, color: '#64748b' }}>PAYMENT PROOF SUBMISSION</Text>
        </Divider>

        <Form layout="vertical">
          <Form.Item
            label="12-Digit UPI / UTR Transaction ID (Required)"
            required
            extra="Google Pay / PhonePe / Paytm screen par likha 12-digit UTR / Reference number"
          >
            <Input
              placeholder="e.g. 431289456712"
              maxLength={24}
              value={paymentUtr}
              onChange={(e) => setPaymentUtr(e.target.value.trim())}
              style={{ height: 40 }}
            />
          </Form.Item>

          <Form.Item
            label="Upload Payment Screenshot (JPG / PNG)"
            required
            extra="Successful payment screen ka clear screenshot upload karein (Max 4MB)"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleScreenshotUpload}
              style={{ display: 'block', width: '100%', padding: '6px', border: '1px dashed #cbd5e1', borderRadius: 8 }}
            />
            {paymentScreenshot && (
              <div style={{ marginTop: 8 }}>
                <Text type="success" style={{ fontSize: 12 }}>✓ Screenshot selected</Text>
                <div style={{ marginTop: 4, width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={paymentScreenshot} alt="Screenshot Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item label="Notes / Business Reference (Optional)">
            <Input
              placeholder="e.g. Paid via PhonePe from Ram Sharma"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </Form.Item>

          <div style={{ marginTop: 20 }}>
            <Button
              type="primary"
              size="large"
              block
              loading={submittingPayment}
              onClick={handleSubmitPayment}
              style={{
                height: 44,
                background: '#16a34a',
                borderColor: '#16a34a',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Submit for Approval & Activate (₹599)
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
