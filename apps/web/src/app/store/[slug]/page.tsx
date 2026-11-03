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
  Spin,
  Alert,
  Switch,
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
  MedicineBoxOutlined,
  CoffeeOutlined,
  AppstoreOutlined,
  BuildOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function PublicStorePage({ params }: { params: { slug: string } }) {
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Customer Checkout Details
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [industryNotes, setIndustryNotes] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loyaltyPointsAvailable, setLoyaltyPointsAvailable] = useState<number>(0);
  const [checkingLoyalty, setCheckingLoyalty] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Store Configuration
  const [companyName, setCompanyName] = useState('GINIE Digital Store');
  const [whatsappNumber, setWhatsappNumber] = useState('918797186001');
  const [businessType, setBusinessType] = useState<string>('retail');

  const [productForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  useEffect(() => {
    loadStoreData();
  }, [params.slug]);

  useEffect(() => {
    const rawDigits = (customerPhone || '').replace(/\D/g, '');
    const phone10 = rawDigits.slice(-10);
    if (phone10.length === 10) {
      setCheckingLoyalty(true);
      api.get(`/api/billing/store/${params.slug}/loyalty-check?phone=${phone10}`)
        .then((res: any) => {
          if (res?.points > 0) {
            setLoyaltyPointsAvailable(res.points);
            if (!customerName && res.customerName) {
              setCustomerName(res.customerName);
            }
          } else {
            setLoyaltyPointsAvailable(0);
            setRedeemPoints(false);
          }
        })
        .catch(() => {
          setLoyaltyPointsAvailable(0);
        })
        .finally(() => {
          setCheckingLoyalty(false);
        });
    } else {
      setLoyaltyPointsAvailable(0);
      setRedeemPoints(false);
    }
  }, [customerPhone, params.slug]);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/billing/store/${params.slug}`);
      if (res) {
        setStore(res);
        setCompanyName(res.name || 'Official Store');
        const wa = res.settings?.whatsappPhone || res.settings?.whatsappNumber || '918797186001';
        setWhatsappNumber(wa);
        setBusinessType(res.businessType || 'retail');
        setProducts(res.products || []);
      }
    } catch {
      // Fallback
      setCompanyName('GINIE Digital Store');
    } finally {
      setLoading(false);
    }
  };

  const getIndustryTheme = () => {
    switch (businessType) {
      case 'restaurant':
        return {
          headerBg: '#0f172a',
          accentColor: '#fa541c',
          tagText: 'Digital Food Menu & Kitchen Ordering (रेस्टोरेंट व फूड मेनू)',
          icon: <CoffeeOutlined style={{ fontSize: 22, color: '#fa541c' }} />,
          buttonLabel: 'Add to Plate',
          cartLabel: 'Your Food Order & Table/Delivery Details',
          notePlaceholder: 'Table number / Cooking instructions (e.g. less spicy, extra chutney)...',
        };
      case 'wholesale':
        return {
          headerBg: '#0f172a',
          accentColor: '#722ed1',
          tagText: 'B2B Wholesale Catalog & Bulk Orders (थोक व्यापार कैटलॉग)',
          icon: <AppstoreOutlined style={{ fontSize: 22, color: '#722ed1' }} />,
          buttonLabel: 'Add to Bulk Cart',
          cartLabel: 'Wholesale Order & Dispatch Destination',
          notePlaceholder: 'Transport name / Delivery instructions / Purchase order ref...',
        };
      case 'clinic':
        return {
          headerBg: '#0f172a',
          accentColor: '#13c2c2',
          tagText: 'Clinic Appointments & Health Packages (क्लिनिक व स्वास्थ्य केंद्र)',
          icon: <MedicineBoxOutlined style={{ fontSize: 22, color: '#13c2c2' }} />,
          buttonLabel: 'Book Consultation / Test',
          cartLabel: 'Patient Appointment Booking & Health Tests',
          notePlaceholder: 'Patient age / Chief symptoms / Preferred slot (Morning / Evening)...',
        };
      case 'services':
        return {
          headerBg: '#0f172a',
          accentColor: '#2f54eb',
          tagText: 'Professional Services & Consulting (सर्विस व एजेंसी पोर्टफोलियो)',
          icon: <CustomerServiceOutlined style={{ fontSize: 22, color: '#2f54eb' }} />,
          buttonLabel: 'Select Service Package',
          cartLabel: 'Service Engagement & Scope Brief',
          notePlaceholder: 'Project goals / Requirements brief / Deadline...',
        };
      case 'factory':
        return {
          headerBg: '#0f172a',
          accentColor: '#fa8c16',
          tagText: 'Industrial Parts & Manufacturing RFQ (फैक्ट्री व उत्पादन कैटलॉग)',
          icon: <BuildOutlined style={{ fontSize: 22, color: '#fa8c16' }} />,
          buttonLabel: 'Add to RFQ Batch',
          cartLabel: 'Industrial Dispatch & Specs Order',
          notePlaceholder: 'Custom material specs / Target delivery date...',
        };
      default:
        return {
          headerBg: '#0f172a',
          accentColor: '#1677ff',
          tagText: 'Official Digital Storefront (डिजिटल स्टोर)',
          icon: <ShopOutlined style={{ fontSize: 22, color: '#1677ff' }} />,
          buttonLabel: 'Add to Cart',
          cartLabel: 'Your Shopping Cart & Delivery Address',
          notePlaceholder: 'Delivery instructions / Landmark / Special requests...',
        };
    }
  };

  const theme = getIndustryTheme();

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const addToCart = (product: any) => {
    // Check ERP stock
    if (product.stockInHand !== undefined && product.stockInHand <= 0) {
      message.warning('Sorry, this product is currently out of stock.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (product.stockInHand && existing.qty >= product.stockInHand) {
          message.warning(`Maximum available stock in hand is ${product.stockInHand}.`);
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    message.success(`${product.name} added!`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (item.stockInHand && newQty > item.stockInHand) {
              message.warning(`Maximum available stock in hand is ${item.stockInHand}.`);
              return item;
            }
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);
  const pointsToRedeem = redeemPoints ? Math.min(loyaltyPointsAvailable, cartTotal) : 0;
  const finalCartTotal = Math.max(0, cartTotal - pointsToRedeem);
  const cashbackPoints = Math.max(10, Math.floor(finalCartTotal * 0.05)); // 5% Cashback

  const handleSendOrderWhatsApp = async () => {
    if (cart.length === 0) {
      message.warning('Cart is empty.');
      return;
    }

    if (!customerPhone.trim()) {
      message.error('Please enter your phone number to receive your order confirmation & loyalty points.');
      return;
    }

    setSubmittingOrder(true);
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const targetNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    // 1. Build line items
    const orderItems = cart
      .map((item) => `- ${item.name} x ${item.qty} = INR ${(Number(item.price) * item.qty).toLocaleString('en-IN')}`)
      .join('\n');

    let extraDetails = '';
    if (businessType === 'restaurant') {
      extraDetails = `*Dining / Delivery:* ${customerAddress || 'Dine-In'}\n` +
        (industryNotes ? `*Cooking Notes:* ${industryNotes}\n` : '');
    } else if (businessType === 'wholesale') {
      extraDetails = (gstNumber ? `*Buyer GSTIN:* ${gstNumber}\n` : '') +
        `*Delivery Address:* ${customerAddress || 'Not specified'}\n` +
        (industryNotes ? `*Transport Notes:* ${industryNotes}\n` : '');
    } else if (businessType === 'clinic') {
      extraDetails = (industryNotes ? `*Patient / Symptoms:* ${industryNotes}\n` : '') +
        `*Preferred Timing:* ${customerAddress || 'Earliest Available'}\n`;
    } else {
      extraDetails = `*Delivery Address:* ${customerAddress || 'Not specified'}\n` +
        (industryNotes ? `*Special Notes:* ${industryNotes}\n` : '');
    }

    const orderText =
      `*GINIE Store Order Confirmation*\n` +
      `--------------------------------\n` +
      `Hello ${companyName}!\n\n` +
      `I have placed an order from your online store catalog:\n\n` +
      `${orderItems}\n\n` +
      `*Subtotal:* INR ${cartTotal.toLocaleString('en-IN')}\n` +
      (pointsToRedeem > 0 ? `*Loyalty Discount Redeemed:* -INR ${pointsToRedeem.toLocaleString('en-IN')}\n` : '') +
      `*Total Due:* INR ${finalCartTotal.toLocaleString('en-IN')}\n` +
      `*Cashback Reward:* +${cashbackPoints} Points to CRM Wallet\n` +
      `--------------------------------\n` +
      `*Customer Name:* ${customerName || 'Store Customer'}\n` +
      `*Customer Phone:* ${customerPhone}\n` +
      extraDetails +
      `\nPlease confirm order receipt & send payment confirmation details!`;

    // 2. Persist order into backend database (which deducts ERP stock & syncs CRM contact + points)
    try {
      await api.post(`/api/billing/store/${params.slug}/order`, {
        customerName: customerName || 'Store Customer',
        customerPhone,
        customerAddress,
        items: cart,
        subtotal: cartTotal,
        redeemPoints: pointsToRedeem,
        total: finalCartTotal,
        notes: industryNotes + (gstNumber ? ` | GSTIN: ${gstNumber}` : ''),
      });

      // Reload store data to reflect live deducted stock
      loadStoreData();
    } catch {
      // Continue even if local offline
    } finally {
      setSubmittingOrder(false);
    }

    // 3. Open WhatsApp directly to merchant
    const encoded = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/${targetNumber}?text=${encoded}`;
    window.open(waUrl, '_blank');
    message.success(`Order placed! +${cashbackPoints} Loyalty Cashback Points credited.`);
    setCartOpen(false);
    setCart([]);
  };

  const handleAddNewProduct = async (values: any) => {
    try {
      await api.post('/api/billing/products', {
        name: values.name,
        price: Number(values.price || 100),
        code: values.code || `SKU-${Date.now().toString().slice(-4)}`,
        category: values.category || 'General',
        unit: values.unit || 'piece',
        stockInHand: Number(values.stockInHand || 50),
        isPublishedToStore: true,
      });

      message.success(`"${values.name}" uploaded to store & ERP!`);
      productForm.resetFields();
      loadStoreData();
    } catch (err: any) {
      message.error(err.message || 'Failed to upload product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      {/* Header Banner */}
      <header
        style={{
          background: theme.headerBg,
          color: '#ffffff',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {theme.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>{companyName}</span>
                <Tag color="success" icon={<CheckCircleFilled />} style={{ borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  VERIFIED STORE
                </Tag>
              </div>
              <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Tag color="processing" style={{ fontSize: 11 }}>{theme.tagText}</Tag>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                  Direct WhatsApp Ordering: +{whatsappNumber}
                </Text>
              </div>
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
              Manage Catalog
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => setCartOpen(true)}
              style={{ borderRadius: 8, fontWeight: 700, background: theme.accentColor, borderColor: theme.accentColor }}
            >
              Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
            </Button>
          </Space>
        </div>
      </header>

      {/* Loyalty Cashback Promo Bar */}
      <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', padding: '8px 16px', textAlign: 'center' }}>
        <Text style={{ color: '#065f46', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <GiftOutlined style={{ color: '#059669' }} />
          <span>GINIE Loyalty Club: Earn <b>5% Instant Cashback Points</b> to your phone number on every order!</span>
        </Text>
      </div>

      {/* Main Catalog */}
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        {/* Search & Category Filter Pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input
            size="large"
            placeholder="Search products, items or services..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 10, flex: 1, minWidth: 260, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
          />
          <Button
            size="large"
            icon={<CopyOutlined />}
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                message.success('Storefront link copied! Share on WhatsApp.');
              }
            }}
            style={{ borderRadius: 10 }}
          >
            Copy Link
          </Button>
        </div>

        {/* Category Pills Bar */}
        {categories.length > 2 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12 }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="middle"
                type={selectedCategory === cat ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  background: selectedCategory === cat ? theme.accentColor : '#ffffff',
                  borderColor: selectedCategory === cat ? theme.accentColor : '#e2e8f0',
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16, color: '#64748b' }}>Loading digital storefront catalog...</Paragraph>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 16 }}>
            <ShopOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }} />
            <Title level={4}>No items found</Title>
            <Paragraph type="secondary">Try searching with a different keyword or upload items from Manage Catalog.</Paragraph>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProducts.map((p) => {
              const inStock = p.stockInHand === undefined || p.stockInHand > 0;
              return (
                <Col xs={12} sm={8} md={6} key={p.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      opacity: inStock ? 1 : 0.75,
                    }}
                    styles={{ body: { padding: 14, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' } }}
                  >
                    <div>
                      {/* Thumbnail Placeholder */}
                      <div
                        style={{
                          height: 120,
                          background: '#f8fafc',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 10,
                          overflow: 'hidden',
                          border: '1px solid #f1f5f9',
                          position: 'relative',
                        }}
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            {theme.icon}
                          </div>
                        )}

                        {/* Stock Tag Overlay */}
                        <div style={{ position: 'absolute', top: 6, right: 6 }}>
                          {inStock ? (
                            <Tag color="green" style={{ fontSize: 10, margin: 0, fontWeight: 700 }}>
                              {p.stockInHand !== undefined ? `${p.stockInHand} in stock` : 'In Stock'}
                            </Tag>
                          ) : (
                            <Tag color="error" style={{ fontSize: 10, margin: 0, fontWeight: 700 }}>
                              Sold Out
                            </Tag>
                          )}
                        </div>
                      </div>

                      {/* Category & Title */}
                      <Tag color="blue" style={{ fontSize: 10, marginBottom: 4 }}>
                        {p.category || 'Item'}
                      </Tag>
                      <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.3, marginBottom: 6 }}>
                        {p.name}
                      </Text>
                      {p.description && (
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.4, marginBottom: 8 }}>
                          {p.description.slice(0, 75)}{p.description.length > 75 ? '...' : ''}
                        </Text>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                          ₹{Number(p.price || 0).toLocaleString('en-IN')}
                        </span>
                        {p.unit && <span style={{ fontSize: 11, color: '#64748b', marginLeft: 3 }}>/{p.unit}</span>}
                      </div>

                      <Button
                        size="small"
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={!inStock}
                        onClick={() => addToCart(p)}
                        style={{
                          borderRadius: 8,
                          fontWeight: 700,
                          background: inStock ? theme.accentColor : '#d1d5db',
                          borderColor: inStock ? theme.accentColor : '#d1d5db',
                        }}
                      >
                        {inStock ? theme.buttonLabel : 'Out of Stock'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* Cart & Checkout Drawer */}
      <Drawer
        title={
          <Space>
            <ShoppingCartOutlined style={{ color: theme.accentColor, fontSize: 20 }} />
            <span style={{ fontWeight: 800 }}>{theme.cartLabel}</span>
          </Space>
        }
        placement="right"
        width={420}
        onClose={() => setCartOpen(false)}
        open={cartOpen}
      >
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <ShoppingCartOutlined style={{ fontSize: 52, marginBottom: 16, color: '#cbd5e1' }} />
            <Paragraph style={{ fontWeight: 600, fontSize: 15 }}>Your cart is empty</Paragraph>
            <Text type="secondary">Browse the catalog and add items to place an order directly on WhatsApp.</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {/* Items List */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ maxWidth: '55%' }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>₹{item.price} each</Text>
                  </div>
                  <Space>
                    <Button size="small" onClick={() => updateCartQty(item.id, -1)}>-</Button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <Button size="small" onClick={() => updateCartQty(item.id, 1)}>+</Button>
                    <span style={{ fontWeight: 800, width: 65, textAlign: 'right', color: '#0f172a' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </Space>
                </div>
              ))}
            </div>

            {/* Customer Inputs & Checkout Bar */}
            <div style={{ paddingTop: 16, borderTop: '2px solid #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 14 }}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Customer Details (For Order & Loyalty Points)
                </Text>
                <Input
                  placeholder="Your 10-Digit Mobile / WhatsApp Number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ marginBottom: 8, borderRadius: 6 }}
                />
                <Input
                  placeholder="Your Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ marginBottom: 8, borderRadius: 6 }}
                />
                <Input.TextArea
                  rows={2}
                  placeholder="Delivery Address / Table Number *"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  style={{ marginBottom: 8, borderRadius: 6 }}
                />
                {businessType === 'wholesale' && (
                  <Input
                    placeholder="GSTIN Number (Optional for Tax Invoice)"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    style={{ marginBottom: 8, borderRadius: 6 }}
                  />
                )}
                <Input
                  placeholder={theme.notePlaceholder}
                  value={industryNotes}
                  onChange={(e) => setIndustryNotes(e.target.value)}
                  style={{ borderRadius: 6 }}
                />

                {loyaltyPointsAvailable > 0 && (
                  <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0', marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#166534', fontSize: 12 }}>
                        Loyalty Points Available:
                      </span>
                      <Tag color="green" style={{ fontWeight: 700, margin: 0 }}>
                        {loyaltyPointsAvailable} Points (₹{loyaltyPointsAvailable})
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#15803d' }}>
                        Redeem ₹{Math.min(loyaltyPointsAvailable, cartTotal)} discount?
                      </span>
                      <Switch
                        checked={redeemPoints}
                        onChange={(checked) => setRedeemPoints(checked)}
                        size="small"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total & Loyalty Points summary */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#64748b' }}>Subtotal:</Text>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {pointsToRedeem > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ fontSize: 13, color: '#16a34a' }}>Loyalty Discount ({pointsToRedeem} pts):</Text>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                      -₹{pointsToRedeem.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                  <Text strong style={{ fontSize: 16 }}>Total to Pay:</Text>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>
                    ₹{finalCartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GiftOutlined /> Loyalty Cashback Earned:
                  </Text>
                  <Tag color="green" style={{ margin: 0, fontWeight: 700 }}>
                    +{cashbackPoints} Wallet Points
                  </Tag>
                </div>
              </div>

              {/* WhatsApp Checkout Button */}
              <Button
                type="primary"
                size="large"
                block
                loading={submittingOrder}
                icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                onClick={handleSendOrderWhatsApp}
                style={{
                  height: 48,
                  borderRadius: 10,
                  background: '#25D366',
                  borderColor: '#25D366',
                  fontWeight: 800,
                  fontSize: 15,
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                Place Order on WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Catalog Manager Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined style={{ color: '#1677ff' }} />
            <span>Storefront Catalog & Settings</span>
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
              label: '+ Add New Item / Product',
              children: (
                <Form form={productForm} layout="vertical" onFinish={handleAddNewProduct} initialValues={{ unit: 'piece', stockInHand: 50 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={14}>
                      <Form.Item
                        name="name"
                        label="Product / Item Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                      >
                        <Input placeholder="e.g. Basmati Rice, Paneer Masala, Cotton Shirt" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10}>
                      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Main Course, Groceries, B2B Bulk" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="price"
                        label="Price (₹)"
                        rules={[{ required: true, message: 'Please enter price' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={1} placeholder="250" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="stockInHand" label="Stock in Hand (ERP)">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="50" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="unit" label="Unit">
                        <Select
                          options={[
                            { label: 'Piece (pcs)', value: 'piece' },
                            { label: 'Plate / Food', value: 'plate' },
                            { label: 'Kg', value: 'kg' },
                            { label: 'Box / Carton', value: 'box' },
                            { label: 'Session / Service', value: 'session' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                    <Button onClick={() => setAdminModalOpen(false)}>Close</Button>
                    <Button type="primary" htmlType="submit">
                      Save & Publish to Store
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
                    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => <span style={{ fontWeight: 800 }}>₹{p}</span> },
                    {
                      title: 'Stock (ERP)',
                      dataIndex: 'stockInHand',
                      key: 'stockInHand',
                      render: (s) => (s !== undefined && s > 0 ? <Tag color="green">{s} in stock</Tag> : <Tag color="red">0 (Sold Out)</Tag>),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
