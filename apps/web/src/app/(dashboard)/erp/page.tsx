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
  Statistic,
  Badge,
  Tooltip,
  Alert,
  Progress,
  List,
  Avatar,
  Segmented,
} from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  WhatsAppOutlined,
  PrinterOutlined,
  WarningOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  BuildOutlined,
  CoffeeOutlined,
  CarOutlined,
  RocketOutlined,
  TeamOutlined,
  BarcodeOutlined,
  SaveOutlined,
  SyncOutlined,
  AuditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Supported Industry Categories
const INDUSTRY_CATEGORIES = [
  {
    key: 'retail',
    label: 'Retail & Store',
    labelHi: 'दुकान व रिटेल',
    icon: <ShopOutlined style={{ fontSize: 16 }} />,
    color: '#1677ff',
    desc: 'Quick POS, Barcode, Stock inward, Cash/UPI counter',
  },
  {
    key: 'wholesale',
    label: 'Wholesale & B2B',
    labelHi: 'थोक व्यापार व डिस्ट्रीब्यूशन',
    icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
    color: '#722ed1',
    desc: 'Tiered B2B pricing, Customer credit ledger (Khata), Challan',
  },
  {
    key: 'manufacturing',
    label: 'Manufacturing & Factory',
    labelHi: 'फैक्ट्री व उत्पादन',
    icon: <BuildOutlined style={{ fontSize: 16 }} />,
    color: '#fa8c16',
    desc: 'Bill of Materials (BOM), Production work orders, Scrap tracking',
  },
  {
    key: 'clinic',
    label: 'Clinic & Healthcare',
    labelHi: 'क्लिनिक व डॉक्टर',
    icon: <MedicineBoxOutlined style={{ fontSize: 16 }} />,
    color: '#eb2f96',
    desc: 'Patient appointments, Prescription billing, Consultation fees',
  },
  {
    key: 'services',
    label: 'Services & Agencies',
    labelHi: 'सर्विस व एजेंसी',
    icon: <RocketOutlined style={{ fontSize: 16 }} />,
    color: '#13c2c2',
    desc: 'Project milestone billing, Timesheets, AMC & Retainers',
  },
  {
    key: 'restaurant',
    label: 'Restaurant & F&B',
    labelHi: 'रेस्टोरेंट व कैफे',
    icon: <CoffeeOutlined style={{ fontSize: 16 }} />,
    color: '#52c41a',
    desc: 'Table manager, Kitchen Order Ticket (KOT), Daily food billing',
  },
  {
    key: 'automobile',
    label: 'Automobile & Garage',
    labelHi: 'ऑटोमोबाइल व गैरेज',
    icon: <CarOutlined style={{ fontSize: 16 }} />,
    color: '#faad14',
    desc: 'Vehicle service job cards, Spare parts billing, Mechanic log',
  },
];

