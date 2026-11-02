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
} from '@ant-design/icons';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function PublicStorePage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<any[]>([
    { id: '1', name: 'Premium Cotton Shirt', price: 899, category: 'Apparel', code: 'APP-01', inStock: true },
    { id: '2', name: 'Formal Trousers Slim Fit', price: 1299, category: 'Apparel', code: 'APP-02', inStock: true },
    { id: '3', name: 'Pure Leather Belt (Black)', price: 450, category: 'Accessories', code: 'ACC-01', inStock: true },
    { id: '4', name: 'Cotton Socks Pack of 3', price: 199, category: 'Accessories', code: 'ACC-02', inStock: true },
    { id: '5', name: 'Leather Wallet Men Bi-fold', price: 650, category: 'Accessories', code: 'ACC-03', inStock: true },
    { id: '6', name: 'Designer Polo T-Shirt', price: 599, category: 'Apparel', code: 'APP-03', inStock: true },
  ]);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  const companyName = 'GINIE Official Store';
  const whatsappNumber = '918797186001';

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
    const orderItems = cart.map((item) => `• ${item.name} x ${item.qty} = ₹${item.price * item.qty}`).join('\n');
    const orderText = `Hello ${companyName}! 🛍️\n\nI want to place an order from your digital catalog:\n\n${orderItems}\n\n*Total Amount:* ₹${cartTotal.toLocaleString('en-IN')}\n*Customer Name:* ${customerName || 'Shopper'}\n*Phone:* ${customerPhone || 'Not provided'}\n\nPlease confirm my order and send payment details!`;

    const encoded = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(waUrl, '_blank');
    message.success('Opening WhatsApp to send order directly to store!');
    setCartOpen(false);
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
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShopOutlined style={{ fontSize: 22, color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>{companyName}</span>
                <Tag color="green" style={{ borderRadius: 10, fontSize: 11 }}>VERIFIED SELLER</Tag>
              </div>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Digital Storefront • Order directly on WhatsApp</Text>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => setCartOpen(true)}
            style={{ borderRadius: 8, fontWeight: 700 }}
          >
            Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
          </Button>
        </div>
      </header>

      {/* Main Catalog */}
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: 20 }}>
          <Input
            size="large"
            placeholder="Search items in store..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          />
        </div>

        {/* Product Cards Grid */}
        <Row gutter={[16, 16]}>
          {filteredProducts.map((p) => (
            <Col xs={12} sm={8} md={6} key={p.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                styles={{ body: { padding: 14 } }}
              >
                <div>
                  <div style={{ height: 110, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <ShopOutlined style={{ fontSize: 36, color: '#94a3b8' }} />
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
                    style={{ borderRadius: 6 }}
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
    </div>
  );
}
