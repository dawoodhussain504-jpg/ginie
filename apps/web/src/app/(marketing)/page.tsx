'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Compass,
  MessageSquare,
  Kanban,
  Receipt,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Star,
  MapPin,
  QrCode,
  ShieldCheck,
  Send,
  Zap,
  TrendingUp,
  CreditCard,
  Building2,
  Search,
  Check,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
  Clock,
  Briefcase,
  Share2,
  Lock,
  Wallet,
  Coins,
  Store,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Mock Lead Data for the interactive simulator
const SIMULATED_LEADS: Record<string, any[]> = {
  garages: [
    {
      name: 'SpeedX Multi-brand Auto Care',
      category: 'Car Repair & Service Center',
      phone: '+91 98201 44521',
      rating: 4.8,
      reviews: 142,
      location: 'Baner Main Road, Pune, Maharashtra',
      verified: true,
    },
    {
      name: 'Apex Motors & Spare Parts',
      category: 'Automobile Garage & Spares',
      phone: '+91 98920 11982',
      rating: 4.6,
      reviews: 89,
      location: 'Kothrud Industrial Area, Pune',
      verified: true,
    },
    {
      name: 'Shree Sai Car Service Station',
      category: 'Garage & Diagnostic Center',
      phone: '+91 97654 33210',
      rating: 4.9,
      reviews: 215,
      location: 'Wakad Bridge, Pune',
      verified: true,
    },
  ],
  clinics: [
    {
      name: 'Dr. Mehta Multi-Speciality Dental Clinic',
      category: 'Dental Clinic & Orthodontics',
      phone: '+91 98112 34567',
      rating: 4.9,
      reviews: 310,
      location: 'South Extension Part II, New Delhi',
      verified: true,
    },
    {
      name: 'Sanjeevani Poly Clinic & Lab',
      category: 'Diagnostic & Medical Centre',
      phone: '+91 98710 99882',
      rating: 4.7,
      reviews: 124,
      location: 'Lajpat Nagar 4, New Delhi',
      verified: true,
    },
    {
      name: 'Apollo Dental & Aesthetic Care',
      category: 'Dental & Cosmetic Clinic',
      phone: '+91 99100 22119',
      rating: 4.8,
      reviews: 178,
      location: 'Dwarka Sector 12, New Delhi',
      verified: true,
    },
  ],
  wholesalers: [
    {
      name: 'Mahalaxmi Hardware & Electricals Wholesale',
      category: 'Hardware & Pipe Distributor',
      phone: '+91 98240 55661',
      rating: 4.7,
      reviews: 94,
      location: 'Relief Road, Ahmedabad, Gujarat',
      verified: true,
    },
    {
      name: 'Gujarat Steel & Sanitary Traders',
      category: 'B2B Building Materials',
      phone: '+91 98980 44321',
      rating: 4.8,
      reviews: 167,
      location: 'Changodar GIDC, Ahmedabad',
      verified: true,
    },
    {
      name: 'Arihant Electric & Cable Supply Co.',
      category: 'Industrial Electrical Distributor',
      phone: '+91 97230 11228',
      rating: 4.9,
      reviews: 112,
      location: 'Sarkhej Bavla Highway, Ahmedabad',
      verified: true,
    },
  ],
};

