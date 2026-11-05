'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Tabs,
  Badge,
  Tooltip,
  Drawer,
  Popconfirm,
  Statistic,
} from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  QrcodeOutlined,
  EyeOutlined,
  WhatsAppOutlined,
  CheckCircleFilled,
  SyncOutlined,
  DownloadOutlined,
  LinkOutlined,
  DollarCircleOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  LockOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function DigitalStoreDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: 'My Digital Store',
    slug: 'catalog',
    whatsappNumber: '',
    upiId: '',
  });

  // Modal / Drawer States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any>(null);

  const [productForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [prodsRes, ordersRes, compRes] = await Promise.all([
        api.get('/api/billing/products').catch(() => []),
        api.get('/api/billing/store-orders').catch(() => []),
        api.get('/api/settings/company').catch(() => null),
      ]);

      if (Array.isArray(prodsRes)) {
        setProducts(prodsRes);
      }

      if (Array.isArray(ordersRes)) {
        setOrders(ordersRes);
      }

      if (compRes) {
        const slug = compRes.slug || 'catalog';
        const name = compRes.name || 'My Digital Store';
        const phone = compRes.settings?.whatsappPhone || compRes.phone || compRes.users?.[0]?.phone || '';
        const upi = compRes.settings?.upiId || '';
        const bType = compRes.businessType || 'retail';

        const updatedSettings = {
          storeName: name,
          slug,
          whatsappNumber: phone,
          upiId: upi,
          businessType: bType,
        };
        setStoreSettings(updatedSettings);
        settingsForm.setFieldsValue(updatedSettings);
      }
    } catch (err: any) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Save or Update Product
  const handleSaveProduct = async (values: any) => {
    try {
      if (editingProduct?.id) {
        await api.patch(`/api/billing/products/${editingProduct.id}`, {
          ...values,
          price: Number(values.price),
          stockInHand: Number(values.stockInHand || 0),
          isPublishedToStore: values.isPublishedToStore !== false,
        });
        message.success('Product updated in Storefront & Billing Catalog!');
      } else {
        await api.post('/api/billing/products', {
          ...values,
          price: Number(values.price),
          stockInHand: Number(values.stockInHand || 0),
          isPublishedToStore: values.isPublishedToStore !== false,
        });
        message.success('New product published to Storefront!');
      }
      setProductModalOpen(false);
      productForm.resetFields();
      setEditingProduct(null);
      loadStoreData();
    } catch (err: any) {
      message.error(err.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/api/billing/products/${id}`);
      message.success('Product removed from Storefront.');
      loadStoreData();
    } catch (err: any) {
      message.error(err.message || 'Failed to remove product');
    }
  };

  // Toggle Store Publish
  const handleTogglePublish = async (record: any, checked: boolean) => {
    try {
      await api.patch(`/api/billing/products/${record.id}`, {
        isPublishedToStore: checked,
      });
      message.success(`${record.name} is now ${checked ? 'visible' : 'hidden'} on store.`);
      loadStoreData();
    } catch (err: any) {
      message.error(err.message || 'Failed to update visibility');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/api/billing/store-orders/${orderId}/status`, { status });
      message.success(`Order #${orderId.slice(-6)} marked as ${status}.`);
      loadStoreData();
    } catch (err: any) {
      message.error(err.message || 'Failed to update order status');
    }
  };

  // Send WhatsApp Order Update via Backend Automation
  const handleSendStoreOrderWhatsApp = async (order: any) => {
    try {
      message.loading({ content: 'WhatsApp update dispatch ho raha hai...', key: 'wa-store-order' });
      const res = await api.post(`/api/billing/store-orders/${order.id}/send-whatsapp`);
      message.destroy('wa-store-order');
      if (res?.sentViaAutomation) {
        message.success(`Order update customer (+${res.phone}) ke WhatsApp par bhej diya gaya!`);
      } else {
        message.warning('WhatsApp device connect nahi hai. WhatsApp Web open kiya ja raha hai...');
        if (res?.waClickUrl) {
          window.open(res.waClickUrl, '_blank');
        }
      }
    } catch (err: any) {
      message.destroy('wa-store-order');
      message.error(err.message || 'WhatsApp message send karne me dikkat aayi.');
    }
  };

  // Save Store Settings
  const handleSaveSettings = async (values: any) => {
    try {
      await api.patch('/api/settings/company', {
        name: values.storeName,
        slug: values.slug,
        whatsappPhone: values.whatsappNumber,
        upiId: values.upiId,
      }).catch(() => {});
      setStoreSettings((prev: any) => ({ ...prev, ...values }));
      localStorage.setItem('ginie_storefront_settings', JSON.stringify(values));
      message.success('Store settings saved successfully!');
    } catch (err: any) {
      message.error(err.message || 'Failed to save settings');
    }
  };

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/store/${storeSettings.slug || 'catalog'}`
    : `https://ginie.space/store/${storeSettings.slug || 'catalog'}`;

  const copyStoreLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(storeUrl);
      message.success('Public Store link copied to clipboard!');
    }
  };

  // Calculate Metrics
  const onlineItemsCount = products.filter((p) => p.isPublishedToStore !== false && p.isActive !== false).length;
  const totalOrdersCount = orders.length;
  const totalSalesAmount = orders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);

  // Table Columns: Products
  const productColumns = [
    {
      title: 'Item & SKU',
      key: 'name',
      render: (_: any, r: any) => (
        <div>
          <Text strong style={{ color: '#0f172a', fontSize: 14 }}>{r.name}</Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Code: {r.code || r.sku || 'SKU-001'} &bull; {r.unit || 'piece'}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag color="blue">{cat || 'General'}</Tag>,
    },
    {
      title: 'Price (INR)',
      dataIndex: 'price',
      key: 'price',
      render: (p: any) => (
        <Text strong style={{ color: '#16a34a' }}>
          ₹{Number(p).toLocaleString('en-IN')}
        </Text>
      ),
    },
    {
      title: 'Stock In-Hand',
      dataIndex: 'stockInHand',
      key: 'stockInHand',
      render: (stock: any) => {
        const qty = Number(stock || 0);
        return (
          <Badge
            status={qty <= 5 ? 'error' : 'success'}
            text={<span style={{ fontWeight: 600 }}>{qty} in stock</span>}
          />
        );
      },
    },
    {
      title: 'Storefront',
      key: 'isPublishedToStore',
      render: (_: any, r: any) => (
        <Switch
          checked={r.isPublishedToStore !== false}
          onChange={(checked) => handleTogglePublish(r, checked)}
          checkedChildren="Live"
          unCheckedChildren="Hidden"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(r);
              productForm.setFieldsValue({
                ...r,
                price: Number(r.price),
                stockInHand: Number(r.stockInHand || 0),
              });
              setProductModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Remove from Storefront?"
            description="This will remove the item from your public catalog."
            onConfirm={() => handleDeleteProduct(r.id)}
            okText="Remove"
            cancelText="Cancel"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Table Columns: Orders
  const orderColumns = [
    {
      title: 'Order ID',
      key: 'id',
      render: (_: any, r: any) => (
        <Text strong style={{ color: '#2563eb' }}>
          #{r.id?.slice(-6)?.toUpperCase() || 'ORD'}
        </Text>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, r: any) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.customerName || 'Customer'}</div>
          {r.customerPhone && (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {r.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any) => {
        const count = Array.isArray(items) ? items.reduce((s, it) => s + (it.qty || 1), 0) : 1;
        return <Tag color="geekblue">{count} items</Tag>;
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (tot: any) => (
        <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
          ₹{Number(tot || 0).toLocaleString('en-IN')}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        const color =
          st === 'delivered' ? 'success' : st === 'confirmed' ? 'processing' : st === 'cancelled' ? 'error' : 'warning';
        return <Tag color={color}>{st ? st.toUpperCase() : 'PENDING'}</Tag>;
      },
    },
    {
      title: 'Manage Order',
      key: 'actions',
      render: (_: any, r: any) => {
        const cleanPhone = r.customerPhone ? r.customerPhone.replace(/[^0-9]/g, '') : '';
        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const ordCode = r.id?.slice(-6)?.toUpperCase();

        let waMessage = `Namaste ${r.customerName || 'Customer'}, regarding your store order #${ordCode} (INR ${r.total}). We are reviewing your order!`;
        if (r.status === 'confirmed') {
          waMessage = `Namaste ${r.customerName || 'Customer'}, your store order #${ordCode} for INR ${r.total} is CONFIRMED and is being prepared for delivery!`;
        } else if (r.status === 'delivered') {
          waMessage = `Namaste ${r.customerName || 'Customer'}, your store order #${ordCode} has been DELIVERED. Thank you for shopping with us! Your loyalty cashback points are credited.`;
        } else if (r.status === 'cancelled') {
          waMessage = `Namaste ${r.customerName || 'Customer'}, your store order #${ordCode} was CANCELLED. Any queries, please contact us.`;
        }
        const waText = encodeURIComponent(waMessage);

        return (
          <Space size="small">
            <Select
              size="small"
              value={r.status || 'pending'}
              style={{ width: 110 }}
              onChange={(val) => handleUpdateOrderStatus(r.id, val)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            {cleanPhone && (
              <Button
                size="small"
                icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                onClick={() => handleSendStoreOrderWhatsApp(r)}
                title="Send status update on WhatsApp"
                style={{ borderColor: '#25D366', color: '#25D366', fontWeight: 600 }}
              >
                WhatsApp
              </Button>
            )}
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => {
                setSelectedReceiptOrder(r);
                setReceiptModalOpen(true);
              }}
              title="Print Order Receipt / Packing Slip"
            >
              Print Slip
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="ginie-page-container" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Banner / Store URL Card */}
      <Card
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          marginBottom: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Row gutter={[24, 20]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShopOutlined style={{ fontSize: 20, color: '#ffffff' }} />
              </div>
              <div>
                <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  {storeSettings.storeName || 'Digital Store'}
                </Title>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>
                  Your Public Online Dukaan & WhatsApp Order Catalog
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: 8,
                marginTop: 6,
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <LinkOutlined style={{ color: '#38bdf8' }} />
              <Text style={{ color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace' }} ellipsis>
                {storeUrl}
              </Text>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined style={{ color: '#38bdf8' }} />}
                onClick={copyStoreLink}
                style={{ color: '#38bdf8', padding: '0 4px' }}
              >
                Copy
              </Button>
            </div>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space wrap size="middle">
              <Button
                icon={<EyeOutlined />}
                onClick={() => setPreviewDrawerOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Mobile Preview
              </Button>
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => setQrModalOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Store QR Standee
              </Button>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                href={storeUrl}
                target="_blank"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  borderRadius: 8,
                  fontWeight: 700,
                  borderColor: '#2563eb',
                }}
              >
                Open Storefront
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 10, textAlign: 'center' }} bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>Published Products</span>}
              value={onlineItemsCount}
              prefix={<AppstoreOutlined style={{ color: '#2563eb' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: 10, textAlign: 'center' }} bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>Customer Orders</span>}
              value={totalOrdersCount}
              prefix={<ShoppingCartOutlined style={{ color: '#f59e0b' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 10, textAlign: 'center' }} bodyStyle={{ padding: 18 }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>Total Storefront Sales</span>}
              value={totalSalesAmount}
              precision={2}
              prefix={<span style={{ fontSize: 18, color: '#10b981', fontWeight: 700 }}>₹</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs Card */}
      <Card
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: 20 }}
      >
        <Tabs
          defaultActiveKey="catalog"
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProduct(null);
                productForm.resetFields();
                productForm.setFieldsValue({ isPublishedToStore: true, stockInHand: 20, taxRate: 18 });
                setProductModalOpen(true);
              }}
              style={{ borderRadius: 8, fontWeight: 700, background: '#2563eb', borderColor: '#2563eb' }}
            >
              Add New Product
            </Button>
          }
          items={[
            {
              key: 'catalog',
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Storefront Catalog ({products.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={products}
                  columns={productColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 750 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
            {
              key: 'orders',
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Store Orders ({orders.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={orders}
                  columns={orderColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
            {
              key: 'settings',
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Store Settings & WhatsApp
                </span>
              ),
              children: (
                <div style={{ maxWidth: 600, padding: '16px 0' }}>
                  <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
                    <Form.Item label="Storefront Industry Category (व्यापार श्रेणी)">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <LockOutlined style={{ color: '#d97706' }} />
                          <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                            {storeSettings.businessType || 'RETAIL'}
                          </span>
                        </div>
                        <Tag color="gold" style={{ fontWeight: 700, borderRadius: 6, margin: 0 }}>
                          LOCKED TO ONBOARDING ACCOUNT
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        Aapka digital storefront layout, checkout flow, aur cart isi chune hue category ke anusar dedicated hai aur change nahi ho sakta.
                      </Text>
                    </Form.Item>

                    <Form.Item
                      label="Store Public Name"
                      name="storeName"
                      rules={[{ required: true, message: 'Please enter store name' }]}
                    >
                      <Input placeholder="E.g. Metro Fashion & Cloth Emporium" />
                    </Form.Item>

                    <Form.Item
                      label="Store URL Handle (Slug)"
                      name="slug"
                      rules={[{ required: true, message: 'Please enter store handle' }]}
                    >
                      <Input placeholder="metro-fashion" addonBefore="https://ginie.space/store/" />
                    </Form.Item>

                    <Form.Item
                      label="WhatsApp Order Notification Number"
                      name="whatsappNumber"
                      rules={[{ required: true, message: 'Please enter WhatsApp number' }]}
                      extra="When customers place orders, WhatsApp Web will open with this recipient pre-filled."
                    >
                      <Input placeholder="919876543210" prefix={<WhatsAppOutlined style={{ color: '#25D366' }} />} />
                    </Form.Item>

                    <Form.Item
                      label="Counter UPI ID (For Direct Customer Scan & Pay)"
                      name="upiId"
                      extra="Pre-filled on order invoices and QR codes so funds land directly in your bank account."
                    >
                      <Input placeholder="yourshop@upi" prefix={<QrcodeOutlined />} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={{ borderRadius: 8, fontWeight: 700 }}>
                      Save Storefront Settings
                    </Button>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Product Add/Edit Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product to Storefront'}
        open={productModalOpen}
        onCancel={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onOk={() => productForm.submit()}
        okText={editingProduct ? 'Update Product' : 'Publish to Store'}
        cancelText="Cancel"
      >
        <Form form={productForm} layout="vertical" onFinish={handleSaveProduct} style={{ marginTop: 16 }}>
          <Form.Item
            label="Product / Item Name"
            name="name"
            rules={[{ required: true, message: 'Item name is required' }]}
          >
            <Input placeholder="E.g. Pure Cotton Casual Shirt" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Selling Price (INR)"
                name="price"
                rules={[{ required: true, message: 'Price is required' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="799" prefix="₹" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SKU / Item Code" name="code">
                <Input placeholder="SHIRT-COTTON-01" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Category" name="category">
                <Select
                  placeholder="Select Category"
                  options={[
                    { value: 'Apparel', label: 'Apparel & Clothing' },
                    { value: 'Electronics', label: 'Electronics & Mobiles' },
                    { value: 'Groceries', label: 'Groceries & Provisions' },
                    { value: 'Hardware', label: 'Hardware & Tools' },
                    { value: 'Healthcare', label: 'Medicines & Health' },
                    { value: 'Services', label: 'Services & Maintenance' },
                    { value: 'General', label: 'General' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Stock Quantity (In-Hand)" name="stockInHand">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="25" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Item Description / Highlights" name="description">
            <Input.TextArea rows={2} placeholder="Brief product description for store shoppers..." />
          </Form.Item>

          <Form.Item
            label="Publish to Online Storefront"
            name="isPublishedToStore"
            valuePropName="checked"
          >
            <Switch checkedChildren="Visible" unCheckedChildren="Hidden" defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mobile Live Preview Drawer */}
      <Drawer
        title="Storefront Live Mobile Preview"
        placement="right"
        width={420}
        onClose={() => setPreviewDrawerOpen(false)}
        open={previewDrawerOpen}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<LinkOutlined />}
            href={storeUrl}
            target="_blank"
          >
            Full Window
          </Button>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            This is how your online catalog appears on customer smartphones.
          </Text>
        </div>

        {/* Mobile Phone Mockup Frame */}
        <div
          style={{
            border: '8px solid #0f172a',
            borderRadius: 32,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            height: 650,
            background: '#ffffff',
          }}
        >
          <iframe
            src={storeUrl}
            title="Store Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </Drawer>

      {/* Store QR Code Standee Modal */}
      <Modal
        title="Printable Storefront QR Standee"
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              window.print();
            }}
          >
            Print Standee
          </Button>,
        ]}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            background: '#f8fafc',
            borderRadius: 12,
            border: '2px dashed #cbd5e1',
            margin: '12px 0',
          }}
        >
          <Title level={4} style={{ color: '#0f172a', marginBottom: 4 }}>
            {storeSettings.storeName || 'Digital Store'}
          </Title>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Scan with any phone camera to view full catalog & order
          </div>

          <div
            style={{
              display: 'inline-block',
              background: '#ffffff',
              padding: 16,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              marginBottom: 16,
            }}
          >
            <QrcodeOutlined style={{ fontSize: 140, color: '#0f172a' }} />
          </div>

          <div style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>
            {storeUrl}
          </div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
            Direct WhatsApp Ordering & Dynamic UPI Payments
          </div>
        </div>
      </Modal>

      {/* 1-Click Printable Order Slip Modal (3-inch Thermal & A4) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PrinterOutlined style={{ color: '#1677ff' }} />
            <span>Store Order Receipt & Packing Slip</span>
          </div>
        }
        open={receiptModalOpen}
        onCancel={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setReceiptModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            style={{ borderRadius: 8, fontWeight: 700 }}
          >
            Print Receipt / Slip
          </Button>,
        ]}
        width={420}
      >
        {selectedReceiptOrder && (
          <div id="printable-receipt" style={{ padding: '16px', background: '#ffffff', color: '#0f172a', fontFamily: 'monospace, sans-serif' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>
                {storeSettings.storeName || 'DIGITAL STORE'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {storeSettings.whatsappNumber ? `Tel: +${storeSettings.whatsappNumber}` : ''}
              </div>
              {storeSettings.upiId && (
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  UPI: {storeSettings.upiId}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Order ID:</span>
                <span style={{ fontWeight: 700 }}>#{selectedReceiptOrder.id?.slice(-8)?.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date & Time:</span>
                <span>{new Date(selectedReceiptOrder.createdAt || Date.now()).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{selectedReceiptOrder.paymentMethod || 'COD'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#16a34a' }}>{selectedReceiptOrder.status || 'PENDING'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '10px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                Customer Details
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedReceiptOrder.customerName}</div>
              <div style={{ fontSize: 12 }}>{selectedReceiptOrder.customerPhone}</div>
              {selectedReceiptOrder.customerAddress && (
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  {selectedReceiptOrder.customerAddress}
                </div>
              )}
              {selectedReceiptOrder.notes && (
                <div style={{ fontSize: 11, color: '#b45309', marginTop: 4, background: '#fef3c7', padding: '4px 8px', borderRadius: 4 }}>
                  Note: {selectedReceiptOrder.notes}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div style={{ margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
                <span>Item</span>
                <span style={{ width: 40, textAlign: 'center' }}>Qty</span>
                <span style={{ width: 60, textAlign: 'right' }}>Price</span>
                <span style={{ width: 65, textAlign: 'right' }}>Amount</span>
              </div>
              {(selectedReceiptOrder.items || []).map((it: any, idx: number) => {
                const qty = Number(it.quantity || it.qty || 1);
                const price = Number(it.price || 0);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px dotted #f1f5f9' }}>
                    <span style={{ flex: 1, paddingRight: 4 }}>{it.name || `Item #${idx + 1}`}</span>
                    <span style={{ width: 40, textAlign: 'center' }}>{qty}</span>
                    <span style={{ width: 60, textAlign: 'right' }}>₹{price}</span>
                    <span style={{ width: 65, textAlign: 'right', fontWeight: 600 }}>₹{qty * price}</span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
                <span>TOTAL DUE:</span>
                <span>₹{Number(selectedReceiptOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 10, borderTop: '1px dashed #cbd5e1', fontSize: 11, color: '#64748b' }}>
              Thank You For Your Business!
              <div style={{ fontSize: 10, marginTop: 2 }}>Powered by GINIE Smart Cloud</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