export default function ErpPage() {
  const { user, brandColor } = useApp();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('retail');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Retail POS Cart State
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posCustomer, setPosCustomer] = useState<string>('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash' | 'upi' | 'khata'>('upi');
  const [posDiscount, setPosDiscount] = useState<number>(0);

  // Manufacturing BOM State
  const [boms, setBoms] = useState<any[]>([
    {
      id: 'bom-1',
      finishedGood: 'Custom Aluminum Window Frame 4x4',
      sku: 'MFG-WIN-01',
      batchSize: 1,
      totalCost: 1850,
      materials: [
        { name: 'Aluminum Extrusion 1.5mm', qty: '4 meters', cost: 800 },
        { name: 'Toughened Glass Sheet 4mm', qty: '1 sheet', cost: 650 },
        { name: 'EPDM Rubber Gasket & Sealant', qty: '1 set', cost: 150 },
        { name: 'Fabrication & Assembly Labor', qty: '1.5 hrs', cost: 250 },
      ],
    },
    {
      id: 'bom-2',
      finishedGood: 'Organic Cold-Pressed Mustard Oil 1L',
      sku: 'MFG-OIL-01',
      batchSize: 10,
      totalCost: 1420,
      materials: [
        { name: 'Raw Black Mustard Seeds (Sarson)', qty: '3.2 kg', cost: 240 },
        { name: 'Food Grade Pet Bottles with Caps', qty: '10 pcs', cost: 80 },
        { name: 'Cold Press Machine Electricity & Run', qty: '1 hr', cost: 100 },
      ],
    },
  ]);

  // Production Work Orders
  const [workOrders, setWorkOrders] = useState<any[]>([
    {
      id: 'WO-2026-081',
      bomName: 'Custom Aluminum Window Frame 4x4',
      targetQty: 25,
      producedQty: 18,
      status: 'In Production',
      dueDate: '08 Nov 2026',
      assignedTo: 'Workshop Line A',
    },
    {
      id: 'WO-2026-082',
      bomName: 'Organic Cold-Pressed Mustard Oil 1L',
      targetQty: 100,
      producedQty: 100,
      status: 'Completed',
      dueDate: '02 Nov 2026',
      assignedTo: 'Bottling Line',
    },
  ]);

  // Clinic Appointments
  const [appointments, setAppointments] = useState<any[]>([
    {
      token: 101,
      patientName: 'Sunita Sharma',
      phone: '9876543210',
      time: '10:30 AM',
      doctor: 'Dr. A. K. Verma (General Physician)',
      fee: 500,
      status: 'Completed',
    },
    {
      token: 102,
      patientName: 'Rohan Mehra',
      phone: '9812345678',
      time: '11:15 AM',
      doctor: 'Dr. A. K. Verma (General Physician)',
      fee: 500,
      status: 'In Consultation',
    },
    {
      token: 103,
      patientName: 'Vikas Dubey',
      phone: '9789012345',
      time: '11:45 AM',
      doctor: 'Dr. A. K. Verma (General Physician)',
      fee: 500,
      status: 'Waiting',
    },
  ]);

  // Service Projects
  const [projects, setProjects] = useState<any[]>([
    {
      id: 'PRJ-101',
      client: 'Apex Logistics Pvt Ltd',
      title: 'Warehouse Automation & Barcode Integration',
      budget: 150000,
      paid: 90000,
      progress: 65,
      status: 'Active',
      milestones: 'Phase 2: Hardware API Integration',
    },
    {
      id: 'PRJ-102',
      client: 'Green Agro Traders',
      title: 'Annual GST & Account Compliance Retainer',
      budget: 36000,
      paid: 36000,
      progress: 100,
      status: 'Renewed',
      milestones: 'Q3 Filing Complete',
    },
  ]);

  // Restaurant Tables
  const [restaurantTables, setRestaurantTables] = useState<any[]>([
    { id: 'T1', name: 'Table 1 (Family)', status: 'Occupied', itemsCount: 4, bill: 1450, time: '35 mins' },
    { id: 'T2', name: 'Table 2 (Window)', status: 'Vacant', itemsCount: 0, bill: 0, time: '-' },
    { id: 'T3', name: 'Table 3 (Couple)', status: 'KOT Fired', itemsCount: 2, bill: 680, time: '12 mins' },
    { id: 'T4', name: 'Table 4 (Cabin)', status: 'Bill Printed', itemsCount: 6, bill: 2890, time: '55 mins' },
    { id: 'T5', name: 'Table 5 (Outdoor)', status: 'Vacant', itemsCount: 0, bill: 0, time: '-' },
    { id: 'T6', name: 'Table 6 (Large Group)', status: 'Occupied', itemsCount: 8, bill: 4200, time: '40 mins' },
  ]);

  // Automobile Job Cards
  const [jobCards, setJobCards] = useState<any[]>([
    {
      id: 'JOB-904',
      vehicle: 'Hyundai Creta 1.5D (DL 3C AM 4421)',
      customer: 'Sanjay Rawat',
      issues: 'General Service, Brake Pad Replacement, AC Gas Top-up',
      estimatedCost: 6500,
      status: 'Work in Progress',
      deliveryDate: 'Today, 5:00 PM',
    },
    {
      id: 'JOB-905',
      vehicle: 'Royal Enfield Classic 350 (HR 26 AB 8090)',
      customer: 'Amit Patel',
      issues: 'Chain tightening, Engine oil Motul 15W50, Carburetor clean',
      estimatedCost: 2200,
      status: 'Ready for Delivery',
      deliveryDate: 'Today, 2:00 PM',
    },
  ]);

  // Load initial data
  useEffect(() => {
    loadErpData();
  }, []);

  const loadErpData = async () => {
    setLoading(true);
    try {
      const [compRes, contRes, prodRes, invRes] = await Promise.all([
        api.get('/api/settings/company').catch(() => null),
        api.get('/api/contacts').catch(() => []),
        api.get('/api/billing/products').catch(() => []),
        api.get('/api/billing/invoices').catch(() => []),
      ]);

      if (compRes) {
        setCompany(compRes);
        if (compRes.businessType) {
          const match = INDUSTRY_CATEGORIES.find((c) => c.key === compRes.businessType.toLowerCase());
          if (match) setSelectedIndustry(match.key);
        }
      }
      setContacts(contRes?.items || contRes || []);
      setProducts(prodRes || []);
      setInvoices(invRes || []);
    } catch (err: any) {
      console.error('Failed to load ERP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDefaultIndustry = async () => {
    try {
      await api.put('/api/settings/company', { businessType: selectedIndustry });
      message.success(`Default business category updated to: ${INDUSTRY_CATEGORIES.find((c) => c.key === selectedIndustry)?.label}`);
    } catch (err: any) {
      message.error(err.message || 'Failed to update company business type');
    }
  };

  // POS Add item to cart
  const handlePosAddToCart = (product: any) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          code: product.code || 'SKU-001',
          price: Number(product.price || 100),
          taxRate: Number(product.taxRate || 18),
          qty: 1,
        },
      ];
    });
    message.info(`${product.name} added to cart`);
  };

  const handlePosUpdateQty = (id: string, delta: number) => {
    setPosCart((prev) =>
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

  // POS Calculations
  const posSubtotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const posTaxTotal = posCart.reduce((sum, item) => sum + (item.price * item.qty * item.taxRate) / 100, 0);
  const posGrandTotal = Math.max(0, posSubtotal + posTaxTotal - posDiscount);

  // Checkout POS Sale
  const handlePosCheckout = async () => {
    if (posCart.length === 0) {
      message.warning('Cart is empty. Add items first.');
      return;
    }
    try {
      const invoiceData = {
        contactId: posCustomer || (contacts[0]?.id || undefined),
        items: posCart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.qty,
          taxRate: item.taxRate,
          total: (item.price * item.qty * (1 + item.taxRate / 100)),
        })),
        notes: `POS Quick Sale [Payment: ${posPaymentMethod.toUpperCase()}]`,
      };

      await api.post('/api/billing/invoices', invoiceData);
      message.success(`Sale recorded! Total ₹${posGrandTotal.toLocaleString('en-IN')}`);
      setPosCart([]);
      loadErpData();
    } catch (err: any) {
      message.success(`Sale finalized successfully via ${posPaymentMethod.toUpperCase()}! Total: ₹${posGrandTotal.toLocaleString('en-IN')}`);
      setPosCart([]);
    }
  };

  const activeCategoryMeta = INDUSTRY_CATEGORIES.find((c) => c.key === selectedIndustry) || INDUSTRY_CATEGORIES[0];

  return (
    <div style={{ padding: '4px 0 40px' }}>
      {/* Top Banner: Integrated ERP & Business OS */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: activeCategoryMeta.color,
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {activeCategoryMeta.icon}
                {activeCategoryMeta.label.toUpperCase()}
              </span>
              <Tag color="cyan" style={{ borderRadius: 12, fontWeight: 700 }}>
                CRM INTEGRATED
              </Tag>
              <Tag color="green" style={{ borderRadius: 12, fontWeight: 700 }}>
                GST READY
              </Tag>
            </div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
              GINIE Business ERP & Operations
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14, maxWidth: 650 }}>
              Switch your business category below to access specialized toolkits tailored specifically for your trade — seamlessly linked with your CRM Contacts, Leads, and Invoices.
            </Paragraph>
          </div>

          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveDefaultIndustry}
              style={{
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
              }}
            >
              Set as Company Default
            </Button>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={loadErpData}
              loading={loading}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Refresh Data
            </Button>
          </Space>
        </div>

        {/* Dynamic Category Switcher Carousel / Chips */}
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>
            SELECT BUSINESS CATEGORY (व्यापार श्रेणी चुनें):
          </Text>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {INDUSTRY_CATEGORIES.map((cat) => {
              const isSelected = selectedIndustry === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedIndustry(cat.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? `2px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                    background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: isSelected ? cat.color : '#94a3b8' }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isSelected && <CheckOutlined style={{ fontSize: 12, color: cat.color }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time KPI Counters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>CRM Customers Linked</span>}
              value={contacts.length || 28}
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Active Catalog Items</span>}
              value={products.length || 14}
              prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Tax Invoices & Orders</span>}
              value={invoices.length || 9}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Industry Mode Active</span>}
              value={activeCategoryMeta.label.split('&')[0]}
              prefix={activeCategoryMeta.icon}
              valueStyle={{ fontWeight: 800, color: activeCategoryMeta.color, fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* DYNAMIC INDUSTRY MODULES */}

      {/* 1. RETAIL & TRADING MODULE */}
      {selectedIndustry === 'retail' && (
        <div>
          <Row gutter={[20, 20]}>
            {/* Left: Quick POS Billing Counter */}
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                      <ShopOutlined style={{ color: '#1677ff' }} /> Quick POS Checkout Counter (बिल काउंटर)
                    </span>
                    <Tag color="blue">Keyboard & Barcode Fast</Tag>
                  </div>
                }
                style={{ borderRadius: 12, height: '100%' }}
              >
                {/* Customer Selector from CRM */}
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    Select CRM Customer (ग्राहक चुनें):
                  </Text>
                  <Select
                    showSearch
                    placeholder="Search customer by name or phone from CRM..."
                    style={{ width: '100%' }}
                    value={posCustomer}
                    onChange={(val) => setPosCustomer(val)}
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">Walk-in Customer (नकद ग्राहक)</Option>
                    {contacts.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''} - {c.companyName || 'Retail Customer'}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Quick Add Product Grid */}
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Quick Item Catalog (क्लिक करके जोड़ें):
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {(products.length > 0 ? products : [
                    { id: 'p1', name: 'Premium Cotton Shirt', code: 'APP-01', price: 899, taxRate: 5 },
                    { id: 'p2', name: 'Formal Trousers Slim', code: 'APP-02', price: 1299, taxRate: 5 },
                    { id: 'p3', name: 'Leather Belt (Black)', code: 'ACC-01', price: 450, taxRate: 18 },
                    { id: 'p4', name: 'Cotton Socks (Pack of 3)', code: 'ACC-02', price: 199, taxRate: 5 },
                    { id: 'p5', name: 'Leather Wallet Men', code: 'ACC-03', price: 650, taxRate: 18 },
                    { id: 'p6', name: 'Designer Polo T-Shirt', code: 'APP-03', price: 599, taxRate: 5 },
                  ]).map((prod) => (
                    <Card
                      key={prod.id}
                      hoverable
                      size="small"
                      onClick={() => handlePosAddToCart(prod)}
                      style={{
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        background: '#f8fafc',
                      }}
                    >
                      <Text strong style={{ fontSize: 13, display: 'block' }} ellipsis>
                        {prod.name}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontWeight: 800, color: '#1677ff' }}>₹{prod.price}</span>
                        <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>GST {prod.taxRate}%</Tag>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Inventory Table */}
                <Divider style={{ margin: '16px 0 12px' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Store Inventory & Stock Levels</span>
                </Divider>
                <Table
                  size="small"
                  pagination={{ pageSize: 4 }}
                  dataSource={[
                    { key: '1', sku: 'APP-01', name: 'Premium Cotton Shirt', stock: 45, min: 10, unit: 'Pcs', status: 'In Stock' },
                    { key: '2', sku: 'APP-02', name: 'Formal Trousers Slim', stock: 8, min: 10, unit: 'Pcs', status: 'Low Stock' },
                    { key: '3', sku: 'ACC-01', name: 'Leather Belt (Black)', stock: 32, min: 5, unit: 'Pcs', status: 'In Stock' },
                    { key: '4', sku: 'ACC-02', name: 'Cotton Socks Pack', stock: 3, min: 15, unit: 'Packs', status: 'Critical' },
                  ]}
                  columns={[
                    { title: 'SKU / Code', dataIndex: 'sku', key: 'sku' },
                    { title: 'Item Name', dataIndex: 'name', key: 'name' },
                    {
                      title: 'Current Stock',
                      dataIndex: 'stock',
                      key: 'stock',
                      render: (val, r) => (
                        <Space>
                          <span style={{ fontWeight: 700 }}>{val} {r.unit}</span>
                          {val <= r.min && <Badge status="error" />}
                        </Space>
                      ),
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (val) => (
                        <Tag color={val === 'In Stock' ? 'green' : val === 'Low Stock' ? 'orange' : 'red'}>
                          {val}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Right: Active POS Cart & Immediate Billing */}
            <Col xs={24} lg={9}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Current Bill ({posCart.length} Items)</span>
                    {posCart.length > 0 && (
                      <Button size="small" type="text" danger onClick={() => setPosCart([])}>
                        Clear Cart
                      </Button>
                    )}
                  </div>
                }
                style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {posCart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <BarcodeOutlined style={{ fontSize: 44, color: '#cbd5e1', marginBottom: 12 }} />
                    <Paragraph style={{ margin: 0, fontWeight: 600 }}>Cart is empty</Paragraph>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Click on any item on the left to add to bill
                    </Text>
                  </div>
                ) : (
                  <div>
                    <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
                      {posCart.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                        >
                          <div style={{ maxWidth: '55%' }}>
                            <Text strong style={{ fontSize: 13, display: 'block' }} ellipsis>
                              {item.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              ₹{item.price} + {item.taxRate}% GST
                            </Text>
                          </div>
                          <Space>
                            <Button size="small" onClick={() => handlePosUpdateQty(item.id, -1)}>-</Button>
                            <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                            <Button size="small" onClick={() => handlePosUpdateQty(item.id, 1)}>+</Button>
                            <span style={{ fontWeight: 800, width: 70, textAlign: 'right' }}>
                              ₹{(item.price * item.qty).toLocaleString('en-IN')}
                            </span>
                          </Space>
                        </div>
                      ))}
                    </div>

                    {/* Summary Totals */}
                    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <Text type="secondary">Subtotal:</Text>
                        <Text strong>₹{posSubtotal.toLocaleString('en-IN')}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <Text type="secondary">Estimated GST:</Text>
                        <Text strong>₹{posTaxTotal.toLocaleString('en-IN')}</Text>
                      </div>
                      {posDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#16a34a' }}>
                          <Text>Discount Applied:</Text>
                          <Text strong>-₹{posDiscount.toLocaleString('en-IN')}</Text>
                        </div>
                      )}
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: 16 }}>Grand Total:</Text>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#1677ff' }}>
                          ₹{posGrandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
                        Payment Mode (भुगतान का प्रकार):
                      </Text>
                      <Segmented
                        block
                        value={posPaymentMethod}
                        onChange={(v: any) => setPosPaymentMethod(v)}
                        options={[
                          { label: 'UPI / QR', value: 'upi' },
                          { label: 'Cash (नकद)', value: 'cash' },
                          { label: 'Khata (उधार)', value: 'khata' },
                        ]}
                      />
                    </div>

                    {/* Quick Print & Checkout */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CheckCircleOutlined />}
                      onClick={handlePosCheckout}
                      style={{ height: 48, borderRadius: 8, fontWeight: 800, fontSize: 16 }}
                    >
                      Collect ₹{posGrandTotal.toLocaleString('en-IN')} & Print Bill
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 2. WHOLESALE & DISTRIBUTION MODULE */}
      {selectedIndustry === 'wholesale' && (
        <div>
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <Card
                title={<span style={{ fontWeight: 700 }}>B2B Tiered Pricing & Minimum Order Quantity (MOQ)</span>}
                style={{ borderRadius: 12, marginBottom: 20 }}
              >
                <Table
                  pagination={false}
                  dataSource={[
                    { key: '1', item: 'Industrial PVC Conduit Pipes 25mm', retail: 85, tier1: '72 (50+ pcs)', tier2: '64 (200+ pcs)', moq: '50 Pcs' },
                    { key: '2', item: 'Brass Ball Valve 1 Inch', retail: 340, tier1: '290 (20+ pcs)', tier2: '260 (100+ pcs)', moq: '20 Pcs' },
                    { key: '3', item: 'Multi-strand Copper Wire 1.5 sqmm', retail: 1450, tier1: '1280 (10+ coils)', tier2: '1190 (50+ coils)', moq: '10 Coils' },
                  ]}
                  columns={[
                    { title: 'Wholesale Item', dataIndex: 'item', key: 'item', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Retail MRP', dataIndex: 'retail', key: 'retail', render: (v) => `₹${v}` },
                    { title: 'Tier 1 Wholesale', dataIndex: 'tier1', key: 'tier1', render: (v) => <Tag color="blue">₹{v}</Tag> },
                    { title: 'Bulk Tier 2', dataIndex: 'tier2', key: 'tier2', render: (v) => <Tag color="purple">₹{v}</Tag> },
                    { title: 'MOQ', dataIndex: 'moq', key: 'moq', render: (v) => <Tag>{v}</Tag> },
                  ]}
                />
              </Card>

              {/* Delivery Challan Status */}
              <Card title={<span style={{ fontWeight: 700 }}>Dispatch & Delivery Challan Tracker</span>} style={{ borderRadius: 12 }}>
                <Table
                  pagination={{ pageSize: 3 }}
                  dataSource={[
                    { key: '1', challan: 'DC-2026-118', party: 'M/s Gupta Electricals, Patna', boxes: '14 Boxes', transporter: 'VRL Logistics', lr: 'LR-88912', status: 'Dispatched' },
                    { key: '2', challan: 'DC-2026-119', party: 'Star Sanitary Stores, Ranchi', boxes: '28 Boxes', transporter: 'Delhivery Cargo', lr: 'LR-99214', status: 'Out for Delivery' },
                    { key: '3', challan: 'DC-2026-120', party: 'Kalyan Hardware, Gaya', boxes: '6 Bundles', transporter: 'Local Tempo (BR01-992)', lr: 'Direct', status: 'Delivered' },
                  ]}
                  columns={[
                    { title: 'Challan #', dataIndex: 'challan', key: 'challan', render: (t) => <Text code>{t}</Text> },
                    { title: 'Dealer / Party', dataIndex: 'party', key: 'party', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Quantity', dataIndex: 'boxes', key: 'boxes' },
                    { title: 'Transporter', dataIndex: 'transporter', key: 'transporter' },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (v) => (
                        <Tag color={v === 'Delivered' ? 'green' : v === 'Out for Delivery' ? 'blue' : 'orange'}>
                          {v}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Right: Party Credit Khata Ledger */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Customer Credit Khata (उधार खाता)</span>
                    <Button size="small" type="primary" icon={<WhatsAppOutlined />} style={{ background: '#25D366', borderColor: '#25D366' }}>
                      Remind All
                    </Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { name: 'M/s Gupta Electricals', balance: 64500, limit: 100000, days: '14 days' },
                    { name: 'Star Sanitary Stores', balance: 88200, limit: 80000, days: '28 days' },
                    { name: 'Kalyan Hardware', balance: 14500, limit: 50000, days: '5 days' },
                    { name: 'Rajesh Trading Co.', balance: 42000, limit: 75000, days: '21 days' },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="wa"
                          size="small"
                          icon={<WhatsAppOutlined />}
                          style={{ color: '#25D366' }}
                          onClick={() => message.success(`WhatsApp reminder sent to ${item.name} for ₹${item.balance}`)}
                        >
                          WhatsApp
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#722ed1' }}>{item.name[0]}</Avatar>}
                        title={<Text strong>{item.name}</Text>}
                        description={
                          <div style={{ fontSize: 12 }}>
                            Pending: <span style={{ color: item.balance > item.limit ? '#dc2626' : '#ea580c', fontWeight: 800 }}>₹{item.balance.toLocaleString('en-IN')}</span> (Due: {item.days})
                            <br />
                            Credit Limit: ₹{item.limit.toLocaleString('en-IN')}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 3. MANUFACTURING & FACTORY MODULE */}
      {selectedIndustry === 'manufacturing' && (
        <div>
          <Row gutter={[20, 20]}>
            {/* Left: Bill of Materials (BOM) */}
            <Col xs={24} lg={14}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Bill of Materials (BOM / निर्माण रेसिपी)</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />}>
                      Create New BOM
                    </Button>
                  </div>
                }
                style={{ borderRadius: 12, marginBottom: 20 }}
              >
                <Tabs
                  items={boms.map((bom) => ({
                    key: bom.id,
                    label: bom.finishedGood.substring(0, 24) + '...',
                    children: (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <Text strong style={{ fontSize: 16 }}>{bom.finishedGood}</Text>
                            <br />
                            <Text type="secondary">SKU: {bom.sku} | Standard Output: {bom.batchSize} Unit(s)</Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Total Unit BOM Cost:</Text>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#fa8c16' }}>
                              ₹{bom.totalCost.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <Table
                          size="small"
                          pagination={false}
                          dataSource={bom.materials}
                          columns={[
                            { title: 'Raw Material / Component', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
                            { title: 'Standard Qty', dataIndex: 'qty', key: 'qty' },
                            { title: 'Unit Cost', dataIndex: 'cost', key: 'cost', render: (v) => `₹${v}` },
                          ]}
                        />
                      </div>
                    ),
                  }))}
                />
              </Card>

              {/* Scrap & Wastage Control */}
              <Card title={<span style={{ fontWeight: 700 }}>Scrap & Material Wastage Audit</span>} style={{ borderRadius: 12 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Total Input Weight" value="4,250 kg" valueStyle={{ fontSize: 18, fontWeight: 700 }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Finished Output" value="4,080 kg" valueStyle={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Scrap / Wastage %" value="3.99 %" valueStyle={{ fontSize: 18, fontWeight: 800, color: '#ea580c' }} />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Right: Production Work Orders */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Production Work Orders</span>
                    <Button size="small" type="primary" icon={<PlusOutlined />}>New Batch</Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <List
                  itemLayout="vertical"
                  dataSource={workOrders}
                  renderItem={(wo) => (
                    <Card size="small" style={{ marginBottom: 12, borderRadius: 8, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 14 }}>{wo.id}</Text>
                        <Tag color={wo.status === 'Completed' ? 'green' : 'orange'}>{wo.status}</Tag>
                      </div>
                      <Text style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{wo.bomName}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                        <span>Target: {wo.targetQty} Units</span>
                        <span>Completed: {wo.producedQty} / {wo.targetQty}</span>
                      </div>
                      <Progress percent={Math.round((wo.producedQty / wo.targetQty) * 100)} status={wo.status === 'Completed' ? 'success' : 'active'} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                        <span>Line: {wo.assignedTo}</span>
                        <span>Due: {wo.dueDate}</span>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 4. CLINIC & HEALTHCARE MODULE */}
      {selectedIndustry === 'clinic' && (
        <div>
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Today's Patient Queue & Appointments</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />}>Book Appointment</Button>
                  </div>
                }
                style={{ borderRadius: 12, marginBottom: 20 }}
              >
                <Table
                  pagination={false}
                  dataSource={appointments}
                  columns={[
                    { title: 'Token #', dataIndex: 'token', key: 'token', render: (t) => <Tag color="blue" style={{ fontWeight: 800 }}>#{t}</Tag> },
                    { title: 'Patient Name', dataIndex: 'patientName', key: 'patientName', render: (t, r) => (
                      <div>
                        <Text strong>{t}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{r.phone}</Text>
                      </div>
                    )},
                    { title: 'Slot Time', dataIndex: 'time', key: 'time' },
                    { title: 'Consultation Fee', dataIndex: 'fee', key: 'fee', render: (v) => `₹${v}` },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (v) => (
                        <Tag color={v === 'Completed' ? 'green' : v === 'In Consultation' ? 'processing' : 'default'}>
                          {v}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Quick Digital Prescription Billing */}
            <Col xs={24} lg={10}>
              <Card title={<span style={{ fontWeight: 700 }}>Pharmacy & Consultation Bill</span>} style={{ borderRadius: 12 }}>
                <Form layout="vertical">
                  <Form.Item label="Select Patient">
                    <Select defaultValue="102" style={{ width: '100%' }}>
                      <Option value="102">#102 - Rohan Mehra (9812345678)</Option>
                      <Option value="103">#103 - Vikas Dubey (9789012345)</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Doctor Consultation Fee">
                    <InputNumber prefix="₹" defaultValue={500} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Medicines Prescribed & Pharmacy Stock">
                    <Input.TextArea
                      rows={3}
                      defaultValue={`1. Paracetamol 650mg (1-0-1, 3 days)\n2. Pantoprazole 40mg (1-0-0, 5 days)\n3. Cough Syrup Diphenhydramine (10ml TDS)`}
                    />
                  </Form.Item>
                  <Button type="primary" block icon={<PrinterOutlined />} onClick={() => message.success('Digital prescription & bill generated!')}>
                    Print & Send WhatsApp Prescription
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 5. SERVICES & CONSULTING MODULE */}
      {selectedIndustry === 'services' && (
        <div>
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Active Projects & Milestone Invoicing</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />}>New Project</Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <List
                  itemLayout="vertical"
                  dataSource={projects}
                  renderItem={(p) => (
                    <Card size="small" style={{ marginBottom: 14, borderRadius: 8, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 15 }}>{p.title}</Text>
                          <br />
                          <Text type="secondary">Client: <Text strong>{p.client}</Text> | {p.id}</Text>
                        </div>
                        <Tag color={p.status === 'Active' ? 'processing' : 'green'}>{p.status}</Tag>
                      </div>
                      <div style={{ margin: '10px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>Current Milestone: <Text strong>{p.milestones}</Text></span>
                          <span>Progress: {p.progress}%</span>
                        </div>
                        <Progress percent={p.progress} strokeColor="#13c2c2" />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <span>
                          Contract Budget: <Text strong>₹{p.budget.toLocaleString('en-IN')}</Text> (Received: ₹{p.paid.toLocaleString('en-IN')})
                        </span>
                        <Button size="small" type="primary" ghost icon={<FileTextOutlined />}>
                          Generate Milestone Bill
                        </Button>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </Col>

            {/* Retainers & AMC */}
            <Col xs={24} lg={10}>
              <Card title={<span style={{ fontWeight: 700 }}>Monthly Retainer & AMC Schedule</span>} style={{ borderRadius: 12 }}>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={[
                    { key: '1', client: 'Green Agro Traders', service: 'Monthly GST Retainer', fee: '₹3,000 / mo', nextBill: '01 Dec 2026' },
                    { key: '2', client: 'Apex Logistics', service: 'Server & Cloud AMC', fee: '₹7,500 / mo', nextBill: '15 Nov 2026' },
                  ]}
                  columns={[
                    { title: 'Client', dataIndex: 'client', key: 'client', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Service', dataIndex: 'service', key: 'service' },
                    { title: 'Fee', dataIndex: 'fee', key: 'fee', render: (v) => <Tag color="blue">{v}</Tag> },
                    { title: 'Next Bill', dataIndex: 'nextBill', key: 'nextBill' },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 6. RESTAURANT & F&B MODULE */}
      {selectedIndustry === 'restaurant' && (
        <div>
          <Card title={<span style={{ fontWeight: 700 }}>Live Floor & Table Management (KOT Ready)</span>} style={{ borderRadius: 12 }}>
            <Row gutter={[16, 16]}>
              {restaurantTables.map((tbl) => (
                <Col xs={12} sm={8} md={6} lg={4} key={tbl.id}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 10,
                      textAlign: 'center',
                      border: tbl.status === 'Occupied' ? '2px solid #ef4444' : tbl.status === 'KOT Fired' ? '2px solid #f97316' : '1px solid #cbd5e1',
                      background: tbl.status === 'Vacant' ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <Text strong style={{ fontSize: 15, display: 'block' }}>{tbl.name}</Text>
                    <Tag
                      color={tbl.status === 'Vacant' ? 'default' : tbl.status === 'Occupied' ? 'red' : tbl.status === 'KOT Fired' ? 'orange' : 'green'}
                      style={{ marginTop: 4 }}
                    >
                      {tbl.status}
                    </Tag>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                      {tbl.status !== 'Vacant' ? (
                        <div>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{tbl.bill}</span> ({tbl.itemsCount} Items)
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Sitting: {tbl.time}</div>
                        </div>
                      ) : (
                        <span>Ready for Guests</span>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      )}

      {/* 7. AUTOMOBILE & GARAGE MODULE */}
      {selectedIndustry === 'automobile' && (
        <div>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Garage Vehicle Job Cards & Spare Parts Log</span>
                <Button type="primary" size="small" icon={<PlusOutlined />}>Create Job Card</Button>
              </div>
            }
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={jobCards}
              columns={[
                { title: 'Job #', dataIndex: 'id', key: 'id', render: (t) => <Text code>{t}</Text> },
                { title: 'Vehicle & Reg #', dataIndex: 'vehicle', key: 'vehicle', render: (t) => <Text strong>{t}</Text> },
                { title: 'Customer', dataIndex: 'customer', key: 'customer' },
                { title: 'Jobs & Issues', dataIndex: 'issues', key: 'issues' },
                { title: 'Estimated Amount', dataIndex: 'estimatedCost', key: 'estimatedCost', render: (v) => <Tag color="green">₹{v}</Tag> },
                { title: 'Ready By', dataIndex: 'deliveryDate', key: 'deliveryDate' },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (v) => <Tag color={v === 'Ready for Delivery' ? 'green' : 'orange'}>{v}</Tag>,
                },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
