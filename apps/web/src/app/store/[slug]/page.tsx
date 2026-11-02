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
  Badge,
  Input,
  Drawer,
  message,
  Avatar,
  Divider,
  Modal,
  Form,
  InputNumber,
  Select,
  Tabs,
  Table,
} from 'antd';
import {
  ShoppingCartOutlined,
  WhatsAppOutlined,
  ShopOutlined,
  CheckCircleFilled,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ThunderboltFilled,
  SettingOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function PublicStorePage({ params }: { params: { slug: string } }) {
  const defaultInitialProducts = [
    { id: '1', name: 'Premium Cotton Shirt', price: 899, category: 'Apparel', code: 'APP-01', inStock: true, image: '' },
    { id: '2', name: 'Formal Trousers Slim Fit', price: 1299, category: 'Apparel', code: 'APP-02', inStock: true, image: '' },
    { id: '3', name: 'Pure Leather Belt (Black)', price: 450, category: 'Accessories', code: 'ACC-01', inStock: true, image: '' },
    { id: '4', name: 'Cotton Socks Pack of 3', price: 199, category: 'Accessories', code: 'ACC-02', inStock: true, image: '' },
    { id: '5', name: 'Leather Wallet Men Bi-fold', price: 650, category: 'Accessories', code: 'ACC-03', inStock: true, image: '' },
    { id: '6', name: 'Designer Polo T-Shirt', price: 599, category: 'Apparel', code: 'APP-03', inStock: true, image: '' },
  ];

  const [products, setProducts] = useState<any[]>(defaultInitialProducts);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Store Configuration
  const [companyName, setCompanyName] = useState('GINIE Official Store');
  const [whatsappNumber, setWhatsappNumber] = useState('918797186001');

  const [productForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  useEffect(() => {
    // 1. Load saved store settings
    const savedSettings = localStorage.getItem('ginie_storefront_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.storeName) setCompanyName(parsed.storeName);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
        settingsForm.setFieldsValue(parsed);
      } catch {}
    } else {
      settingsForm.setFieldsValue({
        storeName: 'GINIE Official Store',
        whatsappNumber: '918797186001',
      });
    }

    // 2. Load custom storefront products
    const savedProducts = localStorage.getItem('ginie_storefront_products');
    if (savedProducts) {
      try {
        const parsedProds = JSON.parse(savedProducts);
        if (Array.isArray(parsedProds) && parsedProds.length > 0) {
          setProducts(parsedProds);
        }
      } catch {}
    }

    // 3. Sync with backend catalog if available
    api.get('/api/billing/products')
      .then((backendProds) => {
        if (Array.isArray(backendProds) && backendProds.length > 0) {
          const formatted = backendProds.map((bp) => ({
            id: bp.id,
            name: bp.name,
            price: Number(bp.price || 0),
            category: bp.category || 'General',
            code: bp.code || 'SKU',
            inStock: true,
          }));
          // Merge unique by name
          setProducts((prev) => {
            const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
            const toAdd = formatted.filter((f) => !existingNames.has(f.name.toLowerCase()));
            const merged = [...prev, ...toAdd];
            localStorage.setItem('ginie_storefront_products', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    message.success(`${product.name} added to cart!`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSendOrderWhatsApp = () => {
    if (cart.length === 0) {
      message.warning('Cart is empty.');
      return;
    }
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const orderItems = cart.map((item) => `• ${item.name} x ${item.qty} = ₹${item.price * item.qty}`).join('\n');
    const orderText =
      `Hello ${companyName}! 🛍️\n\n` +
      `I want to place an order from your digital storefront catalog:\n\n` +
      `${orderItems}\n\n` +
      `*Total Amount:* ₹${cartTotal.toLocaleString('en-IN')}\n` +
      `*Customer Name:* ${customerName || 'Shopper'}\n` +
      `*Phone:* ${customerPhone || 'Not provided'}\n\n` +
      `Please confirm my order and share your UPI payment QR details!`;

    const encoded = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/${targetNumber}?text=${encoded}`;
    window.open(waUrl, '_blank');
    message.success('Opening WhatsApp to send order directly to store!');
    setCartOpen(false);
  };

  // Add Product to Storefront
  const handleAddNewProduct = async (values: any) => {
    const newProd = {
      id: `p-${Date.now()}`,
      name: values.name,
      price: Number(values.price || 100),
      category: values.category || 'General',
      code: values.code || `SKU-${Date.now().toString().slice(-4)}`,
      inStock: true,
      image: values.image || '',
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('ginie_storefront_products', JSON.stringify(updated));

    // Also attempt saving to backend billing catalog
    api.post('/api/billing/products', {
      name: values.name,
      price: values.price,
      code: values.code,
      taxRate: values.taxRate || 18,
      unit: values.unit || 'piece',
    }).catch(() => null);

    message.success(`🎉 "${values.name}" uploaded successfully to Storefront!`);
    productForm.resetFields();
  };

  // Delete Product from Storefront
  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('ginie_storefront_products', JSON.stringify(updated));
    message.info('Product removed from storefront.');
  };

  // Save Storefront Settings
  const handleSaveStoreSettings = (values: any) => {
    const storeName = values.storeName || companyName;
    const cleanWa = values.whatsappNumber || whatsappNumber;
    setCompanyName(storeName);
    setWhatsappNumber(cleanWa);

    localStorage.setItem('ginie_storefront_settings', JSON.stringify({
      storeName,
      whatsappNumber: cleanWa,
    }));
    message.success('Storefront name & WhatsApp ordering number updated!');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      {/* Header Banner */}
      <header
        style={{
          background: '#0B0F19',
          color: '#ffffff',
          padding: '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShopOutlined style={{ fontSize: 24, color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 19, fontWeight: 900, color: '#ffffff' }}>{companyName}</span>
                <Tag color="green" style={{ borderRadius: 10, fontSize: 11, fontWeight: 700 }}>VERIFIED STORE</Tag>
              </div>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Digital Storefront &bull; Direct WhatsApp Ordering (+{whatsappNumber})</Text>
            </div>
          </div>

          <Space wrap>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setAdminModalOpen(true)}
              style={{
                borderRadius: 8,
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
              }}
            >
              Upload / Manage Products ⚙️
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartOpen(true)}
              style={{ borderRadius: 8, fontWeight: 700 }}
            >
              Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
            </Button>
          </Space>
        </div>
      </header>

      {/* Main Catalog */}
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
        {/* Search Bar & Share Link */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <Input
            size="large"
            placeholder="Search products or services in store..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          />
          <Button
            size="large"
            icon={<CopyOutlined />}
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                message.success('Storefront public link copied! Share with customers on WhatsApp.');
              }
            }}
            style={{ borderRadius: 10 }}
          >
            Copy Link
          </Button>
        </div>

        {/* Product Cards Grid */}
        <Row gutter={[16, 16]}>
          {filteredProducts.map((p) => (
            <Col xs={12} sm={8} md={6} key={p.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
                styles={{ body: { padding: 14 } }}
              >
                <div>
                  <div
                    style={{
                      height: 110,
                      background: '#f1f5f9',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      overflow: 'hidden',
                    }}
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShopOutlined style={{ fontSize: 36, color: '#94a3b8' }} />
                    )}
                  </div>
                  <Tag color="blue" style={{ fontSize: 10, marginBottom: 4 }}>{p.category}</Tag>
                  <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.3, marginBottom: 6 }}>
                    {p.name}
                  </Text>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#1677ff' }}>₹{p.price}</span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => addToCart(p)}
                    style={{ borderRadius: 6, fontWeight: 600 }}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Cart Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Your Shopping Cart</span>}
        placement="right"
        width={380}
        onClose={() => setCartOpen(false)}
        open={cartOpen}
      >
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16, color: '#cbd5e1' }} />
            <Paragraph style={{ fontWeight: 600 }}>Your cart is empty</Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ overflowY: 'auto' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ maxWidth: '60%' }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>₹{item.price} each</Text>
                  </div>
                  <Space>
                    <Button size="small" onClick={() => updateCartQty(item.id, -1)}>-</Button>
                    <span style={{ fontWeight: 700 }}>{item.qty}</span>
                    <Button size="small" onClick={() => updateCartQty(item.id, 1)}>+</Button>
                    <span style={{ fontWeight: 800, width: 60, textAlign: 'right' }}>
                      ₹{item.price * item.qty}
                    </span>
                  </Space>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: 12 }}>
                <Input
                  placeholder="Your Name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ marginBottom: 8, borderRadius: 6 }}
                />
                <Input
                  placeholder="Your Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ borderRadius: 6 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>Total Amount:</Text>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                onClick={handleSendOrderWhatsApp}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: '#25D366',
                  borderColor: '#25D366',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                Send Order on WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Storefront Merchant Admin Modal: Upload Products & Configure WhatsApp */}
      <Modal
        title={
          <Space>
            <SettingOutlined style={{ color: '#1677ff' }} />
            <span>Storefront Manager: Upload Products & Settings</span>
          </Space>
        }
        open={adminModalOpen}
        onCancel={() => setAdminModalOpen(false)}
        footer={null}
        width={680}
      >
        <Tabs
          defaultActiveKey="upload"
          items={[
            {
              key: 'upload',
              label: '+ Upload New Product / Service',
              children: (
                <Form form={productForm} layout="vertical" onFinish={handleAddNewProduct} initialValues={{ category: 'Apparel', unit: 'piece', taxRate: 18 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={14}>
                      <Form.Item
                        name="name"
                        label="Product or Service Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                      >
                        <Input placeholder="e.g. Formal Cotton Shirt, AC Service, Brass Valve" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item name="category" label="Category">
                        <Select
                          options={[
                            { label: 'Apparel & Clothing', value: 'Apparel' },
                            { label: 'Accessories', value: 'Accessories' },
                            { label: 'Electronics & Gadgets', value: 'Electronics' },
                            { label: 'Food & Groceries', value: 'Food' },
                            { label: 'Services & Consulting', value: 'Services' },
                            { label: 'Industrial & Hardware', value: 'Hardware' },
                            { label: 'Healthcare & Pharma', value: 'Healthcare' },
                            { label: 'Automobile & Spares', value: 'Automobile' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="price"
                        label="Selling Price (₹)"
                        rules={[{ required: true, message: 'Please enter price' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={1} placeholder="899" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="code" label="SKU / HSN Code">
                        <Input placeholder="e.g. SKU-101" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="unit" label="Unit">
                        <Select
                          options={[
                            { label: 'Piece (pcs)', value: 'piece' },
                            { label: 'Kg', value: 'kg' },
                            { label: 'Pack', value: 'pack' },
                            { label: 'Hour / Service', value: 'hour' },
                            { label: 'Month', value: 'month' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="image" label="Product Image URL (Optional)">
                    <Input placeholder="https://example.com/images/shirt.jpg" />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Button onClick={() => setAdminModalOpen(false)}>Close</Button>
                    <Button type="primary" htmlType="submit">
                      Upload to Storefront
                    </Button>
                  </div>
                </Form>
              ),
            },
            {
              key: 'items',
              label: `Active Store Items (${products.length})`,
              children: (
                <Table
                  dataSource={products}
                  rowKey="id"
                  pagination={{ pageSize: 6 }}
                  columns={[
                    { title: 'Item Name', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Category', dataIndex: 'category', key: 'category', render: (c) => <Tag color="blue">{c}</Tag> },
                    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => <span style={{ fontWeight: 800, color: '#1677ff' }}>₹{p}</span> },
                    {
                      title: 'Action',
                      key: 'action',
                      render: (_, r) => (
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteProduct(r.id)}
                        >
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: 'settings',
              label: 'Store & WhatsApp Settings',
              children: (
                <Form form={settingsForm} layout="vertical" onFinish={handleSaveStoreSettings}>
                  <Form.Item
                    name="storeName"
                    label="Store Display Name"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="e.g. Acme Enterprise / Dawood Traders" />
                  </Form.Item>

                  <Form.Item
                    name="whatsappNumber"
                    label="WhatsApp Ordering Number (where orders are received)"
                    rules={[{ required: true }]}
                    extra="Include 91 country code (e.g. 918797186001)"
                  >
                    <Input placeholder="918797186001" />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" htmlType="submit">
                      Save Store Settings
                    </Button>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
