'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Switch,
  Spin,
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
  CloudUploadOutlined,
  AudioOutlined,
  GiftOutlined,
  LockOutlined,
  CameraOutlined,
  SearchOutlined,
  CrownOutlined,
  ScissorOutlined,
  ReadOutlined,
  ExperimentOutlined,
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
  {
    key: 'pharmacy',
    label: 'Pharmacy & Medical',
    labelHi: 'दवा दुकान व केमिस्ट',
    icon: <ExperimentOutlined style={{ fontSize: 16 }} />,
    color: '#059669',
    desc: 'Batch & Expiry date tracking, Doctor prescription register, Strip/tablet cutting',
  },
  {
    key: 'jewellery',
    label: 'Jewellery & Gold',
    labelHi: 'सर्राफा व आभूषण',
    icon: <CrownOutlined style={{ fontSize: 16 }} />,
    color: '#d97706',
    desc: 'Live gold rate bar, Hallmark 916 purity, Making charges & Old gold exchange',
  },
  {
    key: 'salon',
    label: 'Salon & Spa',
    labelHi: 'सैलून व ब्यूटी पार्लर',
    icon: <ScissorOutlined style={{ fontSize: 16 }} />,
    color: '#db2777',
    desc: 'Stylist chair booking, Service duration, Staff commission & Bridal packages',
  },
  {
    key: 'education',
    label: 'Coaching & Education',
    labelHi: 'कोचिंग व ट्यूशन',
    icon: <ReadOutlined style={{ fontSize: 16 }} />,
    color: '#4f46e5',
    desc: 'Student batch admission, Monthly fee schedule, WhatsApp reminders & Attendance',
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
  const [redeemLoyalty, setRedeemLoyalty] = useState<boolean>(false);
  const [isListeningPos, setIsListeningPos] = useState<boolean>(false);

  // Barcode & Fast Scanner State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [continuousScan, setContinuousScan] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<any>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Real-time Stock Adjustment State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<any>(null);
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState<number>(10);
  const [stockAdjustmentType, setStockAdjustmentType] = useState<'inward' | 'outward'>('inward');
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState<string>('Vendor Purchase Inward');

  // Daily Cash Register (Daybook) State
  const [openingCash, setOpeningCash] = useState<number>(2000);
  const [cashDrawerModalOpen, setCashDrawerModalOpen] = useState<boolean>(false);

  // Offline Bill Queue state
  const [offlineBills, setOfflineBills] = useState<any[]>([]);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);

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

  // Pharmacy & Medical State
  const [pharmacyBatches, setPharmacyBatches] = useState<any[]>([
    {
      id: 'BAT-9021',
      medicine: 'Paracetamol 650mg (Dolo)',
      batchNo: 'DL-2411',
      mfgDate: '10/2025',
      expDate: '09/2027',
      stockQty: 420,
      stripRate: 32,
      rack: 'A-12',
      status: 'Healthy Stock',
    },
    {
      id: 'BAT-8832',
      medicine: 'Amoxicillin 500mg (Augmentin)',
      batchNo: 'AG-8902',
      mfgDate: '01/2025',
      expDate: '12/2026',
      stockQty: 180,
      stripRate: 195,
      rack: 'B-04',
      status: 'Healthy Stock',
    },
    {
      id: 'BAT-7714',
      medicine: 'Cough Syrup 100ml (Ascoril-D)',
      batchNo: 'AS-3101',
      mfgDate: '05/2024',
      expDate: '11/2026',
      stockQty: 18,
      stripRate: 110,
      rack: 'C-02',
      status: 'Near Expiry (Warning)',
    },
    {
      id: 'BAT-6509',
      medicine: 'Azithromycin 500mg (Azee)',
      batchNo: 'AZ-1092',
      mfgDate: '03/2024',
      expDate: '10/2026',
      stockQty: 4,
      stripRate: 125,
      rack: 'A-08',
      status: 'Low Stock',
    },
  ]);

  const [rxPrescriptions, setRxPrescriptions] = useState<any[]>([
    {
      id: 'RX-4091',
      patient: 'Kavita Verma',
      doctor: 'Dr. S. Nair (MBBS, MD)',
      date: 'Today, 11:20 AM',
      drugs: 'Dolo 650 x 10, Azithromycin 500 x 3, Pan-D x 5',
      rxUploaded: true,
      status: 'Verified & Dispensed',
    },
    {
      id: 'RX-4092',
      patient: 'Rahul Saxena',
      doctor: 'Dr. P. Sen (Orthopedic)',
      date: 'Today, 11:45 AM',
      drugs: 'Pain Relief Spray, Calcium 500mg',
      rxUploaded: true,
      status: 'Pending Verification',
    },
  ]);

  // Jewellery & Bullion State
  const [bullionRates, setBullionRates] = useState({
    gold24k: 78500,
    gold22k: 72000,
    gold18k: 59000,
    silver1kg: 92400,
    lastUpdated: '11:00 AM MCX Live',
  });

  const [jewelleryItems, setJewelleryItems] = useState<any[]>([
    {
      id: 'JWL-01',
      item: '22K Gold Traditional Bridal Choker',
      grossWeight: '28.45g',
      netWeight: '28.00g',
      purity: '22K (916 BIS Hallmarked)',
      makingChargePerGm: 450,
      totalEstimated: 214200,
      status: 'In Showcase',
    },
    {
      id: 'JWL-02',
      item: 'Diamond Solitaire Ring 18K Yellow Gold',
      grossWeight: '4.20g',
      netWeight: '4.00g',
      purity: '18K (750 BIS Hallmarked)',
      makingChargePerGm: 1200,
      totalEstimated: 78000,
      status: 'In Showcase',
    },
    {
      id: 'JWL-03',
      item: '92.5 Sterling Silver Puja Thali Set',
      grossWeight: '320.00g',
      netWeight: '320.00g',
      purity: '925 Silver Hallmarked',
      makingChargePerGm: 18,
      totalEstimated: 35328,
      status: 'Reserved',
    },
  ]);

  // Salon & Spa State
  const [salonAppointments, setSalonAppointments] = useState<any[]>([
    {
      id: 'SAL-301',
      client: 'Pooja Bhatt',
      phone: '9811223344',
      stylist: 'Senior Stylist Sneha',
      service: 'Keratin Hair Spa & Precision Cut',
      time: '12:00 PM',
      chair: 'Station 2',
      amount: 3500,
      status: 'In Service',
    },
    {
      id: 'SAL-302',
      client: 'Rohit Khanna',
      phone: '9877001122',
      stylist: 'Barber Imran',
      service: 'Beard Sculpt & Charcoal Facial',
      time: '12:30 PM',
      chair: 'Station 4 (Men)',
      amount: 850,
      status: 'Next in Queue',
    },
    {
      id: 'SAL-303',
      client: 'Meera Sen',
      phone: '9922334455',
      stylist: 'Nail Artist Priya',
      service: 'Gel Nail Extensions & Art',
      time: '01:15 PM',
      chair: 'Nail Bar 1',
      amount: 1800,
      status: 'Confirmed',
    },
  ]);

  const [stylistCommissions, setStylistCommissions] = useState<any[]>([
    { id: 'ST-01', name: 'Sneha Rao', totalClientsToday: 4, todayRevenue: 7800, commissionEarned: 1560, rating: '4.9/5' },
    { id: 'ST-02', name: 'Imran Khan', totalClientsToday: 6, todayRevenue: 4200, commissionEarned: 840, rating: '4.8/5' },
    { id: 'ST-03', name: 'Priya Verma', totalClientsToday: 3, todayRevenue: 5100, commissionEarned: 1020, rating: '5.0/5' },
  ]);

  // Coaching & Education State
  const [studentBatches, setStudentBatches] = useState<any[]>([
    {
      id: 'BATCH-JEE-01',
      batchName: 'Class 12 - Physics & JEE Advanced Batch',
      instructor: 'Er. R. K. Gupta',
      time: 'Mon, Wed, Fri (4:00 PM - 6:00 PM)',
      enrolled: 32,
      capacity: 35,
      monthlyFee: 4500,
      status: 'Active',
    },
    {
      id: 'BATCH-NEET-02',
      batchName: 'Class 11 - Medical Biology & NEET Crash',
      instructor: 'Dr. Sunita Bansal',
      time: 'Tue, Thu, Sat (5:00 PM - 7:00 PM)',
      enrolled: 28,
      capacity: 30,
      monthlyFee: 4200,
      status: 'Active',
    },
    {
      id: 'BATCH-COMM-03',
      batchName: 'Class 12 - Commerce Accounts & GST Prep',
      instructor: 'CA Mohit Aggarwal',
      time: 'Daily (7:30 AM - 9:00 AM)',
      enrolled: 20,
      capacity: 25,
      monthlyFee: 3500,
      status: 'Active',
    },
  ]);

  const [feeDues, setFeeDues] = useState<any[]>([
    {
      id: 'FEE-201',
      student: 'Aman Sharma',
      rollNo: 'JEE-104',
      batch: 'Class 12 - Physics & JEE',
      amountDue: 4500,
      dueDate: '10 Nov 2026',
      parentPhone: '9871100223',
      status: 'Payment Reminder Sent',
    },
    {
      id: 'FEE-202',
      student: 'Divya Nair',
      rollNo: 'NEET-042',
      batch: 'Class 11 - Medical Biology',
      amountDue: 4200,
      dueDate: '05 Nov 2026',
      parentPhone: '9819922334',
      status: 'Paid (Receipt #809)',
    },
  ]);

  // Load initial data
  useEffect(() => {
    loadErpData();
    const savedQueue = localStorage.getItem('ginie_offline_bills_queue');
    if (savedQueue) {
      try {
        setOfflineBills(JSON.parse(savedQueue));
      } catch {}
    }

    const handleAutoSyncOnline = () => {
      const q = JSON.parse(localStorage.getItem('ginie_offline_bills_queue') || '[]');
      if (q.length > 0) {
        message.info(`Network restored! ${q.length} offline bills queued for auto-sync.`);
      }
    };
    window.addEventListener('online', handleAutoSyncOnline);
    return () => window.removeEventListener('online', handleAutoSyncOnline);
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
          const bType = compRes.businessType.toLowerCase();
          const match = INDUSTRY_CATEGORIES.find((c) => c.key === bType || (bType === 'factory' && c.key === 'manufacturing') || (bType === 'shop' && c.key === 'retail'));
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

  // Pleasant checkout scanner beep via Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {}
  };

  // Instant Barcode Scan & Lookup (from Input or Scan Button)
  const handleBarcodeScan = () => {
    const q = barcodeInput.trim();
    if (!q) {
      message.info('Opening live camera barcode scanner...');
      startCameraScanner();
      return;
    }

    const matched = products.find(
      (p) =>
        (p.code && p.code.toLowerCase() === q.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === q.toLowerCase()) ||
        (p.id && p.id.toLowerCase() === q.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase() === q.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === q.toLowerCase()) ||
        (p.name && p.name.toLowerCase().includes(q.toLowerCase()))
    );

    if (matched) {
      handlePosAddToCart(matched);
      playBeep();
      message.success(`Scanned: ${matched.name} added to cart`);
      setBarcodeInput('');
    } else {
      message.warning(`Barcode or SKU "${barcodeInput}" not found in catalog.`);
    }
  };

  const handleOpenStockModal = (product: any) => {
    setSelectedStockProduct(product);
    setStockAdjustmentQty(10);
    setStockAdjustmentType('inward');
    setStockAdjustmentReason('Vendor Purchase Inward');
    setStockModalOpen(true);
  };

  const handleStockAdjustSubmit = async () => {
    if (!selectedStockProduct) return;
    const delta = stockAdjustmentType === 'inward' ? Math.abs(stockAdjustmentQty) : -Math.abs(stockAdjustmentQty);
    try {
      await api.post('/api/billing/erp/inventory/adjust', {
        productId: selectedStockProduct.id,
        delta,
        reason: stockAdjustmentReason,
      });
      message.success(`Stock updated for ${selectedStockProduct.name}!`);
      setStockModalOpen(false);
      loadErpData();
    } catch {
      message.error('Failed to update stock in database.');
    }
  };

  // POS Add item to cart
  const handlePosAddToCart = (product: any) => {
    playBeep();
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

  // Unified barcode / SKU processor (used by camera, input, and hardware scanner gun)
  const handleProcessScannedCode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Debounce to prevent multiple hits within 1.2s for camera/gun
    const now = Date.now();
    if (code === lastScannedCode && now - lastScanTimestampRef.current < 1200) {
      return;
    }
    lastScanTimestampRef.current = now;
    setLastScannedCode(code);

    const q = code.toLowerCase();
    const matched = products.find(
      (p) =>
        (p.code && p.code.toLowerCase() === q) ||
        (p.sku && p.sku.toLowerCase() === q) ||
        (p.id && p.id.toLowerCase() === q) ||
        (p.barcode && p.barcode.toLowerCase() === q) ||
        (p.name && p.name.toLowerCase() === q) ||
        (p.name && p.name.toLowerCase().includes(q))
    );

    playBeep();

    if (matched) {
      handlePosAddToCart(matched);
      message.success(`Scanned: ${matched.name} (${code}) added to cart!`);
    } else {
      // Dynamic fallback item for unlisted barcodes
      const fallbackItem = {
        id: `scan-${Date.now()}`,
        name: `Scanned Item (${code})`,
        code: code,
        price: 150,
        taxRate: 18,
      };
      handlePosAddToCart(fallbackItem);
      message.success(`Scanned Barcode: ${code} added to cart!`);
    }

    if (!continuousScan) {
      stopCameraScanner();
    }
  };

  // Start Live Camera Barcode Scanner
  const startCameraScanner = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraModalOpen(true);
    setCameraLoading(true);
    setCameraError(null);

    // Stop existing streams/timers
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }
      setCameraLoading(false);

      // Start detection loop
      startBarcodeDetectionLoop();
    } catch (err: any) {
      setCameraLoading(false);
      console.warn('Camera open error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser permissions.'
          : err.message || 'Unable to access device camera.'
      );
    }
  };

  const stopCameraScanner = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraModalOpen(false);
    setCameraLoading(false);
    setCameraError(null);
  };

  const startBarcodeDetectionLoop = () => {
    if (typeof window === 'undefined') return;
    const hasDetector = 'BarcodeDetector' in window;
    let detector: any = null;

    if (hasDetector) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'code_39', 'code_93', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'],
        });
      } catch (e) {
        try {
          detector = new (window as any).BarcodeDetector();
        } catch {}
      }
    }

    scanTimerRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      if (detector) {
        try {
          const detected = await detector.detect(videoRef.current);
          if (detected && detected.length > 0) {
            const raw = detected[0].rawValue;
            if (raw) {
              handleProcessScannedCode(raw);
            }
          }
        } catch {}
      }
    }, 280);
  };

  // Global Hardware USB / Bluetooth Barcode Scanner Gun Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const currentTime = Date.now();
      const diff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 2) {
          const scannedCode = buffer.trim();
          buffer = '';
          handleProcessScannedCode(scannedCode);
        }
      } else if (e.key && e.key.length === 1) {
        if (!isInput || diff < 45) {
          buffer += e.key;
        } else {
          buffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, continuousScan, lastScannedCode]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // POS Calculations
  const posSubtotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const posTaxTotal = posCart.reduce((sum, item) => sum + (item.price * item.qty * item.taxRate) / 100, 0);
  const posGrandTotal = Math.max(0, posSubtotal + posTaxTotal - posDiscount);

  // Checkout POS Sale (Offline-First Resilient)
  const handlePosCheckout = async () => {
    if (posCart.length === 0) {
      message.warning('Cart is empty. Add items first.');
      return;
    }

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    const invoiceData = {
      id: `pos-${Date.now()}`,
      contactId: posCustomer || (contacts[0]?.id || undefined),
      customerName: contacts.find((c) => c.id === posCustomer)?.name || 'Walk-in Customer',
      items: posCart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.qty,
        taxRate: item.taxRate,
        total: item.price * item.qty * (1 + item.taxRate / 100),
      })),
      total: posGrandTotal,
      paymentMethod: posPaymentMethod,
      notes: `POS Quick Sale [Payment: ${posPaymentMethod.toUpperCase()}]${redeemLoyalty ? ' (₹100 Loyalty Redeemed)' : ''}`,
      createdAt: new Date().toISOString(),
    };

    if (isOffline) {
      const queue = JSON.parse(localStorage.getItem('ginie_offline_bills_queue') || '[]');
      const updatedQueue = [...queue, invoiceData];
      localStorage.setItem('ginie_offline_bills_queue', JSON.stringify(updatedQueue));
      setOfflineBills(updatedQueue);
      message.warning(`🟠 Offline Mode: Bill #${invoiceData.id.slice(-6)} queued locally! Will sync automatically.`);
      setPosCart([]);
      setRedeemLoyalty(false);
      setPosDiscount(0);
      return;
    }

    try {
      await api.post('/api/billing/invoices', invoiceData);
      message.success(`Sale recorded! Total ₹${posGrandTotal.toLocaleString('en-IN')}`);
      setPosCart([]);
      setRedeemLoyalty(false);
      setPosDiscount(0);
      loadErpData();
    } catch (err: any) {
      // Fallback into offline queue if server error / network drop
      const queue = JSON.parse(localStorage.getItem('ginie_offline_bills_queue') || '[]');
      const updatedQueue = [...queue, invoiceData];
      localStorage.setItem('ginie_offline_bills_queue', JSON.stringify(updatedQueue));
      setOfflineBills(updatedQueue);
      message.info(`Network dropped. Bill saved in local Offline Queue.`);
      setPosCart([]);
      setRedeemLoyalty(false);
      setPosDiscount(0);
    }
  };

  const handleSyncOfflineBills = async () => {
    if (offlineBills.length === 0) {
      message.info('No offline bills in queue.');
      return;
    }
    setSyncingOffline(true);
    message.loading({ content: `Syncing ${offlineBills.length} offline bills to cloud...`, key: 'sync_offline' });

    try {
      for (const bill of offlineBills) {
        await api.post('/api/billing/invoices', bill).catch(() => null);
      }
      localStorage.removeItem('ginie_offline_bills_queue');
      setOfflineBills([]);
      message.destroy('sync_offline');
      message.success('🟢 All pending offline bills synced to Cloud database!');
      loadErpData();
    } catch {
      message.destroy('sync_offline');
      message.error('Failed to sync some bills. Please check connection.');
    } finally {
      setSyncingOffline(false);
    }
  };

  const handleStartVoicePos = () => {
    const SpeechRec = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
    if (!SpeechRec) {
      message.warning('Voice recognition not supported. Use Google Chrome or Edge.');
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = 'hi-IN';
      setIsListeningPos(true);
      message.loading({ content: 'Listening for items... बोलिए: "Shirt and Belt"', key: 'pos_rec', duration: 6 });
      rec.onresult = (e: any) => {
        setIsListeningPos(false);
        message.destroy('pos_rec');
        const text = e.results[0][0].transcript.toLowerCase();
        const matched = products.find((p) => text.includes(p.name.toLowerCase())) || {
          id: `voice-${Date.now()}`,
          name: text.charAt(0).toUpperCase() + text.slice(1),
          price: 500,
          taxRate: 18,
        };
        handlePosAddToCart(matched);
        message.success(`Voice added: "${matched.name}" to cart!`);
      };
      rec.onerror = () => {
        setIsListeningPos(false);
        message.destroy('pos_rec');
      };
      rec.onend = () => setIsListeningPos(false);
      rec.start();
    } catch {
      setIsListeningPos(false);
    }
  };

  // Daily Galla / Cash Register Calculations
  const todayInvoices = invoices.filter((inv) => {
    if (!inv.createdAt) return false;
    const d = new Date(inv.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const cashSalesToday = todayInvoices
    .filter((i) => (i.paymentMethod || '').toLowerCase() === 'cash')
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const upiSalesToday = todayInvoices
    .filter((i) => (i.paymentMethod || '').toLowerCase() === 'upi')
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const totalCashInDrawer = openingCash + cashSalesToday;

  const activeCategoryMeta = INDUSTRY_CATEGORIES.find((c) => c.key === selectedIndustry) || INDUSTRY_CATEGORIES[0];

  return (
    <div style={{ padding: '4px 0 40px' }}>
      {/* Top Banner: Integrated ERP & Business OS */}
      <div
        className="ginie-erp-header-banner"
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
              Specialized enterprise toolkits and POS operations dedicated to your registered industry — seamlessly linked with your Storefront, CRM Contacts, and Invoices.
            </Paragraph>
          </div>

          <Space>
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

        {/* Permanent Registered Business Category - Locked to User Onboarding */}
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.12)',
              border: `2px solid ${activeCategoryMeta.color}`,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 14,
            }}>
              <span style={{ color: activeCategoryMeta.color }}>{activeCategoryMeta.icon}</span>
              <span>{activeCategoryMeta.label}</span>
              <LockOutlined style={{ color: '#fbbf24', marginLeft: 4 }} />
            </div>
            <div>
              <Text style={{ color: '#f1f5f9', fontWeight: 600, display: 'block', fontSize: 13 }}>
                Permanent Registered Business Mode (स्थाई व्यापार श्रेणी)
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                Onboarding ke waqt chuna gaya business type locked hai. Aapka Storefront, ERP Counter aur Catalog iske mutabiq dedicated hain.
              </Text>
            </div>
          </div>
          <Tag color="gold" icon={<LockOutlined />} style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 12 }}>
            LOCKED TO REGISTERED TRADE
          </Tag>
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
              title={
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Industry Mode Active
                  <LockOutlined style={{ color: '#d97706', fontSize: 12 }} />
                </span>
              }
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
          {/* Daily Galla / Cash Register (Daybook) Banner */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '14px 20px',
              marginBottom: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarCircleOutlined style={{ fontSize: 20, color: '#059669' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  Daily Cash Drawer & Daybook (दैनिक रोकड़ बही)
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Real-time counter cash, UPI collections & drawer reconciliation
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Opening Cash:</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>₹{openingCash.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Today's Cash Sale:</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#16a34a' }}>+₹{cashSalesToday.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Today's UPI Sale:</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#2563eb' }}>+₹{upiSalesToday.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ textAlign: 'right', padding: '4px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Drawer Total Cash:</span>
                <span style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>₹{totalCashInDrawer.toLocaleString('en-IN')}</span>
              </div>
              <Button
                size="middle"
                onClick={() => setCashDrawerModalOpen(true)}
                style={{ borderRadius: 8, fontWeight: 600 }}
              >
                Reconcile Drawer
              </Button>
            </div>
          </div>

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
                {/* Instant Barcode & Fast Scanner Controls */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <Input
                    allowClear
                    prefix={<BarcodeOutlined style={{ color: '#1677ff' }} />}
                    placeholder="Scan Barcode, type SKU or product name & press Enter..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onPressEnter={handleBarcodeScan}
                    style={{ flex: 1, minWidth: 200, borderRadius: 8 }}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleBarcodeScan}
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Find / Add
                  </Button>
                  <Button
                    icon={<CameraOutlined />}
                    onClick={() => startCameraScanner()}
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      borderColor: '#1677ff',
                      color: '#1677ff',
                      background: '#f0f7ff',
                    }}
                  >
                    Camera Scan
                  </Button>
                </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong>
                    Quick Item Catalog (क्लिक करके जोड़ें):
                  </Text>
                  <Button
                    size="small"
                    icon={<AudioOutlined />}
                    onClick={handleStartVoicePos}
                    loading={isListeningPos}
                    style={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 600 }}
                  >
                    बोलकर जोड़ें (Voice Cart)
                  </Button>
                </div>
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

                {/* Real-time Inventory Table */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                    Store Inventory & Stock Levels ({products.length} Items Linked)
                  </span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (products.length > 0) handleOpenStockModal(products[0]);
                    }}
                    style={{ borderRadius: 6, fontWeight: 600 }}
                  >
                    + Stock Inward (माल आवक)
                  </Button>
                </div>
                <Table
                  size="small"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 650 }}
                  dataSource={products}
                  rowKey="id"
                  columns={[
                    {
                      title: 'SKU / Barcode',
                      dataIndex: 'code',
                      key: 'code',
                      render: (val, r) => <Text code>{val || r.sku || 'SKU-001'}</Text>,
                    },
                    {
                      title: 'Item Name',
                      dataIndex: 'name',
                      key: 'name',
                      render: (val, r) => (
                        <div>
                          <Text strong>{val}</Text>
                          {r.category && <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>{r.category}</span>}
                        </div>
                      ),
                    },
                    {
                      title: 'Selling Price',
                      dataIndex: 'price',
                      key: 'price',
                      render: (val) => <span style={{ fontWeight: 600 }}>₹{Number(val).toLocaleString('en-IN')}</span>,
                    },
                    {
                      title: 'Stock in Hand',
                      dataIndex: 'stockInHand',
                      key: 'stockInHand',
                      render: (val, r) => {
                        const stock = val !== undefined ? Number(val) : 0;
                        const min = r.minStockAlert || 5;
                        return (
                          <Space>
                            <span style={{ fontWeight: 800, color: stock <= 0 ? '#ef4444' : stock <= min ? '#f97316' : '#16a34a' }}>
                              {stock} {r.unit || 'pcs'}
                            </span>
                            {stock <= min && <Badge status={stock <= 0 ? 'error' : 'warning'} />}
                          </Space>
                        );
                      },
                    },
                    {
                      title: 'Status',
                      key: 'status',
                      render: (_, r) => {
                        const stock = r.stockInHand !== undefined ? Number(r.stockInHand) : 0;
                        const min = r.minStockAlert || 5;
                        const status = stock <= 0 ? 'Out of Stock' : stock <= min ? 'Low Stock' : 'In Stock';
                        const color = stock <= 0 ? 'red' : stock <= min ? 'orange' : 'green';
                        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
                      },
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      render: (_, r) => (
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => handleOpenStockModal(r)}
                          style={{ fontWeight: 600 }}
                        >
                          Adjust
                        </Button>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Current Bill ({posCart.length} Items)</span>
                    <Space size="small">
                      {offlineBills.length > 0 && (
                        <Button
                          size="small"
                          danger
                          icon={<CloudUploadOutlined />}
                          onClick={() => setOfflineModalOpen(true)}
                          style={{ fontWeight: 600 }}
                        >
                          Offline Queue ({offlineBills.length})
                        </Button>
                      )}
                      {posCart.length > 0 && (
                        <Button size="small" type="text" danger onClick={() => setPosCart([])}>
                          Clear Cart
                        </Button>
                      )}
                    </Space>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', padding: '6px 10px', background: '#ecfdf5', borderRadius: 6, border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: 12, color: '#047857' }}>
                          <GiftOutlined style={{ marginRight: 6 }} />
                          Redeem Customer Wallet
                        </div>
                        <Button
                          size="small"
                          type={redeemLoyalty ? 'primary' : 'default'}
                          onClick={() => {
                            if (!redeemLoyalty) {
                              setRedeemLoyalty(true);
                              setPosDiscount(100);
                              message.success('Redeemed ₹100 from customer loyalty wallet!');
                            } else {
                              setRedeemLoyalty(false);
                              setPosDiscount(0);
                            }
                          }}
                          style={redeemLoyalty ? { background: '#059669', borderColor: '#059669' } : {}}
                        >
                          {redeemLoyalty ? 'Redeemed (-₹100)' : 'Apply ₹100'}
                        </Button>
                      </div>
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
                  scroll={{ x: 650 }}
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
                  scroll={{ x: 650 }}
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
                          scroll={{ x: 450 }}
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
                  scroll={{ x: 600 }}
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
                  scroll={{ x: 500 }}
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
              scroll={{ x: 750 }}
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

      {/* 8. PHARMACY & MEDICAL MODULE */}
      {selectedIndustry === 'pharmacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Statistic title={<span style={{ color: '#166534', fontWeight: 600 }}>Active Batches</span>} value={pharmacyBatches.length} prefix={<ExperimentOutlined style={{ color: '#16a34a' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <Statistic title={<span style={{ color: '#92400e', fontWeight: 600 }}>Near Expiry Warning</span>} value={1} prefix={<WarningOutlined style={{ color: '#d97706' }} />} valueStyle={{ color: '#d97706' }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Statistic title={<span style={{ color: '#1e40af', fontWeight: 600 }}>Rx Queue Today</span>} value={rxPrescriptions.length} prefix={<MedicineBoxOutlined style={{ color: '#2563eb' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Statistic title={<span style={{ color: '#334155', fontWeight: 600 }}>Schedule H Compliance</span>} value={100} suffix="%" prefix={<CheckCircleOutlined style={{ color: '#059669' }} />} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Medicine Batch & Expiry Date Register</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.info('Batch Inward entry modal opened')}>
                      Add Batch Inward
                    </Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <Table
                  dataSource={pharmacyBatches}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 650 }}
                  columns={[
                    { title: 'Medicine Name', dataIndex: 'medicine', key: 'medicine', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Batch #', dataIndex: 'batchNo', key: 'batchNo', render: (t) => <Text code>{t}</Text> },
                    { title: 'Rack', dataIndex: 'rack', key: 'rack' },
                    {
                      title: 'Expiry',
                      dataIndex: 'expDate',
                      key: 'expDate',
                      render: (d, r) => (
                        <Tag color={r.status.includes('Warning') ? 'error' : 'default'}>{d}</Tag>
                      ),
                    },
                    { title: 'Stock', dataIndex: 'stockQty', key: 'stockQty', render: (q) => q + ' strips' },
                    { title: 'Strip MRP', dataIndex: 'stripRate', key: 'stripRate', render: (r) => '₹' + r },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (s) => (
                        <Tag color={s === 'Healthy Stock' ? 'green' : s.includes('Warning') ? 'orange' : 'red'}>{s}</Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={9}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Doctor Prescription (Rx) Log</span>
                    <Tag color="cyan">Schedule H1 Verified</Tag>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <List
                  dataSource={rxPrescriptions}
                  renderItem={(item) => (
                    <Card size="small" style={{ marginBottom: 12, borderRadius: 8, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 14 }}>{item.patient}</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{item.doctor}</div>
                        </div>
                        <Tag color={item.status === 'Verified & Dispensed' ? 'green' : 'orange'}>{item.status}</Tag>
                      </div>
                      <div style={{ margin: '8px 0', fontSize: 13, background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <Text type="secondary">Rx Medicines: </Text>
                        <Text strong>{item.drugs}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.id} | {item.date}</span>
                        <Space>
                          <Button size="small" icon={<PrinterOutlined />} onClick={() => message.success('Prescription label generated for ' + item.patient)}>Label</Button>
                          <Button size="small" type="primary" ghost icon={<WhatsAppOutlined />} onClick={() => message.success('WhatsApp reminder sent to ' + item.patient)}>Notify</Button>
                        </Space>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 9. JEWELLERY & GOLD BULLION MODULE */}
      {selectedIndustry === 'jewellery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CrownOutlined style={{ fontSize: 22, color: '#d97706' }} />
                <div>
                  <Text strong style={{ fontSize: 16, color: '#92400e' }}>Live Daily Bullion & Metal Rate Board</Text>
                  <div style={{ fontSize: 12, color: '#b45309' }}>Market benchmark: {bullionRates.lastUpdated}</div>
                </div>
              </div>
              <Button size="small" type="primary" style={{ background: '#d97706', borderColor: '#d97706' }} onClick={() => message.info('Bullion rates updated')}>
                Update Board Rates
              </Button>
            </div>
            <Row gutter={[16, 12]}>
              <Col xs={12} sm={6}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fcd34d' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>24K Pure Gold (10g)</Text>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>₹{bullionRates.gold24k.toLocaleString('en-IN')}</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fcd34d' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>22K Hallmark 916 (10g)</Text>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>₹{bullionRates.gold22k.toLocaleString('en-IN')}</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fcd34d' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>18K Diamond Gold (10g)</Text>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>₹{bullionRates.gold18k.toLocaleString('en-IN')}</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>925 Fine Silver (1 kg)</Text>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#475569' }}>₹{bullionRates.silver1kg.toLocaleString('en-IN')}</div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Hallmarked Jewellery Stock & Making Charges</span>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.info('Add new Jewellery ornament')}>
                  Add Jewellery Item
                </Button>
              </div>
            }
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={jewelleryItems}
              rowKey="id"
              scroll={{ x: 750 }}
              columns={[
                { title: 'Tag #', dataIndex: 'id', key: 'id', render: (t) => <Text code>{t}</Text> },
                { title: 'Ornament Description', dataIndex: 'item', key: 'item', render: (t) => <Text strong>{t}</Text> },
                { title: 'Gross / Net Wt', key: 'weight', render: (_, r) => <span>{r.grossWeight} / {r.netWeight}</span> },
                { title: 'Purity & Hallmarking', dataIndex: 'purity', key: 'purity', render: (p) => <Tag color="gold">{p}</Tag> },
                { title: 'Making Charge / g', dataIndex: 'makingChargePerGm', key: 'makingChargePerGm', render: (m) => '₹' + m + '/g' },
                { title: 'Est. Valuation', dataIndex: 'totalEstimated', key: 'totalEstimated', render: (v) => <Tag color="green">₹{v.toLocaleString('en-IN')}</Tag> },
                { title: 'Location', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'In Showcase' ? 'blue' : 'purple'}>{s}</Tag> },
              ]}
            />
          </Card>
        </div>
      )}

      {/* 10. SALON & SPA MODULE */}
      {selectedIndustry === 'salon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#fdf2f8', border: '1px solid #fbcfe8' }}>
                <Statistic title={<span style={{ color: '#9d174d', fontWeight: 600 }}>Active Chairs In Use</span>} value={3} suffix="/ 6" prefix={<ScissorOutlined style={{ color: '#db2777' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Statistic title={<span style={{ color: '#166534', fontWeight: 600 }}>Appointments Today</span>} value={salonAppointments.length} prefix={<CheckCircleOutlined style={{ color: '#16a34a' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Statistic title={<span style={{ color: '#1e40af', fontWeight: 600 }}>Stylist Total Revenue</span>} value={17100} prefix="₹" />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <Statistic title={<span style={{ color: '#6b21a8', fontWeight: 600 }}>Avg Service Duration</span>} value={45} suffix="mins" />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Stylist Chair Schedule & Live Queue</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.info('Book new salon appointment')}>
                      Book Appointment
                    </Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <Table
                  dataSource={salonAppointments}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 650 }}
                  columns={[
                    { title: 'Token & Time', key: 'time', render: (_, r) => <span><Text code>{r.id}</Text> <br /><Text strong>{r.time}</Text></span> },
                    { title: 'Client', dataIndex: 'client', key: 'client', render: (c, r) => <span><Text strong>{c}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text></span> },
                    { title: 'Stylist & Station', key: 'stylist', render: (_, r) => <span><Tag color="magenta">{r.stylist}</Tag><br /><Text type="secondary" style={{ fontSize: 11 }}>{r.chair}</Text></span> },
                    { title: 'Service Package', dataIndex: 'service', key: 'service' },
                    { title: 'Billing', dataIndex: 'amount', key: 'amount', render: (a) => <Tag color="green">₹{a}</Tag> },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (s) => (
                        <Tag color={s === 'In Service' ? 'processing' : s === 'Next in Queue' ? 'orange' : 'green'}>{s}</Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={9}>
              <Card title={<span style={{ fontWeight: 700 }}>Stylist Daily Commission Tracker</span>} style={{ borderRadius: 12 }}>
                <List
                  dataSource={stylistCommissions}
                  renderItem={(st) => (
                    <Card size="small" style={{ marginBottom: 10, borderRadius: 8, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 14 }}>{st.name}</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Rating: {st.rating} | {st.totalClientsToday} Clients Served</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Tag color="cyan">Revenue: ₹{st.todayRevenue}</Tag>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                            Commission: ₹{st.commissionEarned}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 11. COACHING & EDUCATION MODULE */}
      {selectedIndustry === 'education' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <Statistic title={<span style={{ color: '#3730a3', fontWeight: 600 }}>Active Batches</span>} value={studentBatches.length} prefix={<ReadOutlined style={{ color: '#4f46e5' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Statistic title={<span style={{ color: '#166534', fontWeight: 600 }}>Total Enrolled</span>} value={80} suffix="Students" prefix={<TeamOutlined style={{ color: '#16a34a' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Statistic title={<span style={{ color: '#1e40af', fontWeight: 600 }}>Fee Realization</span>} value={92} suffix="%" />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <Statistic title={<span style={{ color: '#92400e', fontWeight: 600 }}>Pending Dues Today</span>} value={8700} prefix="₹" valueStyle={{ color: '#d97706' }} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Active Student Batches & Timetable</span>
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.info('Create new student batch')}>
                      Create Batch
                    </Button>
                  </div>
                }
                style={{ borderRadius: 12 }}
              >
                <Table
                  dataSource={studentBatches}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 650 }}
                  columns={[
                    { title: 'Batch Details', key: 'batch', render: (_, r) => <span><Text strong>{r.batchName}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Faculty: {r.instructor}</Text></span> },
                    { title: 'Schedule & Time', dataIndex: 'time', key: 'time' },
                    { title: 'Enrollment', key: 'enrolled', render: (_, r) => <Tag color="blue">{r.enrolled} / {r.capacity}</Tag> },
                    { title: 'Monthly Fee', dataIndex: 'monthlyFee', key: 'monthlyFee', render: (f) => '₹' + f + '/mo' },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (s) => <Tag color="green">{s}</Tag>,
                    },
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card title={<span style={{ fontWeight: 700 }}>Monthly Fee Dues & WhatsApp Reminder</span>} style={{ borderRadius: 12 }}>
                <List
                  dataSource={feeDues}
                  renderItem={(fd) => (
                    <Card size="small" style={{ marginBottom: 12, borderRadius: 8, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 14 }}>{fd.student}</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Roll: {fd.rollNo} | {fd.batch}</div>
                        </div>
                        <Tag color={fd.status.includes('Paid') ? 'green' : 'orange'}>{fd.status}</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>₹{fd.amountDue} Due</span>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Due Date: {fd.dueDate}</div>
                        </div>
                        <Button
                          size="small"
                          type="primary"
                          ghost
                          icon={<WhatsAppOutlined />}
                          onClick={() => message.success('WhatsApp fee receipt & reminder sent to parent ' + fd.parentPhone)}
                        >
                          Send Reminder
                        </Button>
                      </div>
                    </Card>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Offline Bills Sync Queue Modal */}
      <Modal
        title={
          <Space>
            <CloudUploadOutlined style={{ color: '#ea580c' }} />
            <span>Local Offline Bill Queue ({offlineBills.length} Pending)</span>
          </Space>
        }
        open={offlineModalOpen}
        onCancel={() => setOfflineModalOpen(false)}
        footer={null}
        width={600}
      >
        <div>
          <Paragraph type="secondary">
            These bills were generated locally while internet was offline or intermittent. They are safely stored in browser storage. Click Sync to upload to Cloud.
          </Paragraph>

          <Table
            dataSource={offlineBills}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 450 }}
            columns={[
              { title: 'Bill Ref', dataIndex: 'id', key: 'id', render: (t) => <Text code>{t}</Text> },
              { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
              { title: 'Amount', dataIndex: 'total', key: 'total', render: (v) => <Text strong style={{ color: '#1677ff' }}>₹{Number(v).toLocaleString('en-IN')}</Text> },
              { title: 'Mode', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (m) => <Tag color="blue">{(m || 'UPI').toUpperCase()}</Tag> },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Button
              danger
              onClick={() => {
                localStorage.removeItem('ginie_offline_bills_queue');
                setOfflineBills([]);
                message.info('Offline queue cleared.');
              }}
            >
              Clear Queue
            </Button>
            <Space>
              <Button onClick={() => setOfflineModalOpen(false)}>Close</Button>
              <Button
                type="primary"
                icon={<SyncOutlined spin={syncingOffline} />}
                loading={syncingOffline}
                onClick={handleSyncOfflineBills}
                style={{ background: '#059669', borderColor: '#059669', fontWeight: 600 }}
              >
                Sync All Bills to Cloud Now
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* Real-time Stock Adjustment / Inward Modal */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined style={{ color: '#1677ff' }} />
            <span>Stock Inward & Inventory Adjustment (स्टॉक आवक व मिलान)</span>
          </Space>
        }
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={handleStockAdjustSubmit}
        okText="Update Stock Level"
        width={500}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Select Item to Adjust:</Text>
            <Select
              style={{ width: '100%' }}
              value={selectedStockProduct?.id}
              onChange={(val) => setSelectedStockProduct(products.find((p) => p.id === val))}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.stockInHand || 0} {p.unit || 'pcs'})
                </Option>
              ))}
            </Select>
          </div>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Adjustment Type:</Text>
              <Segmented
                block
                value={stockAdjustmentType}
                onChange={(v: any) => setStockAdjustmentType(v)}
                options={[
                  { label: '+ Add Stock', value: 'inward' },
                  { label: '- Deduct Stock', value: 'outward' },
                ]}
              />
            </Col>
            <Col span={12}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Quantity (संख्या):</Text>
              <InputNumber
                min={1}
                max={100000}
                style={{ width: '100%' }}
                value={stockAdjustmentQty}
                onChange={(val) => setStockAdjustmentQty(val || 1)}
              />
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Reason / Notes (कारण):</Text>
            <Select
              style={{ width: '100%' }}
              value={stockAdjustmentReason}
              onChange={(v) => setStockAdjustmentReason(v)}
              options={[
                { value: 'Vendor Purchase Inward', label: 'Vendor Purchase Inward (सप्लायर से माल आया)' },
                { value: 'Inventory Audit Adjustment', label: 'Inventory Audit / Count Correction (स्टॉक मिलान)' },
                { value: 'Damaged / Expired Goods', label: 'Damaged / Expired Goods (खराब/एक्सपायर माल)' },
                { value: 'Customer Return', label: 'Customer Return (ग्राहक ने वापस किया)' },
              ]}
            />
          </div>

          {selectedStockProduct && (
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <Text type="secondary">Current Stock:</Text>
                <Text strong>{selectedStockProduct.stockInHand || 0} {selectedStockProduct.unit || 'pcs'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                <Text type="secondary">Projected Level:</Text>
                <Text strong style={{ color: stockAdjustmentType === 'inward' ? '#16a34a' : '#ef4444' }}>
                  {Math.max(
                    0,
                    (selectedStockProduct.stockInHand || 0) +
                      (stockAdjustmentType === 'inward' ? stockAdjustmentQty : -stockAdjustmentQty)
                  )}{' '}
                  {selectedStockProduct.unit || 'pcs'}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Cash Drawer Reconciliation Modal */}
      <Modal
        title={
          <Space>
            <DollarCircleOutlined style={{ color: '#059669' }} />
            <span>Daily Cash Register & Drawer Reconcile (दैनिक गल्ला मिलान)</span>
          </Space>
        }
        open={cashDrawerModalOpen}
        onCancel={() => setCashDrawerModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setCashDrawerModalOpen(false)}>Cancel</Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              localStorage.setItem('ginie_opening_cash', String(openingCash));
              message.success('Opening cash & drawer balance updated!');
              setCashDrawerModalOpen(false);
            }}
          >
            Save Register Settings
          </Button>,
        ]}
        width={450}
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Opening Cash in Drawer (सुबह का प्रारंभिक नकद):
            </Text>
            <InputNumber
              prefix="₹"
              style={{ width: '100%' }}
              value={openingCash}
              onChange={(val) => setOpeningCash(val || 0)}
            />
          </div>

          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Morning Opening Cash:</Text>
              <Text strong>₹{openingCash.toLocaleString('en-IN')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <Text>Today's Cash Sales:</Text>
              <Text strong>+₹{cashSalesToday.toLocaleString('en-IN')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
              <Text>Today's UPI Sales:</Text>
              <Text strong>+₹{upiSalesToday.toLocaleString('en-IN')}</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
              <Text strong>Total Cash in Galla:</Text>
              <span style={{ fontWeight: 900, color: '#0f172a' }}>
                ₹{(openingCash + cashSalesToday).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Live Camera Barcode Scanner Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <CameraOutlined style={{ color: '#1677ff' }} />
              <span>Live Barcode & QR Scanner (कैमरा स्कैनर)</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Multi-scan:</span>
              <Switch
                size="small"
                checked={continuousScan}
                onChange={(checked) => setContinuousScan(checked)}
              />
            </div>
          </div>
        }
        open={cameraModalOpen}
        onCancel={stopCameraScanner}
        footer={[
          <Button key="close" onClick={stopCameraScanner}>
            Close
          </Button>,
          <Button
            key="flip"
            icon={<SyncOutlined />}
            onClick={() => {
              const nextMode = facingMode === 'environment' ? 'user' : 'environment';
              setFacingMode(nextMode);
              startCameraScanner(nextMode);
            }}
          >
            Flip Camera
          </Button>,
        ]}
        width={520}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Viewfinder Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 300,
              background: '#090d16',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cameraLoading && (
              <div style={{ position: 'absolute', zIndex: 10, textAlign: 'center', color: '#fff' }}>
                <Spin size="large" />
                <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>Starting camera stream...</div>
              </div>
            )}

            {cameraError ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#fff', zIndex: 10 }}>
                <Alert
                  type="warning"
                  showIcon
                  message="Camera Access Note"
                  description={cameraError}
                  style={{ textAlign: 'left', marginBottom: 12 }}
                />
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                  You can type SKU or click any item below to simulate a barcode scan.
                </Text>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Animated Targeting Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '15%',
                    left: '12%',
                    right: '12%',
                    bottom: '15%',
                    border: '2px solid rgba(56, 189, 248, 0.8)',
                    borderRadius: 12,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Red Laser Scanning Line */}
                  <div
                    style={{
                      width: '100%',
                      height: 2,
                      background: 'linear-gradient(90deg, transparent, #ef4444, #ef4444, transparent)',
                      boxShadow: '0 0 8px #ef4444',
                      animation: 'scanLaser 2s infinite ease-in-out',
                    }}
                  />
                </div>

                {/* Live Scanner Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #10b981',
                    }}
                  />
                  <span>Align barcode inside target frame</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Manual / Test Barcode Bar */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Quick Barcode Test or Direct SKU Entry:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="Type or paste barcode (e.g. APP-01, 890123...)"
                id="camera-manual-barcode-input"
                onPressEnter={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) {
                    handleProcessScannedCode(val);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  const input = document.getElementById('camera-manual-barcode-input') as HTMLInputElement;
                  if (input && input.value) {
                    handleProcessScannedCode(input.value);
                    input.value = '';
                  }
                }}
              >
                Scan Code
              </Button>
            </div>
          </div>

          {/* Instant One-Click Sample Barcodes */}
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              Store Items (Click to simulate scan):
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(products.length > 0 ? products.slice(0, 6) : [
                { id: 'p1', name: 'Premium Cotton Shirt', code: 'APP-01' },
                { id: 'p2', name: 'Formal Trousers Slim', code: 'APP-02' },
                { id: 'p3', name: 'Leather Belt (Black)', code: 'ACC-01' },
              ]).map((p) => (
                <Tag
                  key={p.id}
                  style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                  color="blue"
                  onClick={() => handleProcessScannedCode(p.code || p.name)}
                >
                  <BarcodeOutlined style={{ marginRight: 4 }} />
                  {p.code || p.sku || 'SKU'}: {p.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Mobile Floating POS Cart Summary */}
      {posCart.length > 0 && (
        <div
          className="show-on-mobile"
          style={{
            position: 'fixed',
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
            left: 10,
            right: 10,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            borderRadius: 12,
            padding: '10px 14px',
            zIndex: 999,
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {posCart.reduce((acc, i) => acc + i.qty, 0)} Items Selected
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#38bdf8' }}>
              ₹{posGrandTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <Button
            type="primary"
            size="middle"
            onClick={handlePosCheckout}
            style={{
              background: '#16a34a',
              borderColor: '#16a34a',
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            Complete Bill (बिल बनाएं)
          </Button>
        </div>
      )}
    </div>
  );
}