export default function MarketingLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lead Simulator State
  const [simCategory, setSimCategory] = useState<'garages' | 'clinics' | 'wholesalers'>('garages');
  const [simCity, setSimCity] = useState('Pune');
  const [simScanning, setSimScanning] = useState(false);
  const [simResults, setSimResults] = useState<any[]>(SIMULATED_LEADS.garages);

  // ROI Calculator State
  const [leadsPerMonth, setLeadsPerMonth] = useState<number>(300);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ginie_token');
      if (token) setIsLoggedIn(true);
    }
  }, []);

  const handleRunSimulator = (cat: 'garages' | 'clinics' | 'wholesalers', city: string) => {
    setSimCategory(cat);
    setSimCity(city);
    setSimScanning(true);
    setTimeout(() => {
      setSimResults(SIMULATED_LEADS[cat]);
      setSimScanning(false);
    }, 600);
  };

  // Projected ROI Calculation based on lead conversion
  const dealsClosed = Math.max(1, Math.round(leadsPerMonth * 0.05));
  const avgDealValue = 8500;
  const projectedRevenue = dealsClosed * avgDealValue;

  const faqs = [
    {
      q: 'How does the GINIE Maps Lead Discovery Radar find phone numbers?',
      a: 'GINIE Maps directly connects to live local verified business directories and geographic data across 500+ Indian cities and pin codes. When you search for any niche (e.g. "Car Garages in Pune" or "Plywood Wholesalers in Surat"), GINIE Maps extracts verified mobile/landline numbers, physical shop addresses, star ratings, and review counts with 1 click.',
    },
    {
      q: 'Will my WhatsApp account get banned for messaging leads from CRM?',
      a: 'No! GINIE connects using a native multi-device WhatsApp bridge with anti-ban pacing intervals (15-30s humanized pauses), opt-out headers, and pre-formatted conversational greeting scripts. You send direct one-to-one chats without spamming broadcast lists.',
    },
    {
      q: 'Do I have to save customer phone numbers on my mobile phonebook first?',
      a: 'Never! That is one of GINIE’s biggest superpowers. You can launch one-click direct WhatsApp chats with any customer or newly discovered prospect straight from your computer or phone browser without adding them to your phone contacts.',
    },
    {
      q: 'How does the ₹599 Lead Discovery plan work? Is there an auto-debit trap?',
      a: 'Zero auto-debit trap! Unlike foreign SaaS platforms that demand credit cards and charge you automatically every month, GINIE uses Bharat’s UPI QR payment. When you need fresh business leads, scan the ₹599 UPI QR code, enter your UTR, and your radar is instantly activated for 30 days. No recurring charges ever.',
    },
    {
      q: 'What is included in the 100% Free Core CRM plan?',
      a: 'The Core CRM is 100% free forever: Unlimited client contacts, Visual Drag-and-Drop Sales Pipeline Kanban (in ₹), Follow-up Tasks, One-Click WhatsApp Outreach, Professional GST Invoices with Dynamic UPI QR codes, Customer Loyalty Wallets, and Digital Storefront.',
    },
    {
      q: 'Can my field sales executives use GINIE on their mobile phones?',
      a: 'Yes, 100%! GINIE is built with a responsive mobile-first architecture and includes GPS Satellite Field Check-ins. When an executive visits a client shop, they tap "Check-in" to log their verified GPS coordinates and timestamp directly into the CRM deal activity stream.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
        <span>
          <strong>GINIE 2.0 Live:</strong> GINIE Maps Lead Radar + Direct WhatsApp CRM + Dynamic UPI Invoicing! 🇮🇳
        </span>
        <Link
          href={isLoggedIn ? '/dashboard' : '/register'}
          className="ml-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 hover:text-white px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 shrink-0 no-underline transition-colors"
        >
          Launch Free Cockpit <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Modern Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group no-underline">
            <div className="w-9 h-9 relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="GINIE Logo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              GINIE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-700">
            <a href="#radar" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
              Lead Discovery
            </a>
            <a href="#whatsapp" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
              WhatsApp CRM
            </a>
            <a href="#pipeline" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
              Sales Pipeline
            </a>
            <a href="#invoicing" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
              UPI Invoicing
            </a>
            <a href="#pricing" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
              Pricing (₹0 / ₹599)
            </a>
            <a href="#faq" className="text-slate-700 hover:text-blue-600 no-underline transition-colors py-1">
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
                className="gap-2 font-semibold"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="font-medium text-slate-700 hover:text-slate-900"
                >
                  Log In
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => router.push('/register')}
                  className="gap-1.5 shadow-blue-500/20 font-semibold"
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
              href="#radar"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 border-b border-slate-100 no-underline transition-colors"
            >
              GINIE Maps Lead Radar
            </a>
            <a
              href="#whatsapp"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 border-b border-slate-100 no-underline transition-colors"
            >
              Direct WhatsApp CRM
            </a>
            <a
              href="#pipeline"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 border-b border-slate-100 no-underline transition-colors"
            >
              Sales Pipeline & Tasks
            </a>
            <a
              href="#invoicing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 border-b border-slate-100 no-underline transition-colors"
            >
              Dynamic UPI Invoicing
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 border-b border-slate-100 no-underline transition-colors"
            >
              Pricing (₹0 / ₹599)
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-base font-medium text-slate-800 hover:text-blue-600 no-underline transition-colors"
            >
              FAQ
            </a>
            <div className="pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Button
                  variant="gradient"
                  className="w-full font-semibold"
                  onClick={() => router.push('/dashboard')}
                >
                  Open CRM Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full font-medium"
                    onClick={() => router.push('/login')}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="gradient"
                    className="w-full font-semibold"
                    onClick={() => router.push('/register')}
                  >
                    Start Free CRM Forever
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
        {/* Decorative blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/20 to-indigo-300/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>GINIE Maps Lead Radar • Direct WhatsApp CRM • Deals Pipeline • UPI Billing</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] max-w-5xl mx-auto">
            Find High-Intent Leads on GINIE Maps, Close Deals on WhatsApp{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              In One Smart Cockpit.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Built specifically for Indian Wholesalers, Distributors, Agencies, Freelancers & Growing MSMEs.
            Extract verified business numbers across 500+ cities, launch WhatsApp chats without saving contacts,
            and collect payments with Dynamic UPI QR Invoices.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
              className="w-full sm:w-auto text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all gap-2 font-semibold"
            >
              Launch Free CRM Cockpit <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById('radar-simulator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto text-base px-7 py-6 rounded-xl border-slate-300 hover:bg-white/80 shadow-sm gap-2 font-medium"
            >
              Try Live Lead Simulator <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust Points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Core CRM Forever
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Contact-Saving Needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dynamic UPI QR (GPay / PhonePe)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Made for Bharat 🇮🇳
            </span>
          </div>

          {/* Realistic CRM Cockpit Visual Preview */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white shadow-xl p-4 sm:p-6 backdrop-blur text-left">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-3 text-xs font-medium text-slate-400 hidden sm:inline">
                  https://ginie.space/dashboard • Business Growth Cockpit
                </span>
              </div>
              <Badge variant="success" className="text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1 inline-block" />
                Real-Time Cloud Sync
              </Badge>
            </div>

            {/* Simulated 4-Zone Cockpit Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: GINIE Maps Radar */}
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Lead Radar</span>
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">548 Leads</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    Verified via GINIE Maps (Pune)
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-700 font-medium">
                  <span>Direct Mobile Verified</span>
                  <span>98%</span>
                </div>
              </div>

              {/* Card 2: WhatsApp Outreach */}
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>WhatsApp CRM</span>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">142 Chats</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">
                    Sent without saving contacts
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                  <span>Baileys Bridge Paired</span>
                  <span className="text-emerald-700 font-semibold">Active ●</span>
                </div>
              </div>

              {/* Card 3: Active Deals Pipeline */}
              <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Sales Pipeline</span>
                    <Kanban className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">₹3,45,000</div>
                  <div className="text-xs text-purple-600 font-medium mt-1">
                    18 Deals in negotiation stage
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200/60 flex items-center justify-between text-[11px] text-purple-700 font-medium">
                  <span>Won this month</span>
                  <span className="font-semibold text-emerald-600">₹1,85,000</span>
                </div>
              </div>

              {/* Card 4: UPI Invoices & Khata */}
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Dynamic UPI Invoices</span>
                    <Receipt className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">₹42,800</div>
                  <div className="text-xs text-amber-700 font-medium mt-1">
                    Settled via PhonePe / GPay QR
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800 font-medium">
                  <span>Pending Khata Recovered</span>
                  <span className="font-semibold">+35%</span>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="mt-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Need New Local Business Clients in Your City?</h4>
                  <p className="text-xs text-slate-300 font-normal">
                    Search any niche across 500+ cities and get verified mobile numbers right now.
                  </p>
                </div>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  const el = document.getElementById('radar-simulator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-semibold whitespace-nowrap"
              >
                Try Lead Radar Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive GINIE Maps Lead Radar Simulator */}
      <section id="radar-simulator" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="default" className="mb-3 text-xs uppercase tracking-wider font-semibold">
              Interactive Live Demo
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Test GINIE Maps Lead Radar Live
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
              Select an industry category and see how GINIE extracts verified business numbers, ratings, and addresses in real-time:
            </p>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-100/90 rounded-2xl p-3 sm:p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => handleRunSimulator('garages', 'Pune')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  simCategory === 'garages'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Car Garages (Pune)
              </button>

              <button
                onClick={() => handleRunSimulator('clinics', 'New Delhi')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  simCategory === 'clinics'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Dental Clinics (New Delhi)
              </button>

              <button
                onClick={() => handleRunSimulator('wholesalers', 'Ahmedabad')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  simCategory === 'wholesalers'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hardware Wholesalers (Ahmedabad)
              </button>
            </div>

            <Button
              variant="gradient"
              size="sm"
              disabled={simScanning}
              onClick={() => handleRunSimulator(simCategory, simCity)}
              className="gap-1.5 font-semibold text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              {simScanning ? 'Scanning GINIE Maps...' : `Scan ${simCity}`}
            </Button>
          </div>

          {/* Results List */}
          <div className="mt-6 space-y-4">
            {simResults.map((lead, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-slate-900">{lead.name}</span>
                    <Badge variant="success" className="text-[10px] font-semibold">
                      Verified Phone
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-normal flex-wrap">
                    <span className="text-blue-600 font-medium">{lead.category}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {lead.rating} ({lead.reviews} reviews)
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" /> {lead.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lead.phone}</span>
                  </a>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => router.push(isLoggedIn ? '/whatsapp' : '/register')}
                    className="gap-1.5 font-semibold text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Pitch</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(isLoggedIn ? '/customers' : '/register')}
                    className="gap-1 font-medium text-xs hidden sm:flex"
                  >
                    <Users className="w-3.5 h-3.5" /> Import
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Import to CRM CTA */}
          <div className="mt-8 text-center bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-slate-900">
              Want 500+ Verified Leads in Your Niche Right Now?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto font-normal">
              Our real GINIE Maps Discovery Radar searches any Indian city or pincode. Import leads directly into your Sales Pipeline and launch WhatsApp chats in 1 click.
            </p>
            <div className="mt-4">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => router.push(isLoggedIn ? '/find-customers' : '/register')}
                className="gap-2 font-semibold px-8 shadow-md shadow-blue-500/25"
              >
                Access Full Lead Discovery Radar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 True Core Pillars of GINIE */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3 text-xs uppercase tracking-wider font-semibold">
              The 4 Pillars
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Built Exactly For How Indian Business Gets Done
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-normal">
              Forget heavy American enterprise software. GINIE gives you the exact tools you need to find customers, message them on WhatsApp, track deals, and get paid via UPI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: GINIE Maps Lead Discovery Radar */}
            <div id="radar" className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  GINIE Maps Lead Discovery Radar
                </h3>
                <Badge variant="default" className="text-[10px] font-semibold">
                  ₹599 / Mo
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Search local businesses across 500+ Indian cities and pincodes. Extract verified direct mobile numbers, star ratings, addresses, and review counts.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-normal pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> Search any category: Garages, Clinics, Wholesalers, Gyms, Cafes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> 1-Click Import into your Sales Pipeline & Deals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" /> Simple ₹599 one-time UPI payment when you need leads — zero auto-debit
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href={isLoggedIn ? '/find-customers' : '/register'}
                  className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Explore Lead Radar &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 2: In-App WhatsApp CRM */}
            <div id="whatsapp" className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Direct In-App WhatsApp Outreach
                </h3>
                <Badge variant="success" className="text-[10px] font-semibold">
                  100% Free Core
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Message prospects and clients directly without ever saving their phone numbers to your mobile contact list. Native Baileys QR code pairing bridge.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-normal pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Launch chats instantly without cluttering phone contacts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> High-converting pre-built Hindi & English pitch scripts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Automated win-back broadcasts for inactive customers
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href={isLoggedIn ? '/whatsapp' : '/register'}
                  className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Explore WhatsApp CRM &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 3: Visual Sales Pipeline & GPS Tasks */}
            <div id="pipeline" className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Kanban className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Visual Sales Pipeline & GPS Tasks
                </h3>
                <Badge variant="purple" className="text-[10px] font-semibold">
                  100% Free Core
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Never let an inquiry slip away. Drag-and-drop deals across sales stages in Indian Rupees (₹), track pending follow-ups, and log field staff check-ins.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-normal pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" /> Visual Kanban Board: Lead In ➔ Contacted ➔ Proposal ➔ Won
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" /> GPS Satellite Field Check-ins with verified timestamps
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" /> Daily follow-up task calendar & priority alerts
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href={isLoggedIn ? '/sales' : '/register'}
                  className="text-xs sm:text-sm font-semibold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                >
                  Explore Sales Pipeline &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 4: GST Invoicing & Dynamic UPI QR */}
            <div id="invoicing" className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  GST Invoicing & Dynamic UPI QR
                </h3>
                <Badge variant="warning" className="text-[10px] font-semibold">
                  100% Free Core
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Generate professional GST invoices in 10 seconds. Automatically embeds your dynamic PhonePe / GPay / Paytm QR code for instant payment collection.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-normal pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700 shrink-0" /> Dynamic UPI QR Code generated on every bill for 1-tap payment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700 shrink-0" /> Automatic Indian Number-to-Words in INR (e.g. "Twelve Thousand Only")
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-700 shrink-0" /> 1-Click WhatsApp PDF dispatch straight to client’s chat
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href={isLoggedIn ? '/billing' : '/register'}
                  className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
                >
                  Explore UPI Invoicing &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI & Revenue Projection Calculator */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="warning" className="mb-3 text-xs uppercase tracking-wider font-semibold">
                Projected Business Growth
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                How Much New Revenue Can GINIE Generate?
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base font-normal">
                Slide to select how many local business leads you want to contact each month:
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-2">
                  <span>Target Leads Reached Monthly:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {leadsPerMonth} Leads / Month
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={leadsPerMonth}
                  onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-normal">
                  <span>50 Leads</span>
                  <span>500 Leads</span>
                  <span>1000+ Leads</span>
                </div>
              </div>

              {/* Projections */}
              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="bg-white/10 rounded-xl p-5 text-center border border-white/10 backdrop-blur">
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                    Expected New Deals
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-bold text-emerald-400">
                    {dealsClosed} Deals
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-normal">at typical 5% conversion</div>
                </div>

                <div className="bg-white/10 rounded-xl p-5 text-center border border-white/10 backdrop-blur">
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">
                    Projected Revenue
                  </div>
                  <div className="mt-2 text-3xl sm:text-4xl font-bold text-yellow-400">
                    ₹{projectedRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-normal">based on ₹8.5K avg deal</div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                  className="w-full sm:w-auto px-9 py-6 text-base font-semibold shadow-xl shadow-blue-500/30"
                >
                  Start Closing Deals Today <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest 2-Tier Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="success" className="mb-3 text-xs uppercase tracking-wider font-semibold">
              Transparent & Bharat-Friendly
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Simple 2-Tier Pricing. Zero Hidden Fees.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-normal">
              The entire Core CRM is 100% free forever. Pay only ₹599 once via UPI QR when you want fresh GINIE Maps leads:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Tier 1: Core Growth CRM (Free Forever) */}
            <div className="bg-white rounded-2xl p-8 sm:p-9 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <Badge variant="secondary" className="mb-4 font-semibold text-xs">
                  Free Forever Plan
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">Core Growth CRM</h3>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Ideal for business owners, sales teams & freelancers.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">₹0</span>
                  <span className="text-slate-500 text-sm font-medium">/ lifetime free</span>
                </div>

                <div className="mt-7 space-y-3.5 text-xs sm:text-sm text-slate-700 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Client Contacts & Accounts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Visual Drag-and-Drop Sales Pipeline Kanban (in ₹)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct WhatsApp Web Outreach (No saving numbers)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GST Invoices with Dynamic UPI QR Code (PhonePe/GPay)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer 360° Timeline & Loyalty Wallets</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital Storefront Catalog for WhatsApp Orders</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="outline"
                  className="w-full font-semibold py-6 text-sm"
                  onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                >
                  Start Free CRM Forever
                </Button>
              </div>
            </div>

            {/* Tier 2: Lead Discovery Radar Add-on */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-8 sm:p-9 border-2 border-blue-600 shadow-lg flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                RECOMMENDED FOR ACTIVE PROSPECTING
              </div>

              <div>
                <Badge variant="default" className="mb-4 font-semibold text-xs">
                  Pay-As-You-Go Add-on
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">Lead Discovery Radar</h3>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Extract 500+ verified local B2B phone numbers every month.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">₹599</span>
                  <span className="text-slate-500 text-sm font-medium">/ month (Pay via UPI QR)</span>
                </div>

                <div className="mt-7 space-y-3.5 text-xs sm:text-sm text-slate-700 font-normal">
                  <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Everything in Core Free CRM, plus:</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Unlimited GINIE Maps local business searches</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Verified direct mobile numbers, star ratings & addresses</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1-Click Bulk Import into CRM Leads & Pipelines</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Zero Credit Card Requirement (Pay directly via UPI)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Zero recurring auto-debit surprise charges</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="gradient"
                  className="w-full font-semibold py-6 text-sm shadow-md shadow-blue-500/25"
                  onClick={() => router.push(isLoggedIn ? '/find-customers' : '/register')}
                >
                  Activate Lead Radar via UPI
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
            <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider font-semibold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Honest Answers to Common Questions
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-normal">
              Everything you need to know about GINIE, lead data, WhatsApp anti-ban, and UPI payments:
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
                    className="w-full py-4 px-5 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-6 backdrop-blur">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Setup Takes Less Than 30 Seconds</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Ready to Supercharge Your B2B Sales Pipeline?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal">
            Start discovering new customers, sending direct WhatsApp pitches, and collecting payments with UPI QR right now.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-base px-9 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
            >
              Get Started Free Forever <ArrowRight className="w-5 h-5 ml-1 inline" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-8 py-6 rounded-xl"
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="GINIE Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-lg text-white">GINIE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Smart B2B Growth OS for Bharat. GINIE Maps Lead Discovery Radar, Direct WhatsApp CRM, and Dynamic UPI Invoicing.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Core Modules</h4>
              <ul className="space-y-2 text-xs font-normal">
                <li><Link href="/find-customers" className="hover:text-white">GINIE Maps Lead Radar</Link></li>
                <li><Link href="/whatsapp" className="hover:text-white">Direct WhatsApp CRM</Link></li>
                <li><Link href="/sales" className="hover:text-white">Sales Deals Kanban (₹)</Link></li>
                <li><Link href="/billing" className="hover:text-white">Dynamic UPI QR Invoices</Link></li>
                <li><Link href="/customers" className="hover:text-white">Customer Loyalty & Wallets</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Pricing & Plans</h4>
              <ul className="space-y-2 text-xs font-normal">
                <li><a href="#pricing" className="hover:text-white">Core CRM (₹0 Free Forever)</a></li>
                <li><a href="#pricing" className="hover:text-white">Lead Radar (₹599 / Mo via UPI)</a></li>
                <li><Link href="/store/catalog" className="hover:text-white">Digital Storefront Demo</Link></li>
                <li><a href="#radar-simulator" className="hover:text-white">Live Lead Simulator</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support & Legal</h4>
              <ul className="space-y-2 text-xs font-normal">
                <li><a href="tel:7870819862" className="hover:text-white flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> +91 78708 19862</a></li>
                <li><a href="mailto:support@ginie.space" className="hover:text-white">support@ginie.space</a></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-normal">
            <div>
              &copy; {new Date().getFullYear()} GINIE Technologies. All rights reserved.
            </div>
            <div>
              Proudly Built with ❤️ for Indian MSMEs, Distributors & Traders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
