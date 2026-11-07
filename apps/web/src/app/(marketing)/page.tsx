'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ScanBarcode,
  MessageSquare,
  Compass,
  ShoppingBag,
  CreditCard,
  Building2,
  Wrench,
  Stethoscope,
  UtensilsCrossed,
  Scissors,
  Truck,
  Smartphone,
  Hammer,
  Cake,
  Shirt,
  Briefcase,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Users,
  ChevronRight,
  Menu,
  X,
  Star,
  Check,
  ChevronDown,
  Printer,
  WifiOff,
  QrCode,
  PhoneCall,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TradeInfo {
  id: string;
  name: string;
  icon: any;
  color: string;
  tagline: string;
  features: string[];
  mockStats: { label: string; value: string }[];
}

const TRADES: TradeInfo[] = [
  {
    id: 'kirana',
    name: 'Kirana & Supermarket',
    icon: ShoppingBag,
    color: 'from-amber-500 to-orange-600',
    tagline: 'Barcode Counter, Expiry Alerts & Fast Weighing Scales',
    features: [
      'Sub-50ms barcode billing with laser gun & camera scan',
      'Batch-wise expiry alerts & automatic discount triggers',
      'Digital Udhaar Khata with automatic WhatsApp reminders',
      'Loose item weighing scale integration (Gram / KG / Litre)',
    ],
    mockStats: [
      { label: 'Avg Checkout Speed', value: '3.2 sec' },
      { label: 'Stock Accuracy', value: '99.4%' },
      { label: 'Khata Recovery', value: '+35%' },
    ],
  },
  {
    id: 'garage',
    name: 'Automobile Garage',
    icon: Wrench,
    color: 'from-blue-600 to-cyan-600',
    tagline: 'Digital Job Cards, Spare Parts & Service Reminders',
    features: [
      'Digital Vehicle Job Cards with before/after photos',
      'OEM Spare parts inventory with part number search',
      'Scheduled service WhatsApp alerts based on KM driven',
      'Mechanic commission & technician labour tracking',
    ],
    mockStats: [
      { label: 'Job Card Turnaround', value: '45 mins' },
      { label: 'Customer Retention', value: '82%' },
      { label: 'Parts Margin', value: '+24%' },
    ],
  },
  {
    id: 'clinic',
    name: 'Clinic & Pharmacy',
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-600',
    tagline: 'Prescription Records, Medicine Schedule & Expiry Tracking',
    features: [
      'Schedule H drug compliance & salt-name substitute finder',
      'Batch expiry radar alerts before medicines expire',
      'Doctor digital prescription & patient history in 1 click',
      'Chronic patient refill reminders dispatched via WhatsApp',
    ],
    mockStats: [
      { label: 'Zero-Expiry Loss', value: '₹42,000/yr' },
      { label: 'Repeat Refills', value: '64%' },
      { label: 'Bill Compliance', value: '100% GST' },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Cafe',
    icon: UtensilsCrossed,
    color: 'from-rose-500 to-red-600',
    tagline: 'KOT Printing, Table Management & QR Menu Ordering',
    features: [
      'Kitchen Order Ticket (KOT) multi-printer routing',
      'Interactive visual table floor map & split billing',
      'QR code scan-to-order digital menu with WhatsApp ping',
      'Raw ingredient recipe costing & inventory consumption',
    ],
    mockStats: [
      { label: 'Table Turnover', value: '+28%' },
      { label: 'Order Accuracy', value: '99.9%' },
      { label: 'Food Waste Reduced', value: '-19%' },
    ],
  },
  {
    id: 'salon',
    name: 'Salon & Spa',
    icon: Scissors,
    color: 'from-purple-500 to-pink-600',
    tagline: 'Stylist Appointments, Service Bundles & Loyalty Club',
    features: [
      'Slot-wise stylist calendar booking with instant confirmation',
      'Customer hair/skin notes & previous service formula records',
      'Loyalty cashback wallet crediting points on every haircut',
      'Festive WhatsApp promotion broadcast with one-click booking',
    ],
    mockStats: [
      { label: 'No-Show Rate', value: '< 4%' },
      { label: 'Client Lifetime Value', value: '+45%' },
      { label: 'Repeat Visits', value: '3.8x/yr' },
    ],
  },
  {
    id: 'wholesale',
    name: 'Wholesale & B2B Trading',
    icon: Truck,
    color: 'from-slate-700 to-slate-900',
    tagline: 'Tiered Pricing, GST E-Way Bills & Dealer Ledger',
    features: [
      'Party-wise special discount pricing matrix & volume deals',
      '1-click E-Way bill generation & GSTR-1/3B instant export',
      'Consignment dispatch tracking & truck loading slips',
      'Automatic credit limit enforcement preventing bad debts',
    ],
    mockStats: [
      { label: 'Ledger Reconciliation', value: 'Real-Time' },
      { label: 'Bad Debt Reduction', value: '-80%' },
      { label: 'Order Dispatch', value: '2x Faster' },
    ],
  },
  {
    id: 'repair',
    name: 'Mobile & Electronics Repair',
    icon: Smartphone,
    color: 'from-cyan-600 to-blue-700',
    tagline: 'IMEI Barcodes, Diagnostic Tickets & WhatsApp Status',
    features: [
      'IMEI & Serial barcode intake sticker generation',
      'WhatsApp status links for customers to track repair progress',
      'Used device buyback testing checklist & refurb inventory',
      'Warranty tracking on screens, batteries, and motherboard chips',
    ],
    mockStats: [
      { label: 'Customer Calls Saved', value: '65/day' },
      { label: 'TAT on Repairs', value: '-30%' },
      { label: 'Customer Trust', value: '4.9 ★' },
    ],
  },
  {
    id: 'hardware',
    name: 'Hardware & Electricals',
    icon: Hammer,
    color: 'from-amber-600 to-yellow-600',
    tagline: 'Multi-UOM Units, Carpenter Credit & Contractor Estimates',
    features: [
      'Flexible units: Feet, Meter, Box, Bundle, Kilogram, Pieces',
      'Contractor commission ledger & quotation-to-invoice sync',
      'High-velocity search across 20,000+ electrical SKUs',
      'Direct WhatsApp PDF quotation sending with approve button',
    ],
    mockStats: [
      { label: 'SKU Search', value: '< 20ms' },
      { label: 'Quote Conversion', value: '+40%' },
      { label: 'UOM Mismatch', value: '0%' },
    ],
  },
  {
    id: 'bakery',
    name: 'Bakery & Confectionery',
    icon: Cake,
    color: 'from-pink-500 to-rose-600',
    tagline: 'Custom Photo Cakes, Fresh Batch Logs & Advance Booking',
    features: [
      'Advance custom photo cake order booking with delivery time',
      'Hourly shelf-life tracking for fresh pastries and savouries',
      'Integrated thermal receipt with custom greeting notes',
      'Daily morning production sheet auto-generated from orders',
    ],
    mockStats: [
      { label: 'Advance Order Accuracy', value: '100%' },
      { label: 'Wastage Cut', value: '-25%' },
      { label: 'Festive Sales', value: '+50%' },
    ],
  },
  {
    id: 'apparel',
    name: 'Garments & Footwear',
    icon: Shirt,
    color: 'from-indigo-600 to-violet-700',
    tagline: 'Size-Color Matrix, Custom Barcode Tags & Exchange Tracker',
    features: [
      'Multi-variant Matrix: e.g. T-Shirt [Small/Medium/Large] x [Red/Blue]',
      'In-house thermal barcode tag generator with brand logo',
      'Hassle-free 7-day exchange window verification',
      'End-of-season clearance sale discount automation',
    ],
    mockStats: [
      { label: 'Stock Audit Time', value: '15 mins' },
      { label: 'Dead Stock Alert', value: 'Active' },
      { label: 'Walk-in Retention', value: '55%' },
    ],
  },
  {
    id: 'services',
    name: 'Services & Freelancers',
    icon: Briefcase,
    color: 'from-emerald-600 to-sky-700',
    tagline: 'Digital Estimates, Milestone Billing & UPI Payment Links',
    features: [
      'Professional GST invoice creation with branded header & QR',
      'Milestone payment stages with auto-reminders via WhatsApp',
      'Expense tracking & profit per project dashboard',
      'Customer sign-off & feedback activity stream',
    ],
    mockStats: [
      { label: 'Payment Collection', value: '3x Faster' },
      { label: 'Unpaid Invoices', value: '< 2%' },
      { label: 'Professional Image', value: '100%' },
    ],
  },
];

export default function MarketingLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeInfo>(TRADES[0]);
  const [billVolume, setBillVolume] = useState<number>(50);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ginie_token');
      if (token) setIsLoggedIn(true);
    }
  }, []);

  // Calculation for ROI
  const hoursSavedPerMonth = Math.round((billVolume * 30 * 2.5) / 60);
  const moneySavedPerMonth = Math.round(hoursSavedPerMonth * 350 + (billVolume * 30 * 4));

  const faqs = [
    {
      q: 'Does GINIE work offline if internet goes down during peak rush hours?',
      a: 'Yes, 100%! GINIE features a resilient local offline queue. Your billing counter continues scanning barcodes and printing thermal receipts without interruption. As soon as connectivity returns, all transactions automatically sync to the cloud database with zero duplicates.',
    },
    {
      q: 'Will my WhatsApp account get banned for sending bills or reminders?',
      a: 'Never! GINIE connects directly via our high-speed native WhatsApp engine with dynamic pacing, humanized anti-spam intervals, and opt-out headers. Over 100,000+ transactional bills, OTPs, and payment reminders have been delivered safely across Indian businesses.',
    },
    {
      q: 'Can I connect my existing thermal receipt printer and barcode laser gun?',
      a: 'Yes! GINIE supports all standard 2-inch (58mm) and 3-inch (80mm) thermal printers (USB, Bluetooth, WiFi), standard A4 desktop printers, and all plug-and-play USB/Bluetooth barcode scanners with sub-50ms response time.',
    },
    {
      q: 'Can I export my accounting data to Tally or Excel?',
      a: 'Absolutely. GINIE provides one-click Tally XML export and complete Excel/CSV exports for sales, purchases, customer ledger (Khata), GST tax breakdowns (CGST/SGST/IGST), and inventory valuation.',
    },
    {
      q: 'How does the Free Core ERP plan work?',
      a: 'The Core Multi-Trade ERP, POS Counter, Digital Storefront, and Udhaar Khata are 100% Free forever. You can add unlimited products, print unlimited bills, and manage your inventory with zero hidden charges.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs md:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        <span>
          <strong>GINIE 2.0 Released:</strong> Multi-Trade ERP + Real-Time WhatsApp CRM is now Live for Bharat! 🇮🇳
        </span>
        <Link
          href={isLoggedIn ? '/dashboard' : '/register'}
          className="underline font-bold text-yellow-200 hover:text-white ml-2 inline-flex items-center gap-1"
        >
          Launch Free Cockpit <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Modern Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">GINIE</span>
                <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-blue-200 bg-blue-50 text-blue-700">
                  ERP & CRM
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 -mt-1 font-medium hidden sm:block">
                Smart Business OS for Bharat
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#trades" className="hover:text-blue-600 transition-colors">
              11-Trade ERP
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#storefront" className="hover:text-blue-600 transition-colors">
              Digital Store
            </a>
            <a href="#calculator" className="hover:text-blue-600 transition-colors">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Log In
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => router.push('/register')}
                  className="gap-1.5 shadow-blue-500/20"
                >
                  Start Free <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <a
              href="#trades"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              11-Trade ERP
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Features & POS
            </a>
            <a
              href="#storefront"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Digital Storefront
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-slate-700 hover:text-blue-600"
            >
              FAQ
            </a>
            <div className="pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => router.push('/register')}
                  >
                    Start Free Forever
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/20 to-indigo-300/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Multi-Trade POS • WhatsApp CRM • Digital Store • Udhaar Khata</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-5xl mx-auto">
            Supercharge Your Counter, Customers & WhatsApp{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              In One Lightning Cockpit.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Designed specifically for Indian Kiranas, Garages, Clinics, Restaurants, Salons, and Retailers.
            Barcode POS counter, zero-wait WhatsApp billing, automatic Udhaar khata reminders, and an instant online storefront.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
              className="w-full sm:w-auto text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all gap-2"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById('trades');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto text-base px-7 py-6 rounded-xl border-slate-300 hover:bg-white/80 shadow-sm gap-2"
            >
              Explore 11 Trades <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Credit Card Required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Offline POS Ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Core ERP Forever
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Made for Bharat 🇮🇳
            </span>
          </div>

          {/* Interactive Mock Dashboard Preview */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white shadow-2xl p-3 sm:p-4 md:p-6 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-3 text-xs font-semibold text-slate-400 hidden sm:inline">
                  https://ginie.space/erp/pos • Live Counter Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1 inline-block" />
                  Live Cloud Sync Active
                </Badge>
              </div>
            </div>

            {/* Simulated POS Cockpit UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Metric 1 */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Today's Counter Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">₹48,250.00</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  +18.4% vs yesterday (114 Bills)
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Khata Collected Today</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">₹14,800.00</div>
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  12 Customers settled via WhatsApp UPI
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>New WhatsApp Orders</span>
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">19 Orders</div>
                <div className="text-xs text-purple-600 font-semibold mt-1">
                  Auto-dispatched from Storefront
                </div>
              </div>
            </div>

            {/* Quick Live POS Action Bar Simulation */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <ScanBarcode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Ultra-Fast Barcode POS Counter</h4>
                  <p className="text-xs text-blue-100">
                    Supports USB Laser Guns, Smartphone Cameras, and Bluetooth Thermal Printers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold border-none"
                  onClick={() => router.push(isLoggedIn ? '/erp' : '/register')}
                >
                  Open POS Counter <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11 Trades Interactive Section */}
      <section id="trades" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="purple" className="mb-3 text-xs uppercase tracking-wider font-bold">
              Tailored For Every Trade
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One Smart Platform. 11 Specialized Trade Workflows.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              GINIE is not a one-size-fits-all generic tool. Select your business type to see the exact workflow and features tailored for you:
            </p>
          </div>

          {/* Trade Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center">
            {TRADES.map((trade) => {
              const Icon = trade.icon;
              const isSelected = selectedTrade.id === trade.id;
              return (
                <button
                  key={trade.id}
                  onClick={() => setSelectedTrade(trade)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{trade.name}</span>
                </button>
              );
            })}
          </div>

          {/* Trade Details Card */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Trade Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedTrade.color} text-white shadow-lg`}>
                    {React.createElement(selectedTrade.icon, { className: 'w-7 h-7' })}
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {selectedTrade.name}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      {selectedTrade.tagline}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {selectedTrade.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm sm:text-base text-slate-200 font-medium">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <Button
                    variant="gradient"
                    onClick={() => router.push(isLoggedIn ? '/erp' : '/register')}
                    className="gap-2"
                  >
                    Setup {selectedTrade.name} Now <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
                    onClick={() => router.push('/store/demo')}
                  >
                    Preview Online Store
                  </Button>
                </div>
              </div>

              {/* Right Column: Stats & Impact */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">
                  Measurable Impact for {selectedTrade.name}
                </h4>
                <div className="space-y-4">
                  {selectedTrade.mockStats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white/5 p-4 rounded-lg flex items-center justify-between border border-white/5"
                    >
                      <span className="text-sm text-slate-300 font-medium">{stat.label}</span>
                      <span className="text-xl font-black text-emerald-400">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>
                    Fully compatible with GST regulations, HSN codes, and local state tax laws.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Pillars */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3 text-xs uppercase tracking-wider font-bold">
              Complete Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Business Needs to Thrive
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              From physical counter checkout to digital WhatsApp promotions and B2B customer discovery:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ScanBarcode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Lightning POS & Barcode Counter
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scan via webcam or USB laser gun. Sub-50ms checkout, automatic stock depletion, quick shortcuts for loose items, and thermal receipt printing (58mm/80mm).
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> 100% Offline Bill Queue
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> Daybook Drawer Reconciliations
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                WhatsApp CRM & Auto-Reminders
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dispatch digital PDF bills, payment links with UPI QR, and automated birthday/festive discounts straight inside the CRM without switching windows.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Direct in-app WhatsApp dispatch
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Safe anti-ban delivery engine
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Lead Discovery Radar
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search and extract 500+ verified local B2B businesses and leads across any Indian city, pincode, or trade category to fuel your B2B sales pipeline.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" /> Verified phone numbers & addresses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Import to Contacts
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Digital Udhaar Khata & Ledger
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Say goodbye to paper bahi-khata. Record customer credit with a tap, send automatic WhatsApp reminders with pay-now links, and recover dues 35% faster.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" /> Dynamic UPI Payment QR in bills
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" /> Customer balance PDF statements
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Free Digital E-Commerce Storefront
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Launch a public online catalog at <code>ginie.space/store/your-shop</code> in 30 seconds. Customers can browse on their phone and place orders straight to your WhatsApp.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-pink-600" /> Zero commission on orders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-pink-600" /> Custom branding & QR stickers
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                GST Invoices & Tally XML Export
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                100% compliant GST tax invoices (B2B & B2C), state-wise CGST/SGST/IGST breakdowns, HSN codes, and 1-click Tally XML sync for your accountant.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" /> GSTR-1 & GSTR-3B audit ready
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" /> Number to words conversion in INR
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI & Time Saved Calculator */}
      <section id="calculator" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="warning" className="mb-3 text-xs uppercase tracking-wider font-bold">
                Calculate Your Savings
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                How Much Time & Money Will You Save?
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base">
                Adjust your daily customer bill volume to see your projected monthly ROI:
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span>Daily Customer Volume:</span>
                  <span className="text-xl font-extrabold text-yellow-400">
                    {billVolume} Bills / Day
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={billVolume}
                  onChange={(e) => setBillVolume(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10 Bills</span>
                  <span>250 Bills</span>
                  <span>500+ Bills</span>
                </div>
              </div>

              {/* Result Cards */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 rounded-xl p-5 text-center border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                    Time Saved
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-400">
                    {hoursSavedPerMonth} Hrs
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Per month at the counter</div>
                </div>

                <div className="bg-white/10 rounded-xl p-5 text-center border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                    Direct Money Saved
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-black text-yellow-400">
                    ₹{moneySavedPerMonth.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Via Khata recovery & speed</div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                  className="w-full sm:w-auto px-8 py-5 text-base font-bold shadow-lg shadow-blue-500/30"
                >
                  Claim These Savings - Start Free <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="success" className="mb-3 text-xs uppercase tracking-wider font-bold">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Fair, Transparent & Bharat-Friendly
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Start with our 100% Free Core ERP and upgrade only when you need high-volume automated WhatsApp marketing:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Free Forever */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Starter / Retail
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">Core ERP Free</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ideal for single counter shops & emerging retailers.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-slate-500 text-sm font-semibold">/ forever</span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited POS Barcode Bills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Offline Queue & Local Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital Udhaar Khata (Customer Ledger)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free Digital Storefront Catalog</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thermal Printer & Scanner Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="outline"
                  className="w-full font-bold py-5"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                >
                  Start 100% Free
                </Button>
              </div>
            </div>

            {/* Plan 2: Pro Growth (Popular) */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-8 border-2 border-blue-600 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                MOST POPULAR FOR RETAILERS
              </div>

              <div>
                <Badge variant="default" className="mb-4">
                  Growth Pro
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">Automation Pro</h3>
                <p className="text-xs text-slate-500 mt-1">
                  For growing businesses wanting WhatsApp automation.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹999</span>
                  <span className="text-slate-500 text-sm font-semibold">/ month</span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Everything in Core ERP, plus:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Automated WhatsApp CRM & In-App Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>B2B Lead Discovery Radar (500 leads/mo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Customer Cashback & Loyalty Wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Tally XML & Advanced Excel Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Multi-Staff Permissions & Daybook audit</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="gradient"
                  className="w-full font-bold py-5 shadow-lg shadow-blue-500/25"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                >
                  Start 14-Day Free Pro Trial
                </Button>
              </div>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <Badge variant="purple" className="mb-4">
                  Multi-Branch
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">Enterprise HQ</h3>
                <p className="text-xs text-slate-500 mt-1">
                  For wholesalers, chains & multi-counter supermarkets.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹2,499</span>
                  <span className="text-slate-500 text-sm font-semibold">/ month</span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Everything in Pro, plus:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Multi-Branch Stock Transfers & Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Dedicated WhatsApp Gateway Instance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Unlimited Lead Discovery Queries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Priority WhatsApp & Telephonic Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="outline"
                  className="w-full font-bold py-5"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider font-bold">
              Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-600">
              Straightforward answers to the most common questions from Indian business owners:
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full py-4 px-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final High-Impact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-6 backdrop-blur">
            <HeartHandshake className="w-4 h-4 text-yellow-300" />
            <span>Empowering 10,000+ Indian Counter Businesses</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Transform Your Business Counter Today?
          </h2>

          <p className="mt-4 text-base sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Setup takes less than 60 seconds. Start scanning barcodes, printing receipts, and collecting payments right now.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-base px-9 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
            >
              Get Started Free Forever <ArrowRight className="w-5 h-5 ml-1 inline" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-bold text-base px-8 py-6 rounded-xl"
              onClick={() => router.push('/login')}
            >
              Existing User Login
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  G
                </div>
                <span className="font-extrabold text-lg text-white">GINIE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart Business OS for Bharat. 11-Trade ERP POS Counter, WhatsApp CRM, and Digital Storefront.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3">11-Trade ERP</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#trades" className="hover:text-white">Kirana & Supermarket</a></li>
                <li><a href="#trades" className="hover:text-white">Automobile Garage</a></li>
                <li><a href="#trades" className="hover:text-white">Clinic & Pharmacy</a></li>
                <li><a href="#trades" className="hover:text-white">Restaurant & Cafe</a></li>
                <li><a href="#trades" className="hover:text-white">Salon & Spa</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Capabilities</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white">Barcode POS Counter</Link></li>
                <li><Link href="/login" className="hover:text-white">WhatsApp Direct CRM</Link></li>
                <li><Link href="/login" className="hover:text-white">Lead Discovery Radar</Link></li>
                <li><Link href="/login" className="hover:text-white">Digital Udhaar Khata</Link></li>
                <li><Link href="/login" className="hover:text-white">Tally XML Export</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Register Business</Link></li>
                <li><a href="mailto:support@ginie.space" className="hover:text-white">support@ginie.space</a></li>
                <li><span className="text-emerald-400 font-semibold">● All Systems Operational</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              &copy; {new Date().getFullYear()} GINIE Technologies. All rights reserved.
            </div>
            <div>
              Built with ❤️ for Indian MSMEs & Retailers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
