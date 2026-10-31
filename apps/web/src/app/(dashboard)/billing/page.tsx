'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  WhatsAppOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';
import { buildUpiUri, buildUpiQrCodeUrl } from '@/lib/upi';

const { Title, Text, Paragraph } = Typography;

export default function BillingPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [adminUpiVpa, setAdminUpiVpa] = useState('merchant@upi');
  const [productForm] = Form.useForm();
  const [quoteForm] = Form.useForm();

  useEffect(() => {
    loadBillingData();
    const savedVpa = localStorage.getItem('ginie_admin_upi_vpa');
    if (savedVpa) setAdminUpiVpa(savedVpa);
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [prodRes, quoteRes, invRes] = await Promise.all([
        api.get('/api/billing/products'),
        api.get('/api/billing/quotations'),
        api.get('/api/billing/invoices'),
      ]);
      setProducts(prodRes || []);
      setQuotations(quoteRes || []);
      setInvoices(invRes || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (values: any) => {
    try {
      await api.post('/api/billing/products', values);
      message.success(t.common.success);
      setProductModalVisible(false);
      productForm.resetFields();
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleCreateQuotation = async (values: any) => {
    try {
      const selectedProd = products.find((p) => p.id === values.productId);
      const items = [
        {
          productId: values.productId,
          name: selectedProd?.name || values.customItemName || 'Custom Service',
          price: Number(values.price || selectedProd?.price || 0),
          quantity: Number(values.quantity || 1),
          taxRate: 18,
        },
      ];

      await api.post('/api/billing/quotations', {
        items,
        notes: values.notes,
      });

      message.success(t.common.success);
      setQuoteModalVisible(false);
      quoteForm.resetFields();
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      await api.post(`/api/billing/quotations/${quoteId}/convert`);
      message.success(t.billing.convertToInvoice + ' successful!');
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await api.patch(`/api/billing/invoices/${invoiceId}/status`, { status: 'paid' });
      message.success('Invoice marked as Paid.');
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleOpenUpiModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setUpiModalVisible(true);
  };

  const handleSaveUpiVpa = (vpa: string) => {
    const clean = vpa.trim();
    if (clean) {
      setAdminUpiVpa(clean);
      localStorage.setItem('ginie_admin_upi_vpa', clean);
      message.success('UPI ID updated & saved.');
    }
  };

  const handleSendInvoiceWhatsApp = () => {
    if (!selectedInvoice) return;
    const upiUri = buildUpiUri({
      vpa: adminUpiVpa,
      payeeName: 'Ginie Space',
      amount: Number(selectedInvoice.total || 0),
      transactionNote: `Invoice ${selectedInvoice.invoiceNumber}`,
    });

    const text =
      `*INVOICE: ${selectedInvoice.invoiceNumber}*\n` +
      `Amount Due: ₹${Number(selectedInvoice.total || 0).toLocaleString('en-IN')}\n` +
      `Due Date: ${selectedInvoice.dueDate ? formatDateIndian(selectedInvoice.dueDate) : 'Immediate'}\n\n` +
      `👉 *Pay instantly via GooglePay / PhonePe / Paytm:*\n` +
      `${upiUri}\n\n` +
      `Thank you for your business!`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const productColumns = [
    {
      title: 'Product / Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Code / SKU',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => code || '—',
    },
    {
      title: 'Base Price',
      dataIndex: 'price',
      key: 'price',
      render: (p: any) => formatIndianCurrency(Number(p)),
    },
    {
      title: 'GST Rate',
      dataIndex: 'taxRate',
      key: 'taxRate',
      render: (tax: any) => <Tag color="blue">{tax}% GST</Tag>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (u: string) => u || 'piece',
    },
  ];

  const quotationColumns = [
    {
      title: 'Quote #',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      render: (num: string) => <Text strong>{num}</Text>,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (val: any) => formatIndianCurrency(Number(val)),
    },
    {
      title: 'GST (18%)',
      dataIndex: 'taxTotal',
      key: 'taxTotal',
      render: (val: any) => formatIndianCurrency(Number(val)),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (val: any) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatIndianCurrency(Number(val))}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <Tag color={st === 'converted' ? 'green' : 'blue'}>{st.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => formatDateIndian(d),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) =>
        record.status !== 'converted' ? (
          <Button
            size="small"
            type="primary"
            onClick={() => handleConvertToInvoice(record.id)}
          >
            {t.billing.convertToInvoice}
          </Button>
        ) : (
          <Tag color="green">Converted to Invoice</Tag>
        ),
    },
  ];

  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (num: string) => <Text strong>{num}</Text>,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (val: any) => (
        <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
          {formatIndianCurrency(Number(val))}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <Tag color={st === 'paid' ? 'green' : 'orange'}>{st.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (d: string) => (d ? formatDateIndian(d) : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => handleOpenUpiModal(record)}
            style={{ color: brandColor, borderColor: brandColor }}
          >
            UPI QR & WhatsApp
          </Button>
          {record.status !== 'paid' && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkPaid(record.id)}
            >
              {t.billing.markPaid}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const currentUpiUri = selectedInvoice
    ? buildUpiUri({
        vpa: adminUpiVpa,
        payeeName: 'Ginie Space',
        amount: Number(selectedInvoice.total || 0),
        transactionNote: `Invoice ${selectedInvoice.invoiceNumber}`,
      })
    : '';

  const qrImageUrl = currentUpiUri ? buildUpiQrCodeUrl(currentUpiUri, 280) : '';

  const tabItems = [
    {
      key: 'invoices',
      label: (
        <span>
          <CheckCircleOutlined /> {t.billing.invoicesTab}
        </span>
      ),
      children: (
        <Card title={t.billing.invoicesTab} style={{ borderRadius: 12 }}>
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No invoices generated yet.' }}
          />
        </Card>
      ),
    },
    {
      key: 'quotes',
      label: (
        <span>
          <FileTextOutlined /> {t.billing.quotesTab}
        </span>
      ),
      children: (
        <Card
          title={t.billing.quotesTab}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setQuoteModalVisible(true)}
            >
              {t.billing.createQuote}
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={quotations}
            columns={quotationColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No price quotes created yet.' }}
          />
        </Card>
      ),
    },
    {
      key: 'products',
      label: (
        <span>
          <ShoppingOutlined /> {t.billing.productsTab}
        </span>
      ),
      children: (
        <Card
          title={t.billing.productsTab}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setProductModalVisible(true)}
            >
              {t.billing.addProduct}
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={products}
            columns={productColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No products or services added yet.' }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.billing.title}
        </Title>
        <Text type="secondary">{t.billing.subtitle}</Text>
      </div>

      <Tabs items={tabItems} size="large" defaultActiveKey="invoices" />

      {/* Dynamic UPI Payment Modal */}
      <Modal
        title={
          <Space>
            <QrcodeOutlined style={{ color: '#52c41a' }} />
            <span>UPI Instant Payment & WhatsApp Dispatch</span>
          </Space>
        }
        open={upiModalVisible}
        onCancel={() => setUpiModalVisible(false)}
        footer={null}
        destroyOnClose
        width={460}
      >
        {selectedInvoice && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
              <Text type="secondary">Invoice Number:</Text>{' '}
              <Text strong>{selectedInvoice.invoiceNumber}</Text>
              <br />
              <Text type="secondary">Total Amount Due:</Text>{' '}
              <span style={{ fontSize: 20, fontWeight: 800, color: '#52c41a', marginLeft: 6 }}>
                {formatIndianCurrency(Number(selectedInvoice.total || 0))}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Admin Receiving UPI ID (GooglePay / PhonePe / Paytm / BHIM):
              </Text>
              <Input.Search
                defaultValue={adminUpiVpa}
                enterButton="Save UPI ID"
                onSearch={handleSaveUpiVpa}
                placeholder="yourname@okhdfcbank"
              />
            </div>

            {/* Dynamic QR Code Canvas Image */}
            <div
              style={{
                display: 'inline-block',
                padding: 12,
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                marginBottom: 12,
              }}
            >
              <img
                src={qrImageUrl}
                alt="UPI Payment QR Code"
                width={220}
                height={220}
                style={{ display: 'block' }}
              />
            </div>

            <div>
              <Tag color="green">Accepts PhonePe &bull; Google Pay &bull; Paytm &bull; BHIM</Tag>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                onClick={handleSendInvoiceWhatsApp}
                block
                style={{ height: 42, background: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
              >
                Send Invoice on WhatsApp
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(currentUpiUri);
                  message.success('UPI deep link copied!');
                }}
                block
              >
                Copy UPI Payment Deep Link
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        title={t.billing.addProduct}
        open={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={productForm} layout="vertical" onFinish={handleCreateProduct} initialValues={{ taxRate: 18, unit: 'piece' }}>
          <Form.Item
            name="name"
            label="Product or Service Name"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Annual Maintenance Contract" />
          </Form.Item>

          <Form.Item name="code" label="SKU or Item Code">
            <Input placeholder="e.g. AMC-001" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="price"
              label="Base Price (₹)"
              rules={[{ required: true, message: t.common.pleaseCheckField }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="10000" />
            </Form.Item>

            <Form.Item name="taxRate" label="GST Rate (%)">
              <InputNumber style={{ width: '100%' }} min={0} max={100} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setProductModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Create Quote Modal */}
      <Modal
        title={t.billing.createQuote}
        open={quoteModalVisible}
        onCancel={() => setQuoteModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={quoteForm} layout="vertical" onFinish={handleCreateQuotation} initialValues={{ quantity: 1 }}>
          <Form.Item name="productId" label="Choose Product or Service">
            <Select
              allowClear
              placeholder="Select an existing product or leave blank for custom"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} — ${formatIndianCurrency(Number(p.price))}`,
              }))}
            />
          </Form.Item>

          <Form.Item name="customItemName" label="Or Enter Custom Item Name">
            <Input placeholder="e.g. Custom Website Development" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="price" label="Unit Price (₹)">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="25000" />
            </Form.Item>

            <Form.Item name="quantity" label="Quantity">
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Terms or Notes for Customer">
            <Input.TextArea rows={2} placeholder="e.g. Valid for 30 days. 50% advance." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setQuoteModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
