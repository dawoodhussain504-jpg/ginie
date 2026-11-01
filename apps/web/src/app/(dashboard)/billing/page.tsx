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
  Row,
  Col,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  PrinterOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';
import { buildUpiUri, buildUpiQrCodeUrl } from '@/lib/upi';
import { numberToIndianWords } from '@/lib/numberToWords';

const { Title, Text, Paragraph } = Typography;

export default function BillingPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [company, setCompany] = useState<any | null>(null);

  // Modals
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [adminUpiVpa, setAdminUpiVpa] = useState('merchant@upi');

  const [productForm] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  useEffect(() => {
    loadBillingData();
    const savedVpa = localStorage.getItem('ginie_admin_upi_vpa');
    if (savedVpa) setAdminUpiVpa(savedVpa);
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [prodRes, quoteRes, invRes, compRes, contRes] = await Promise.all([
        api.get('/api/billing/products').catch(() => []),
        api.get('/api/billing/quotations').catch(() => []),
        api.get('/api/billing/invoices').catch(() => []),
        api.get('/api/settings/company').catch(() => null),
        api.get('/api/contacts').catch(() => []),
      ]);
      setProducts(prodRes || []);
      setQuotations(quoteRes || []);
      setInvoices(invRes || []);
      setCompany(compRes);
      setContacts(contRes?.items || contRes || []);

      if (compRes?.settings?.upiId) {
        setAdminUpiVpa(compRes.settings.upiId);
      }
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
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
          hsn: values.hsn || selectedProd?.code || '998314',
          price: Number(values.price || selectedProd?.price || 0),
          quantity: Number(values.quantity || 1),
          taxRate: Number(values.taxRate || selectedProd?.taxRate || 18),
        },
      ];

      await api.post('/api/billing/quotations', {
        contactId: values.contactId,
        items,
        notes: values.notes,
      });

      message.success('Quotation generated successfully!');
      setQuoteModalVisible(false);
      quoteForm.resetFields();
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleCreateInvoice = async (values: any) => {
    try {
      const selectedProd = products.find((p) => p.id === values.productId);
      const items = [
        {
          productId: values.productId,
          name: selectedProd?.name || values.customItemName || 'Service / Product',
          hsn: values.hsn || selectedProd?.code || '998314',
          price: Number(values.price || selectedProd?.price || 0),
          quantity: Number(values.quantity || 1),
          taxRate: Number(values.taxRate || selectedProd?.taxRate || 18),
          isInterState: !!values.isInterState,
        },
      ];

      await api.post('/api/billing/invoices', {
        contactId: values.contactId,
        customerName: values.customerName,
        customerGstin: values.customerGstin,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        customerState: values.customerState,
        items,
        isInterState: !!values.isInterState,
        dueDate: values.dueDate,
        notes: values.notes,
      });

      message.success('Tax Invoice generated successfully!');
      setInvoiceModalVisible(false);
      invoiceForm.resetFields();
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      await api.post(`/api/billing/quotations/${quoteId}/convert`);
      message.success('Quotation converted to Tax Invoice!');
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    try {
      await api.patch(`/api/billing/invoices/${invoiceId}/status`, { status });
      message.success(`Invoice marked as ${status.toUpperCase()}.`);
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status, paidAt: status === 'paid' ? new Date().toISOString() : null });
      }
      loadBillingData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleOpenPreview = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPreviewModalVisible(true);
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
      message.success('UPI ID updated & saved locally.');
    }
  };

  const handleSendInvoiceWhatsApp = (invoice?: any) => {
    const inv = invoice || selectedInvoice;
    if (!inv) return;

    const payee = company?.settings?.upiName || company?.name || 'Ginie Space';
    const upiUri = buildUpiUri({
      vpa: adminUpiVpa,
      payeeName: payee,
      amount: Number(inv.total || 0),
      transactionNote: `Invoice ${inv.invoiceNumber}`,
    });

    let customerPhone = '';
    if (inv.contact?.phone) {
      customerPhone = inv.contact.phone.replace(/[^0-9]/g, '');
    } else if (inv.notes) {
      try {
        const parsed = JSON.parse(inv.notes);
        if (parsed?.gstMeta?.customerPhone) {
          customerPhone = parsed.gstMeta.customerPhone.replace(/[^0-9]/g, '');
        }
      } catch {}
    }

    if (customerPhone.length === 10) {
      customerPhone = '91' + customerPhone;
    }

    const text =
      `*TAX INVOICE: ${inv.invoiceNumber}*\n` +
      `From: ${company?.name || 'Our Company'}\n` +
      `Amount Due: ₹${Number(inv.total || 0).toLocaleString('en-IN')}\n` +
      `Due Date: ${inv.dueDate ? formatDateIndian(inv.dueDate) : 'Immediate'}\n\n` +
      `👉 *Pay instantly via GooglePay / PhonePe / Paytm / BHIM:*\n` +
      `${upiUri}\n\n` +
      `Thank you for your business!`;

    const waUrl = customerPhone
      ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Helper to extract customer details from invoice
  const getInvoiceCustomerInfo = (inv: any) => {
    if (!inv) return { name: 'Customer', phone: '', address: '', gstin: 'URP (Unregistered Person)', state: 'Maharashtra' };
    let parsedNotes: any = null;
    if (inv.notes) {
      try {
        parsedNotes = JSON.parse(inv.notes);
      } catch {}
    }

    const name =
      inv.contact?.name ||
      parsedNotes?.gstMeta?.customerName ||
      inv.quotation?.contact?.name ||
      'Walk-in / Cash Customer';

    const phone =
      inv.contact?.phone ||
      parsedNotes?.gstMeta?.customerPhone ||
      inv.quotation?.contact?.phone ||
      '';

    const address =
      parsedNotes?.gstMeta?.customerAddress ||
      inv.contact?.address ||
      inv.contact?.city ||
      '';

    const gstin =
      parsedNotes?.gstMeta?.customerGstin ||
      'URP (Unregistered Consumer)';

    const state =
      parsedNotes?.gstMeta?.customerState ||
      company?.settings?.state ||
      'Maharashtra';

    return { name, phone, address, gstin, state };
  };

  const productColumns = [
    {
      title: 'Product / Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Code / HSN',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => code ? <Tag color="geekblue">{code}</Tag> : '—',
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
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: any) => record.contact?.name || 'Standard Client',
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
      render: (num: string, record: any) => (
        <div>
          <Text strong style={{ color: brandColor, cursor: 'pointer' }} onClick={() => handleOpenPreview(record)}>
            {num}
          </Text>
          <div style={{ fontSize: 12, color: '#888' }}>
            {getInvoiceCustomerInfo(record).name}
          </div>
        </div>
      ),
    },
    {
      title: 'Taxable Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (val: any) => formatIndianCurrency(Number(val)),
    },
    {
      title: 'GST Total',
      dataIndex: 'taxTotal',
      key: 'taxTotal',
      render: (val: any) => formatIndianCurrency(Number(val)),
    },
    {
      title: 'Grand Total',
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
      render: (st: string, record: any) => {
        let color = 'orange';
        if (st === 'paid') color = 'green';
        if (st === 'partial') color = 'blue';
        if (st === 'cancelled') color = 'default';
        return (
          <Select
            size="small"
            value={st}
            onChange={(newSt) => handleUpdateStatus(record.id, newSt)}
            style={{ width: 110 }}
            options={[
              { value: 'unpaid', label: <Tag color="orange">UNPAID</Tag> },
              { value: 'partial', label: <Tag color="blue">PARTIAL</Tag> },
              { value: 'paid', label: <Tag color="green">PAID</Tag> },
              { value: 'cancelled', label: <Tag color="default">CANCELLED</Tag> },
            ]}
          />
        );
      },
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
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleOpenPreview(record)}
          >
            View / Print
          </Button>
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => handleOpenUpiModal(record)}
            style={{ color: '#25D366', borderColor: '#25D366' }}
          >
            UPI & WA
          </Button>
        </Space>
      ),
    },
  ];

  const currentUpiUri = selectedInvoice
    ? buildUpiUri({
        vpa: adminUpiVpa,
        payeeName: company?.settings?.upiName || company?.name || 'Ginie Space',
        amount: Number(selectedInvoice.total || 0),
        transactionNote: `Invoice ${selectedInvoice.invoiceNumber}`,
      })
    : '';

  const qrImageUrl = currentUpiUri ? buildUpiQrCodeUrl(currentUpiUri, 280) : '';

  // Data for the active preview modal
  const customerInfo = selectedInvoice ? getInvoiceCustomerInfo(selectedInvoice) : null;
  const compSettings = company?.settings || {};
  const isInterStateInvoice = Boolean(
    selectedInvoice?.items?.some((it: any) => it.isInterState) ||
    (customerInfo?.state && compSettings.state && customerInfo.state.toLowerCase() !== compSettings.state.toLowerCase())
  );

  const tabItems = [
    {
      key: 'invoices',
      label: (
        <span>
          <CheckCircleOutlined /> Tax Invoices
        </span>
      ),
      children: (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Tax Invoices & GST Bills</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setInvoiceModalVisible(true)}
              >
                + New GST Invoice
              </Button>
            </div>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No invoices generated yet. Click "+ New GST Invoice" to create one.' }}
          />
        </Card>
      ),
    },
    {
      key: 'quotes',
      label: (
        <span>
          <FileTextOutlined /> Price Quotations
        </span>
      ),
      children: (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Customer Price Quotations</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setQuoteModalVisible(true)}
              >
                {t.billing.createQuote}
              </Button>
            </div>
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
          <ShoppingOutlined /> Products & Services Catalog
        </span>
      ),
      children: (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Products, Items & Service Rates</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setProductModalVisible(true)}
              >
                {t.billing.addProduct}
              </Button>
            </div>
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
      {/* Print CSS styling for clean, full-width A4 print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #gst-invoice-paper, #gst-invoice-paper * {
            visibility: visible;
          }
          #gst-invoice-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            GST Invoicing & Payments
          </Title>
          <Text type="secondary">
            Compliant Indian Tax Invoices, Quotations, and Instant UPI Payment Links for PhonePe, GooglePay & Paytm
          </Text>
        </div>

        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setQuoteModalVisible(true)}>
            New Quotation
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setInvoiceModalVisible(true)}>
            New GST Invoice
          </Button>
        </Space>
      </div>

      <Tabs items={tabItems} size="large" defaultActiveKey="invoices" />

      {/* FULL PROFESSIONAL INDIAN GST TAX INVOICE MODAL */}
      <Modal
        title={
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%' }}>
            <Space>
              <FileTextOutlined style={{ color: brandColor, fontSize: 18 }} />
              <span style={{ fontWeight: 700 }}>Tax Invoice: {selectedInvoice?.invoiceNumber}</span>
              <Tag color={selectedInvoice?.status === 'paid' ? 'green' : 'orange'}>
                {selectedInvoice?.status?.toUpperCase()}
              </Tag>
            </Space>
            <Space>
              <Button
                icon={<WhatsAppOutlined />}
                onClick={() => handleSendInvoiceWhatsApp()}
                style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
              >
                Send via WhatsApp
              </Button>
              <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
                Print / Save PDF
              </Button>
            </Space>
          </div>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={850}
        style={{ top: 20 }}
      >
        {selectedInvoice && (
          <div
            id="gst-invoice-paper"
            style={{
              background: '#fff',
              padding: '28px 32px',
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              color: '#1a1a1a',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Top Tax Invoice Banner */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1677ff', paddingBottom: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1.5, color: '#1677ff' }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>
                (ORIGINAL FOR RECIPIENT &bull; SECTION 31 OF CGST ACT, 2017)
              </div>
            </div>

            {/* Header: Company info (Left) + Invoice details (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#000', marginBottom: 2 }}>
                  {company?.name || 'Acme Enterprises'}
                </div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>
                  {compSettings.address || 'Plot No 42, Industrial Area'}<br />
                  {compSettings.city ? `${compSettings.city}, ` : ''}{compSettings.state || 'Maharashtra'} - {compSettings.pincode || '400001'}<br />
                  <strong>GSTIN:</strong> {compSettings.gstin || '27AAPFU0939F1ZV'} &bull; <strong>PAN:</strong> {compSettings.pan || 'AAPFU0939F'}<br />
                  <strong>State:</strong> {compSettings.state || 'Maharashtra'} (Code: {compSettings.stateCode || '27'})<br />
                  {compSettings.phone && <><strong>Phone:</strong> {compSettings.phone} &bull; </>}
                  {compSettings.email && <><strong>Email:</strong> {compSettings.email}</>}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <table style={{ width: '100%', lineHeight: 1.6 }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#666' }}>Invoice No:</td>
                      <td style={{ fontWeight: 700, textAlign: 'right' }}>{selectedInvoice.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#666' }}>Invoice Date:</td>
                      <td style={{ fontWeight: 600, textAlign: 'right' }}>{formatDateIndian(selectedInvoice.createdAt)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#666' }}>Payment Due:</td>
                      <td style={{ fontWeight: 600, textAlign: 'right', color: '#cf1322' }}>
                        {selectedInvoice.dueDate ? formatDateIndian(selectedInvoice.dueDate) : 'Immediate'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#666' }}>Place of Supply:</td>
                      <td style={{ fontWeight: 600, textAlign: 'right' }}>
                        {customerInfo?.state || compSettings.state || 'Maharashtra'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#666' }}>Reverse Charge:</td>
                      <td style={{ fontWeight: 600, textAlign: 'right' }}>No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billed To (Buyer Details) */}
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '10px 14px', marginBottom: 16, background: '#fafafa' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>
                BILLED TO / BUYER DETAILS:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, fontSize: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>{customerInfo?.name}</div>
                  {customerInfo?.address && <div style={{ color: '#444' }}>{customerInfo.address}</div>}
                  {customerInfo?.phone && <div style={{ color: '#444' }}><strong>Phone:</strong> {customerInfo.phone}</div>}
                </div>
                <div>
                  <div><strong>Buyer GSTIN:</strong> {customerInfo?.gstin}</div>
                  <div><strong>State:</strong> {customerInfo?.state}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 11.5,
                marginBottom: 16,
                border: '1px solid #d9d9d9',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', width: 30, borderRight: '1px solid #cbd5e1' }}>#</th>
                  <th style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1' }}>Description of Goods / Services</th>
                  <th style={{ padding: '8px 10px', width: 75, borderRight: '1px solid #cbd5e1' }}>HSN/SAC</th>
                  <th style={{ padding: '8px 10px', width: 45, textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Qty</th>
                  <th style={{ padding: '8px 10px', width: 85, textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', width: 95, textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Taxable (₹)</th>
                  {!isInterStateInvoice ? (
                    <>
                      <th style={{ padding: '8px 10px', width: 85, textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>CGST</th>
                      <th style={{ padding: '8px 10px', width: 85, textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>SGST</th>
                    </>
                  ) : (
                    <th style={{ padding: '8px 10px', width: 110, textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>IGST (18%)</th>
                  )}
                  <th style={{ padding: '8px 10px', width: 105, textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {((selectedInvoice.items as any[]) || []).map((it, idx) => {
                  const qty = Number(it.quantity || 1);
                  const price = Number(it.price || 0);
                  const lineTaxable = Number(it.lineTaxable || (price * qty));
                  const taxRate = Number(it.taxRate !== undefined ? it.taxRate : 18);
                  const cgst = Number(it.cgst || (isInterStateInvoice ? 0 : (lineTaxable * (taxRate / 2)) / 100));
                  const sgst = Number(it.sgst || (isInterStateInvoice ? 0 : (lineTaxable * (taxRate / 2)) / 100));
                  const igst = Number(it.igst || (isInterStateInvoice ? (lineTaxable * taxRate) / 100 : 0));
                  const lineTotal = Number(it.total || (lineTaxable + cgst + sgst + igst));

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#000' }}>{it.name}</strong>
                      </td>
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #e2e8f0', color: '#555' }}>
                        {it.hsn || it.code || '998314'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{qty}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>
                        {price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>
                        {lineTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      {!isInterStateInvoice ? (
                        <>
                          <td style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: 10, color: '#666' }}>({taxRate / 2}%)</span>{' '}
                            {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: 10, color: '#666' }}>({taxRate / 2}%)</span>{' '}
                            {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </>
                      ) : (
                        <td style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: 10, color: '#666' }}>({taxRate}%)</span>{' '}
                          {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Calculations & Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <strong>Invoice Amount in Words:</strong><br />
                  <span style={{ fontStyle: 'italic', color: '#1677ff', fontWeight: 600 }}>
                    {numberToIndianWords(Number(selectedInvoice.total || 0))}
                  </span>
                </div>

                {selectedInvoice.notes && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 10 }}>
                    <strong>Notes / Terms:</strong>
                    <div>
                      {selectedInvoice.notes.startsWith('{')
                        ? JSON.parse(selectedInvoice.notes)?.text || 'Net 15 days payment terms.'
                        : selectedInvoice.notes}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <table style={{ width: '100%', lineHeight: 1.8 }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#555' }}>Taxable Value:</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{Number(selectedInvoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {!isInterStateInvoice ? (
                      <>
                        <tr>
                          <td style={{ color: '#555' }}>Central GST (CGST 9%):</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{(Number(selectedInvoice.taxTotal || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: '#555' }}>State GST (SGST 9%):</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹{(Number(selectedInvoice.taxTotal || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td style={{ color: '#555' }}>Integrated GST (IGST 18%):</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{Number(selectedInvoice.taxTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ fontSize: 14, fontWeight: 800, color: '#000', paddingTop: 6 }}>
                        Grand Total (INR):
                      </td>
                      <td style={{ fontSize: 16, fontWeight: 800, color: '#52c41a', textAlign: 'right', paddingTop: 6 }}>
                        ₹{Number(selectedInvoice.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section: Bank & UPI QR (Left) + Signatory (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, borderTop: '1px solid #d9d9d9', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Live UPI QR Code embedded directly on invoice */}
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={qrImageUrl}
                    alt="Scan UPI QR"
                    width={110}
                    height={110}
                    style={{ border: '1px solid #ccc', borderRadius: 4, display: 'block' }}
                  />
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>
                    SCAN TO PAY VIA UPI
                  </div>
                  <div style={{ fontSize: 9, color: '#777' }}>
                    GPay &bull; PhonePe &bull; Paytm
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                  <strong style={{ color: '#000', textTransform: 'uppercase' }}>Bank Account & UPI Details:</strong><br />
                  <strong>UPI ID:</strong> {adminUpiVpa}<br />
                  <strong>Account Name:</strong> {compSettings.upiName || company?.name || 'Acme Enterprises'}<br />
                  <strong>Bank:</strong> {compSettings.bankName || 'HDFC Bank Ltd'}<br />
                  <strong>Account No:</strong> {compSettings.bankAccountNumber || '50200012345678'}<br />
                  <strong>IFSC Code:</strong> {compSettings.bankIfsc || 'HDFC0000123'}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>
                  For {company?.name || 'Acme Enterprises'}
                </div>
                <div style={{ padding: '24px 0 6px', color: '#999', fontSize: 11 }}>
                  [Authorized Signatory / Seal]
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>
                  This is a computer generated tax invoice.
                </div>
              </div>
            </div>

            {/* Action Bar inside Preview Modal (Hidden in Print) */}
            <div className="no-print" style={{ borderTop: '1px solid #e2e8f0', marginTop: 24, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Select
                  value={selectedInvoice.status}
                  onChange={(newSt) => handleUpdateStatus(selectedInvoice.id, newSt)}
                  style={{ width: 140 }}
                  options={[
                    { value: 'unpaid', label: <Tag color="orange">Status: UNPAID</Tag> },
                    { value: 'partial', label: <Tag color="blue">Status: PARTIAL</Tag> },
                    { value: 'paid', label: <Tag color="green">Status: PAID</Tag> },
                    { value: 'cancelled', label: <Tag color="default">Status: CANCEL</Tag> },
                  ]}
                />
              </Space>

              <Space>
                <Button
                  icon={<WhatsAppOutlined />}
                  onClick={() => handleSendInvoiceWhatsApp()}
                  style={{ background: '#25D366', color: '#fff', borderColor: '#25D366', fontWeight: 600 }}
                >
                  WhatsApp to Client
                </Button>
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
                  Print / Save as PDF
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* UPI QR & WHATSAPP QUICK DISPATCH MODAL */}
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
                Receiving UPI ID (PhonePe / GooglePay / Paytm / BHIM):
              </Text>
              <Input.Search
                defaultValue={adminUpiVpa}
                enterButton="Save UPI ID"
                onSearch={handleSaveUpiVpa}
                placeholder="yourname@okhdfcbank"
              />
            </div>

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
                onClick={() => handleSendInvoiceWhatsApp()}
                block
                style={{ height: 42, background: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
              >
                Send Invoice & UPI Link on WhatsApp
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

      {/* DIRECT GST INVOICE CREATION MODAL */}
      <Modal
        title="Create New GST Tax Invoice"
        open={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        footer={null}
        destroyOnClose
        width={680}
      >
        <Form form={invoiceForm} layout="vertical" onFinish={handleCreateInvoice} initialValues={{ quantity: 1, taxRate: 18, isInterState: false }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="contactId" label="Select Existing Customer / Contact">
                <Select
                  allowClear
                  showSearch
                  placeholder="Choose an existing contact or enter below"
                  optionFilterProp="label"
                  options={contacts.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.phone || c.city || 'No phone'})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="customerName" label="Or Direct Customer / Business Name">
                <Input placeholder="e.g. Apex Industrial Solutions" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="customerGstin" label="Customer GSTIN (if registered)">
                <Input placeholder="27BBBBB0000A1Z5" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="customerPhone" label="Customer Phone / WhatsApp">
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="customerAddress" label="Billing Address">
                <Input placeholder="e.g. Shop 12, MG Road, Pune" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="customerState" label="State of Supply">
                <Input placeholder="e.g. Maharashtra" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }}>Invoice Item & Tax Details</Divider>

          <Row gutter={16}>
            <Col xs={24} md={14}>
              <Form.Item name="productId" label="Choose Product / Service from Catalog">
                <Select
                  allowClear
                  placeholder="Select product or enter custom name below"
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} — ${formatIndianCurrency(Number(p.price))}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item name="hsn" label="HSN / SAC Code">
                <Input placeholder="e.g. 998314 or 8471" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="customItemName" label="Or Enter Custom Item Description">
            <Input placeholder="e.g. Annual Cloud ERP Subscription" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Unit Rate (₹)"
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="15000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="taxRate" label="GST Rate (%)">
                <Select
                  options={[
                    { value: 0, label: '0% (Exempt)' },
                    { value: 5, label: '5% GST' },
                    { value: 12, label: '12% GST' },
                    { value: 18, label: '18% Standard GST' },
                    { value: 28, label: '28% Luxury GST' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
            <Col xs={24} md={12}>
              <Form.Item
                name="isInterState"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
                extra="Check if customer is in another state (charges IGST instead of CGST+SGST)"
              >
                <Switch /> <span style={{ marginLeft: 8 }}>Inter-State Supply (IGST)</span>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dueDate" label="Due Date" style={{ marginBottom: 0 }}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Terms or Notes for Customer">
            <Input.TextArea rows={2} placeholder="e.g. Net 15 days. Payment via UPI QR code." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setInvoiceModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              Generate Tax Invoice
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ADD PRODUCT MODAL */}
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

          <Form.Item name="code" label="HSN / SAC or SKU Code">
            <Input placeholder="e.g. 998314 or AMC-001" />
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

          <Form.Item name="unit" label="Unit">
            <Select
              options={[
                { value: 'piece', label: 'Piece (pcs)' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
                { value: 'hour', label: 'Hour' },
                { value: 'project', label: 'Project' },
                { value: 'kg', label: 'Kg' },
              ]}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setProductModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* CREATE QUOTATION MODAL */}
      <Modal
        title={t.billing.createQuote}
        open={quoteModalVisible}
        onCancel={() => setQuoteModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={quoteForm} layout="vertical" onFinish={handleCreateQuotation} initialValues={{ quantity: 1, taxRate: 18 }}>
          <Form.Item name="contactId" label="Choose Customer / Contact">
            <Select
              allowClear
              showSearch
              placeholder="Select contact"
              optionFilterProp="label"
              options={contacts.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone || c.city || 'No phone'})`,
              }))}
            />
          </Form.Item>

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
