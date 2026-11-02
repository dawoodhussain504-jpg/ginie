'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Collapse,
  Badge,
  Divider,
  Slider,
  Modal,
  Select,
  Tooltip,
  Input,
} from 'antd';
import {
  WhatsAppOutlined,
  CompassOutlined,
  UsergroupAddOutlined,
  FundProjectionScreenOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  StarFilled,
  ThunderboltFilled,
  QrcodeOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  ApartmentOutlined,
  CheckOutlined,
  FireFilled,
  SmileOutlined,
  RocketFilled,
  LockOutlined,
  GlobalOutlined,
  PhoneOutlined,
  CloseOutlined,
  MessageOutlined,
  CalculatorOutlined,
  DollarCircleOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MarketingLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState('clinics');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive Live Demo Playground State
  const [demoCity, setDemoCity] = useState('Mumbai');
  const [demoCategory, setDemoCategory] = useState('clinics');
  const [demoWhatsAppModal, setDemoWhatsAppModal] = useState(false);
  const [selectedDemoLead, setSelectedDemoLead] = useState<any>(null);

  // ROI Calculator State
  const [monthlyInquiries, setMonthlyInquiries] = useState(120);
  const [avgTicketSize, setAvgTicketSize] = useState(2500);

  // Live Activity Ticker State
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  // Ticker rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev: number) => (prev + 1) % 5);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const liveTickerEvents = [
    { name: 'Rajesh Sharma', city: 'Jaipur', action: 'created a Free CRM Workspace', time: '2m ago', color: '#10b981' },
    { name: 'Royal Auto Spares', city: 'Pune', action: 'unlocked Google Maps Lead Discovery', time: '5m ago', color: '#2563eb' },
    { name: 'Dr. Vikram Verma Dental', city: 'Patna', action: 'sent 18 WhatsApp appointment reminders', time: '9m ago', color: '#0ea5e9' },
    { name: 'FitZone Academy', city: 'Ahmedabad', action: 'collected ₹14,500 via UPI QR Code', time: '14m ago', color: '#f59e0b' },
    { name: 'Apex Logistics & Freight', city: 'Indore', action: 'added 4 sales team members', time: '18m ago', color: '#8b5cf6' },
  ];

  const sampleLeadsData: Record<string, any[]> = {
    clinics: [
      {
        name: 'Apex Dental Care & Implant Studio',
        area: 'Bandra West',
        rating: 4.9,
        reviews: 142,
        phone: '+91 98201 44210',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste Dr. Sharma! I came across Apex Dental Care on Google Maps in ${city}. We help dental clinics automate patient appointment reminders and 5-star Google review links over WhatsApp. Can I share a quick 1-minute video demo?`,
      },
      {
        name: 'SmileCraft Multispeciality Dental',
        area: 'Andheri East',
        rating: 4.8,
        reviews: 98,
        phone: '+91 98192 78310',
        quality: 'good',
        pitch: (city: string) =>
          `Hello! Reaching out from GINIE regarding patient management for SmileCraft in ${city}. How are you currently managing automated WhatsApp follow-ups after dental treatments? Happy to show you our 100% free system!`,
      },
      {
        name: 'City Care Polyclinic & Diagnostic',
        area: 'Dadar Central',
        rating: 4.7,
        reviews: 64,
        phone: '+91 98670 99214',
        quality: 'average',
        pitch: (city: string) =>
          `Hi Dr. Patil, noticed City Care Polyclinic on Google Maps. We provide a zero-cost WhatsApp appointment booking & billing system for clinics across ${city}. Would you like to test it out?`,
      },
    ],
    gyms: [
      {
        name: 'IronCore Strength & Crossfit Gym',
        area: 'Indiranagar / Metro Road',
        rating: 4.9,
        reviews: 210,
        phone: '+91 97410 88290',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste! Came across IronCore Gym in ${city}. We help gym owners collect 95%+ member fee renewals on time using automatic WhatsApp alerts with direct UPI QR codes. Can I share details?`,
      },
      {
        name: 'FitPulse 24/7 Wellness Club',
        area: 'Koramangala / Commercial St',
        rating: 4.8,
        reviews: 135,
        phone: '+91 98450 33912',
        quality: 'good',
        pitch: (city: string) =>
          `Hello Coach! Are you losing member renewals due to manual phone calling? GINIE sends automated WhatsApp payment reminders with UPI QR codes 3 days before expiry. Take a look at our free tool!`,
      },
      {
        name: 'PowerZone Fitness Studio',
        area: 'Whitefield Main Market',
        rating: 4.6,
        reviews: 78,
        phone: '+91 99001 55219',
        quality: 'average',
        pitch: (city: string) =>
          `Hi PowerZone Team! Reaching out regarding your fitness inquiries in ${city}. GINIE automates member attendance, GST receipts, and WhatsApp marketing campaigns for free!`,
      },
    ],
    hardware: [
      {
        name: 'Shree Balaji Sanitary & Hardware Mart',
        area: 'Loha Mandi / Industrial Area',
        rating: 4.9,
        reviews: 168,
        phone: '+91 94140 66201',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste Balaji Hardware! We noticed your store in ${city}. We provide a smart GST billing & quotation generator that sends bills with dynamic UPI QR codes directly to customers on WhatsApp. Free to use!`,
      },
      {
        name: 'Royal Electricals & Modular Fittings',
        area: 'Station Road Market',
        rating: 4.8,
        reviews: 84,
        phone: '+91 98290 77144',
        quality: 'good',
        pitch: (city: string) =>
          `Hello Sharma ji! Want to find 50+ local building contractors and electricians in ${city} via Google Maps? GINIE finds them in 1-click and lets you send WhatsApp rate lists instantly!`,
      },
      {
        name: 'Gupta Pipe & Plumbing Traders',
        area: 'Old City Bypass',
        rating: 4.6,
        reviews: 52,
        phone: '+91 94133 88120',
        quality: 'average',
        pitch: (city: string) =>
          `Namaste! Managing trader khata and outstanding udhaar in ${city}? GINIE sends automated WhatsApp payment reminders with your UPI QR code so you get paid faster!`,
      },
    ],
    cafes: [
      {
        name: 'The Roasted Bean Artisanal Cafe',
        area: 'Connaught Place / Civil Lines',
        rating: 4.9,
        reviews: 340,
        phone: '+91 98110 55214',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste Cafe Team! Reaching out in ${city}. Did you know you can collect 3x more 5-star Google reviews from your diners automatically over WhatsApp after their bill payment? Check out GINIE for free!`,
      },
      {
        name: 'Urban Crust Pizza & Bakery',
        area: 'South Ext / Park Street',
        rating: 4.8,
        reviews: 195,
        phone: '+91 98100 44920',
        quality: 'good',
        pitch: (city: string) =>
          `Hello! How is Urban Crust managing birthday offers and WhatsApp marketing for loyal foodies in ${city}? GINIE offers a 100% free CRM with WhatsApp broadcast engine!`,
      },
      {
        name: 'Chai Shai Bistro & Snacks',
        area: 'Boring Road / University Gate',
        rating: 4.7,
        reviews: 112,
        phone: '+91 93340 77190',
        quality: 'good',
        pitch: (city: string) =>
          `Hi there! Manage counter billing, GST receipts with UPI QR code, and customer contact directory in 1 simple app. GINIE is completely free forever for cafes!`,
      },
    ],
    realestate: [
      {
        name: 'Prime Landmark Realty & Advisory',
        area: 'Gachibowli / High Street',
        rating: 4.9,
        reviews: 156,
        phone: '+91 98480 33100',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste! Found Prime Realty in ${city}. Are you tired of losing 99acres and Magicbricks buyer leads? GINIE sends instant automated WhatsApp brochures and tracks deal stages visually!`,
      },
      {
        name: 'Heritage Homes & Property Consultants',
        area: 'Malviya Nagar / Scheme 10',
        rating: 4.8,
        reviews: 87,
        phone: '+91 98280 66290',
        quality: 'good',
        pitch: (city: string) =>
          `Hello! Wanted to check how your sales team in ${city} manages client property site visits? GINIE gives you a visual Kanban sales pipeline and WhatsApp scheduling for free!`,
      },
      {
        name: 'Sunrise Estates & Developers',
        area: 'Airport Road Hub',
        rating: 4.7,
        reviews: 49,
        phone: '+91 98350 22180',
        quality: 'good',
        pitch: (city: string) =>
          `Namaste! GINIE helps real estate agents in ${city} discover new local commercial businesses and shop owners on Google Maps for leasing and sales. Try it out!`,
      },
    ],
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ginie_token');
      const userStr = localStorage.getItem('ginie_user');
      if (token) {
        setIsLoggedIn(true);
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.isSuperAdmin) setIsSuperAdmin(true);
          } catch (_) {}
        }
      }
    }
  }, []);

  const industries: Record<
    string,
    { title: string; icon: React.ReactNode; badge: string; hook: string; points: string[] }
  > = {
    clinics: {
      title: 'Doctors & Dental Clinics',
      icon: <MedicineBoxOutlined style={{ fontSize: 24, color: '#0ea5e9' }} />,
      badge: 'Healthcare CRM',
      hook: 'Reduce patient no-shows by 75% and automate appointment follow-ups on WhatsApp.',
      points: [
        'Automated WhatsApp appointment confirmations & reminder pings',
        'Post-treatment follow-up & feedback message sequences',
        'Patient digital records with prescription and visit history',
        'Google Review link booster after successful consultation',
      ],
    },
    gyms: {
      title: 'Gyms & Fitness Centers',
      icon: <ThunderboltFilled style={{ fontSize: 24, color: '#f59e0b' }} />,
      badge: 'Fitness CRM',
      hook: 'Stop chasing members for fees. Collect 90%+ renewal payments on time.',
      points: [
        'Auto WhatsApp alert 3 days before membership expiry',
        'Direct UPI QR Code inside WhatsApp for 1-click renewal payment',
        'Diet plan & workout schedule broadcast engine',
        'Inactive member reactivation campaigns',
      ],
    },
    coaching: {
      title: 'Coaching & Tuitions',
      icon: <ReadOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />,
      badge: 'Education CRM',
      hook: 'Convert student inquiries into confirmed batch admissions in 24 hours.',
      points: [
        'Instant WhatsApp prospectus & fee structure delivery on inquiry',
        'Batch timing & test score reports to parents via WhatsApp',
        'Pending fee reminders with digital GST receipts',
        'Parent-teacher communication hub',
      ],
    },
    realestate: {
      title: 'Real Estate & High-Ticket B2B',
      icon: <ApartmentOutlined style={{ fontSize: 24, color: '#10b981' }} />,
      badge: 'B2B & Real Estate',
      hook: 'Close deals 3x faster with visual Kanban pipelines and automated site-visit alerts.',
      points: [
        'Google Maps lead discovery of property investors & buyers',
        'Property brochure PDF delivery on WhatsApp without saving numbers',
        'Site-visit scheduling & auto-reminder SMS/WhatsApp',
        'Stage-by-stage deal pipeline tracking up to final token closing',
      ],
    },
  };

  const faqItems = [
    {
      key: '1',
      label: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          Kya GINIE use karne se mera WhatsApp number ban hone ka risk hai?
        </span>
      ),
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
          Bilkul nahi! GINIE me built-in <strong>Smart Anti-Ban Pacing Algorithms</strong> hain jo messages ke beech human-like delay (3-8 seconds) maintain karte hain. Saath hi aap verified WhatsApp templates aur opt-in follow-ups bhejte hain, jisse aapka account completely safe rehta hai. Aap apna regular WhatsApp ya WhatsApp Business number link kar sakte hain.
        </Paragraph>
      ),
    },
    {
      key: '2',
      label: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          Google Maps Lead Discovery kaise kaam karta hai? Kya yeh legal hai?
        </span>
      ),
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
          Haan, yeh 100% legal aur public data hai. GINIE Google Maps par registered businesses ka publicly available information (Business Name, Address, Verified Phone Number, Ratings, aur Category) extract karke aapke CRM me 1-click me import kar deta hai. Aap sheher aur business type daalkar seconds me fresh leads pa sakte hain.
        </Paragraph>
      ),
    },
    {
      key: '3',
      label: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          Kya mujhe software chalane ke liye coding ya technical knowledge ki zaroorat hai?
        </span>
      ),
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
          Zero technical knowledge! GINIE ko khas taur par Indian business owners aur unki local teams ke liye design kiya gaya hai. Yeh Hindi aur English dono bhashao me chalta hai. Aap 2 minute me mobile ya laptop se phone number verify karke login kar sakte hain.
        </Paragraph>
      ),
    },
    {
      key: '4',
      label: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          GST Invoicing aur UPI Payments kaise kaam karti hain?
        </span>
      ),
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
          Aap GINIE se GST compliant estimate ya tax invoice bana sakte hain. Har invoice par aapka apna <strong>Dynamic UPI QR Code</strong> generate hota hai. Client seedha Google Pay, PhonePe, ya Paytm se scan karke payment karta hai. Paisa 100% direct aapke bank account me aata hai, GINIE koi transaction commission nahi leta.
        </Paragraph>
      ),
    },
    {
      key: '5',
      label: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          Agar mujhe koi problem aayi to support kaise milega?
        </span>
      ),
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
          Aapko direct VIP WhatsApp Support milta hai. Hamari team aapko onboarding, WhatsApp bridge setup, aur lead discovery guide karne ke liye hamesha WhatsApp par available rehti hai.
        </Paragraph>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ─── STICKY HEADER ──────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 20,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              }}
            >
              G
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  GINIE
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  India's #1 Local CRM
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: -2 }}>
                Lead Discovery &bull; WhatsApp &bull; Billing
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
            }}
            className="marketing-nav-desktop"
          >
            <a href="#features" style={{ color: '#475569', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
              Features
            </a>
            <a href="#discovery" style={{ color: '#475569', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
              Lead Discovery
            </a>
            <a href="#solutions" style={{ color: '#475569', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
              Industries
            </a>
            <a href="#pricing" style={{ color: '#475569', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
              Pricing
            </a>
            <a href="#faq" style={{ color: '#475569', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
              FAQs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <Space size="middle">
            {isLoggedIn ? (
              <Button
                type="primary"
                size="large"
                icon={<RocketFilled />}
                onClick={() => router.push(isSuperAdmin ? '/admin' : '/dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  borderColor: '#1d4ed8',
                  borderRadius: 10,
                  fontWeight: 700,
                  height: 44,
                  padding: '0 20px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                {isSuperAdmin ? 'Master Console ➔' : 'Go to Cockpit ➔'}
              </Button>
            ) : (
              <>
                <Button
                  size="large"
                  onClick={() => router.push('/login')}
                  style={{
                    fontWeight: 600,
                    borderRadius: 10,
                    height: 42,
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                  }}
                >
                  Log in
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltFilled />}
                  onClick={() => router.push('/register')}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: '#059669',
                    borderRadius: 10,
                    fontWeight: 700,
                    height: 42,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  Start Free Trial
                </Button>
              </>
            )}
          </Space>
        </div>
      </header>

      {/* ─── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #f0fdf4 0%, #f8fafc 50%, #ffffff 100%)',
          padding: '64px 20px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Top Announcement Pill */}
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 50,
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)',
              }}
            >
              <FireFilled style={{ color: '#10b981' }} />
              Google Maps Lead Scraper + Anti-Disconnect WhatsApp Engine Live
            </span>
          </div>

          {/* Big Headline */}
          <Title
            level={1}
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              margin: '0 0 20px',
            }}
          >
            Find Customers on Google Maps & Turn Them into{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Paying Clients on WhatsApp
            </span>
          </Title>

          {/* Subtitle */}
          <Paragraph
            style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: 780,
              margin: '0 auto 36px',
            }}
          >
            The all-in-one Growth CRM crafted for Indian business owners, clinics, gyms, coaching, and agencies.{' '}
            <strong>Zero coding. Instant WhatsApp Outreach. GST Invoicing with UPI QR.</strong>
          </Paragraph>

          {/* Dual CTAs */}
          <Space size="middle" wrap style={{ justifyContent: 'center', marginBottom: 48 }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => router.push('/register')}
              style={{
                height: 54,
                padding: '0 32px',
                fontSize: 17,
                fontWeight: 800,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                borderColor: '#047857',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              Start 14-Day Free Trial
            </Button>

            <a
              href="https://wa.me/918797186001?text=Hi%20GINIE%20Team!%20I%20want%20a%20live%20demo%20of%20GINIE%20CRM%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                size="large"
                icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />}
                style={{
                  height: 54,
                  padding: '0 28px',
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 12,
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                Chat on WhatsApp (+91 8797186001)
              </Button>
            </a>
          </Space>

          {/* Trust Metrics Pill Bar */}
          <Row gutter={[16, 16]} justify="center" style={{ maxWidth: 840, margin: '0 auto' }}>
            {[
              { text: '500+ Indian Businesses' },
              { text: '100% Data Sovereignty' },
              { text: 'Anti-Disconnect Engine' },
              { text: 'Direct UPI Settlement' },
            ].map((item, idx) => (
              <Col xs={12} sm={6} key={idx}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircleFilled style={{ color: '#10b981', fontSize: 16 }} />
                  {item.text}
                </div>
              </Col>
            ))}
          </Row>

          {/* Product Cockpit Visual Showcase */}
          <div
            style={{
              marginTop: 54,
              borderRadius: 20,
              padding: 12,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(16,185,129,0.15) 100%)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                borderRadius: 14,
                padding: '24px 20px',
                color: '#fff',
                textAlign: 'left',
              }}
            >
              {/* Window Controls Top Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #1e293b',
                  paddingBottom: 14,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#f59e0b' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#10b981' }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 12 }}>
                    GINIE Space &bull; Live Cockpit Preview (Patna / Delhi Hub)
                  </span>
                </div>
                <Tag color="green">● WhatsApp Bridge Live</Tag>
              </div>

              {/* 3 Split Panels Preview */}
              <Row gutter={[16, 16]}>
                {/* Panel 1: Lead Discovery */}
                <Col xs={24} md={8}>
                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid #334155',
                      height: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <CompassOutlined style={{ color: '#38bdf8', fontSize: 18 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
                        Google Maps Discovery
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#0f172a',
                        padding: 10,
                        borderRadius: 8,
                        fontSize: 12,
                        marginBottom: 10,
                        border: '1px solid #334155',
                      }}
                    >
                      🔍 <strong>Search:</strong> "Dental Clinics in Patna"
                    </div>
                    <div
                      style={{
                        background: '#0f172a',
                        padding: 10,
                        borderRadius: 8,
                        fontSize: 12,
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#38bdf8' }}>Dr. Vikram Verma Dental</div>
                      <div style={{ color: '#94a3b8' }}>+91 98350 XXXXX &bull; 4.9 ★ (128 reviews)</div>
                      <Tag color="blue" style={{ marginTop: 4, fontSize: 10 }}>
                        + Added to Pipeline
                      </Tag>
                    </div>
                    <div
                      style={{
                        background: '#0f172a',
                        padding: 10,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#38bdf8' }}>Apex Smile Studio</div>
                      <div style={{ color: '#94a3b8' }}>+91 87971 XXXXX &bull; 4.8 ★ (94 reviews)</div>
                    </div>
                  </div>
                </Col>

                {/* Panel 2: WhatsApp Outreach */}
                <Col xs={24} md={8}>
                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid #334155',
                      height: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
                        1-Click WhatsApp Chat
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#0f172a',
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: '#cbd5e1',
                        borderLeft: '3px solid #25D366',
                      }}
                    >
                      "Namaste Dr. Verma! We noticed your clinic on Google Maps. Here is your digital appointment
                      brochure & follow-up demo..."
                      <div style={{ textAlign: 'right', color: '#64748b', fontSize: 10, marginTop: 4 }}>
                        Delivered 10:42 AM &bull; Read ✓✓
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        padding: 8,
                        background: '#064e3b',
                        borderRadius: 6,
                        color: '#6ee7b7',
                        fontSize: 11,
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      ⚡ Instant Reply: "Interested! Send details."
                    </div>
                  </div>
                </Col>

                {/* Panel 3: Revenue & Deals */}
                <Col xs={24} md={8}>
                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid #334155',
                      height: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <FundProjectionScreenOutlined style={{ color: '#fbbf24', fontSize: 18 }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
                        Deal Won & GST Billing
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#0f172a',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>This Month Pipeline Won</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>₹ 1,45,000</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 8,
                        background: '#0f172a',
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: '#94a3b8' }}>Dynamic UPI QR:</span>
                      <Tag color="cyan">Scan & Pay Active</Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE LEAD DISCOVERY PLAYGROUND ────────────────────── */}
      <section
        id="discovery-simulator"
        style={{
          padding: '64px 20px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: '#eff6ff',
                padding: '4px 14px',
                borderRadius: 20,
                border: '1px solid #bfdbfe',
              }}
            >
              Live Interactive Simulator
            </span>
            <Title level={2} style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginTop: 12, marginBottom: 8 }}>
              Experience GINIE: Test-Drive Local Lead Search
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 16, maxWidth: 680, margin: '0 auto' }}>
              Apna city aur category select karke dekhein kaise GINIE seconds me verified local businesses, unke phone numbers aur 1-click WhatsApp pitch taiyaar karta hai:
            </Paragraph>
          </div>

          {/* City & Category Selectors */}
          <Card
            style={{
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1.5px solid #cbd5e1',
              marginBottom: 32,
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* City Selection Pills */}
              <div>
                <Text strong style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 10 }}>
                  1. SELECT CITY:
                </Text>
                <Space wrap size={[8, 8]}>
                  {['Mumbai', 'Delhi NCR', 'Patna', 'Jaipur', 'Bengaluru', 'Ahmedabad'].map((c) => (
                    <Button
                      key={c}
                      type={demoCity === c ? 'primary' : 'default'}
                      onClick={() => setDemoCity(c)}
                      style={{
                        borderRadius: 20,
                        fontWeight: 600,
                        background: demoCity === c ? '#2563eb' : '#f8fafc',
                        borderColor: demoCity === c ? '#2563eb' : '#cbd5e1',
                      }}
                    >
                      📍 {c}
                    </Button>
                  ))}
                </Space>
              </div>

              {/* Category Selection Pills */}
              <div>
                <Text strong style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 10 }}>
                  2. SELECT TARGET BUSINESS CATEGORY:
                </Text>
                <Space wrap size={[8, 8]}>
                  {[
                    { id: 'clinics', label: '🩺 Doctors & Dental Clinics' },
                    { id: 'gyms', label: '💪 Gyms & Fitness Centers' },
                    { id: 'hardware', label: '🔧 Hardware & Sanitary' },
                    { id: 'cafes', label: '☕ Cafes & Restaurants' },
                    { id: 'realestate', label: '🏢 Real Estate Agents' },
                  ].map((cat) => (
                    <Button
                      key={cat.id}
                      type={demoCategory === cat.id ? 'primary' : 'default'}
                      onClick={() => setDemoCategory(cat.id)}
                      style={{
                        borderRadius: 20,
                        fontWeight: 600,
                        background: demoCategory === cat.id ? '#10b981' : '#f8fafc',
                        borderColor: demoCategory === cat.id ? '#10b981' : '#cbd5e1',
                        color: demoCategory === cat.id ? '#fff' : '#334155',
                      }}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </Space>
              </div>
            </div>
          </Card>

          {/* Sample Search Results Cards */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <Tag color="blue" style={{ fontWeight: 600, fontSize: 13, padding: '4px 10px' }}>
                  Live Scraped Results in {demoCity}
                </Tag>
                <span style={{ fontSize: 13, color: '#64748b' }}>Showing 3 sample leads from Google Maps</span>
              </Space>
              <Tag color="green" icon={<CheckCircleFilled />}>
                Verified Numbers
              </Tag>
            </div>

            <Row gutter={[16, 16]}>
              {(sampleLeadsData[demoCategory] || sampleLeadsData.clinics).map((lead: any, idx: number) => (
                <Col xs={24} md={8} key={idx}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      height: '100%',
                      border: '1.5px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
                            {lead.name}
                          </Text>
                          <Tag color={lead.quality === 'good' ? 'success' : 'warning'} style={{ margin: 0, fontSize: 11 }}>
                            {lead.quality === 'good' ? '🟢 Verified' : '🟡 Active'}
                          </Tag>
                        </div>

                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                          📍 {lead.area}, {demoCity}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <StarFilled style={{ color: '#faad14', fontSize: 14 }} />
                          <strong style={{ fontSize: 14 }}>{lead.rating}</strong>
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>({lead.reviews} Google reviews)</span>
                        </div>

                        <div
                          style={{
                            background: '#f8fafc',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            marginBottom: 16,
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Space>
                            <PhoneOutlined style={{ color: '#16a34a' }} />
                            <Text strong code>{lead.phone}</Text>
                          </Space>
                          <Tag color="cyan">Direct Mobile</Tag>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        icon={<WhatsAppOutlined />}
                        block
                        onClick={() => {
                          setSelectedDemoLead({
                            ...lead,
                            city: demoCity,
                            pitchText: lead.pitch(demoCity),
                          });
                          setDemoWhatsAppModal(true);
                        }}
                        style={{
                          background: '#25D366',
                          borderColor: '#25D366',
                          fontWeight: 700,
                          height: 42,
                          borderRadius: 10,
                        }}
                      >
                        Test WhatsApp Pitch ➔
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Interactive CTA Banner */}
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1.5px dashed #93c5fd',
            }}
          >
            <Title level={4} style={{ margin: '0 0 8px', color: '#1e3a8a' }}>
              Want to export 500+ local leads in your city directly into your CRM?
            </Title>
            <Paragraph type="secondary" style={{ margin: '0 0 16px', fontSize: 14 }}>
              Core CRM is 100% Free Forever. Unlock unlimited Google Maps Discovery for just ₹599/month anytime.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<RocketFilled />}
              onClick={() => router.push('/register')}
              style={{
                height: 48,
                padding: '0 32px',
                borderRadius: 10,
                fontWeight: 700,
                background: '#2563eb',
                borderColor: '#2563eb',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              Create Free Account & Search My City ➔
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 2. WHY TRADITIONAL CRMs FAIL IN INDIA ────────────────────── */}
      <section style={{ padding: '80px 20px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              The Problem with Old CRMs
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 8 }}>
              Why Salesforce & HubSpot Don't Work for Indian SMBs
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 17, maxWidth: 650, margin: '0 auto' }}>
              Foreign CRMs charge in expensive Dollars ($), don't understand WhatsApp, have zero local lead discovery,
              and are too complicated for local staff.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 16,
                  border: '1px solid #fee2e2',
                  background: '#fff5f5',
                  height: '100%',
                }}
              >
                <Title level={4} style={{ color: '#b91c1c', marginBottom: 16 }}>
                  ❌ Traditional Foreign CRMs
                </Title>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'Costs $50 to $150 per user/month (Thousands of rupees drained)',
                    'Email-first system (Nobody reads marketing emails in India)',
                    'Third-party expensive WhatsApp plugins that disconnect frequently',
                    'Zero lead generation — you have to buy spam database lists',
                    'Complicated English menus that staff finds confusing',
                  ].map((t, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#7f1d1d', fontSize: 15 }}>
                      <span style={{ color: '#ef4444', fontWeight: 800 }}>✕</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 16,
                  border: '2px solid #10b981',
                  background: '#f0fdf4',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Title level={4} style={{ color: '#065f46', margin: 0 }}>
                    ✅ The GINIE Advantage
                  </Title>
                  <Tag color="green" style={{ fontWeight: 700 }}>Built for India 🇮🇳</Tag>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'Affordable transparent INR (₹) pricing with zero hidden dollar conversions',
                    'WhatsApp-first communication engine with 98% message open rate',
                    'Built-in Google Maps Lead Discovery — get 100+ fresh leads in 10 seconds',
                    'Dynamic UPI QR code on invoices — instant zero-fee settlement',
                    'Simple Hindi + English interface that any staff can master in 5 minutes',
                  ].map((t, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#065f46', fontSize: 15, fontWeight: 500 }}>
                      <CheckCircleFilled style={{ color: '#10b981', fontSize: 18 }} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* ─── ROI & PROFIT CALCULATOR ────────────────────────────────────── */}
      <section style={{ padding: '70px 20px', background: '#0f172a', color: '#fff' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 14px',
                borderRadius: 20,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              Interactive Profit Estimator
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', marginTop: 12 }}>
              Calculate How Much Revenue You Are Losing Every Month
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: 16, maxWidth: 680, margin: '0 auto' }}>
              Bina CRM ke lagbhag 35% customer inquiries follow-up na hone ki wajah se thandi pad jati hain. Dekhein GINIE aapki kitni bachat aur extra munafa karata hai:
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} align="middle">
            {/* Left Column: Sliders */}
            <Col xs={24} md={12}>
              <div style={{ background: '#1e293b', padding: 28, borderRadius: 20, border: '1px solid #334155' }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ color: '#f8fafc', fontSize: 15 }}>
                      Monthly Inquiries / Customers:
                    </Text>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                      {monthlyInquiries} inquiries
                    </span>
                  </div>
                  <Slider
                    min={20}
                    max={500}
                    step={10}
                    value={monthlyInquiries}
                    onChange={setMonthlyInquiries}
                    tooltip={{ open: false }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                    <span>20 (Solo practice)</span>
                    <span>250 (Mid-size)</span>
                    <span>500+ (High volume)</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ color: '#f8fafc', fontSize: 15 }}>
                      Average Order / Ticket Size:
                    </Text>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
                      ₹{avgTicketSize.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Space wrap style={{ marginTop: 8 }}>
                    {[
                      { label: '₹1,000 (Retail/Gym)', val: 1000 },
                      { label: '₹2,500 (Clinic/Coaching)', val: 2500 },
                      { label: '₹5,000 (Wholesale/Agency)', val: 5000 },
                      { label: '₹15,000 (High-Ticket)', val: 15000 },
                    ].map((tier) => (
                      <Button
                        key={tier.val}
                        size="small"
                        type={avgTicketSize === tier.val ? 'primary' : 'default'}
                        onClick={() => setAvgTicketSize(tier.val)}
                        style={{
                          borderRadius: 8,
                          fontWeight: 600,
                          background: avgTicketSize === tier.val ? '#10b981' : '#0f172a',
                          borderColor: avgTicketSize === tier.val ? '#10b981' : '#475569',
                          color: '#fff',
                        }}
                      >
                        {tier.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              </div>
            </Col>

            {/* Right Column: Calculated Gains */}
            <Col xs={24} md={12}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
                  padding: 32,
                  borderRadius: 20,
                  border: '1.5px solid #10b981',
                }}
              >
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Estimated Extra Revenue Recovered
                  </Text>
                  <div style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, color: '#10b981', lineHeight: 1.1, marginTop: 4 }}>
                    +₹{Math.round(monthlyInquiries * 0.35 * 0.35 * avgTicketSize).toLocaleString('en-IN')}
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#cbd5e1' }}> / month</span>
                  </div>
                  <Text style={{ color: '#cbd5e1', fontSize: 13, marginTop: 6, display: 'block' }}>
                    *Based on recovering ~{Math.round(monthlyInquiries * 0.35 * 0.35)} dropped leads with instant automated WhatsApp follow-ups.
                  </Text>
                </div>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <div style={{ background: '#1e293b', padding: 12, borderRadius: 10 }}>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>Time Saved / Month</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
                        ~{Math.round(monthlyInquiries * 0.2)} Hours
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: '#1e293b', padding: 12, borderRadius: 10 }}>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>GINIE Core CRM Cost</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>
                        ₹0 (100% Free)
                      </div>
                    </div>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<RocketFilled />}
                  onClick={() => router.push('/register')}
                  style={{
                    height: 48,
                    background: '#10b981',
                    borderColor: '#10b981',
                    fontWeight: 800,
                    fontSize: 16,
                    borderRadius: 10,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  Start Free CRM & Recover Lost Leads ➔
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ─── 3. THE 4 SUPERPOWERS ───────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              End-to-End Growth Engine
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 8 }}>
              Everything Your Business Needs to Grow Revenue
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 17, maxWidth: 650, margin: '0 auto' }}>
              Four integrated pillars that take your business from finding cold leads to collecting money in your bank account.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {/* Superpower 1 */}
            <Col xs={24} md={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  <CompassOutlined />
                </div>
                <Title level={4} style={{ fontSize: 18, marginBottom: 8 }}>
                  1. Google Maps Lead Discovery
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Select any Indian city, type category (Doctors, Gyms, Salons, Real Estate), and get 100+ verified
                  phone numbers, addresses, and ratings in 10 seconds.
                </Paragraph>
                <Tag color="blue">Instant Lead Scraping</Tag>
              </Card>
            </Col>

            {/* Superpower 2 */}
            <Col xs={24} md={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  <WhatsAppOutlined />
                </div>
                <Title level={4} style={{ fontSize: 18, marginBottom: 8 }}>
                  2. 1-Click WhatsApp Outreach
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Message verified leads without saving contacts to your phone. Use professional templates, auto-replies,
                  and follow-ups with Baileys keep-alive bridge.
                </Paragraph>
                <Tag color="green">Anti-Disconnect Protected</Tag>
              </Card>
            </Col>

            {/* Superpower 3 */}
            <Col xs={24} md={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  <FundProjectionScreenOutlined />
                </div>
                <Title level={4} style={{ fontSize: 18, marginBottom: 8 }}>
                  3. "Aaj Ka Kaam" Cockpit
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Visual Kanban board for deals (Hot, Warm, Cold). Subah 9 baje dekhne ko milta hai kis client ko call
                  karna hai taaki koi bhi deal slip na ho.
                </Paragraph>
                <Tag color="gold">Daily Task Reminder</Tag>
              </Card>
            </Col>

            {/* Superpower 4 */}
            <Col xs={24} md={12} lg={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  <QrcodeOutlined />
                </div>
                <Title level={4} style={{ fontSize: 18, marginBottom: 8 }}>
                  4. GST Billing & Instant UPI
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                  Generate professional GST invoices and send them as WhatsApp PDFs. Clients scan your dynamic UPI QR code
                  to pay instantly with 0% gateway commission.
                </Paragraph>
                <Tag color="purple">Direct Bank Settlement</Tag>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* ─── 4. INDUSTRY USE CASES ──────────────────────────────────────── */}
      <section id="solutions" style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Tailored For Your Niche
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 8 }}>
              Built for India's Fastest Growing Local Businesses
            </Title>
          </div>

          {/* Industry Tab Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 36,
            }}
          >
            {Object.keys(industries).map((key) => {
              const active = activeIndustry === key;
              return (
                <Button
                  key={key}
                  size="large"
                  onClick={() => setActiveIndustry(key)}
                  style={{
                    borderRadius: 30,
                    fontWeight: 600,
                    height: 46,
                    padding: '0 24px',
                    borderColor: active ? '#2563eb' : '#cbd5e1',
                    background: active ? '#2563eb' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    boxShadow: active ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                  }}
                >
                  {industries[key].title}
                </Button>
              );
            })}
          </div>

          {/* Selected Industry Display Box */}
          <Card
            style={{
              borderRadius: 20,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: 24,
            }}
          >
            <Row gutter={[32, 24]} align="middle">
              <Col xs={24} md={14}>
                <Tag color="blue" style={{ fontWeight: 700, marginBottom: 12 }}>
                  {industries[activeIndustry].badge}
                </Tag>
                <Title level={3} style={{ fontSize: 24, marginBottom: 12, color: '#0f172a' }}>
                  {industries[activeIndustry].hook}
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                  {industries[activeIndustry].points.map((pt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#334155' }}>
                      <CheckCircleFilled style={{ color: '#10b981', fontSize: 18 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </Col>
              <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 28,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{industries[activeIndustry].icon}</div>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Ready to 3x your {industries[activeIndustry].title.split('&')[0]} revenue?
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: 14 }}>
                    Start automated follow-ups & lead discovery today.
                  </Paragraph>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => router.push('/register')}
                    style={{
                      background: '#2563eb',
                      borderColor: '#2563eb',
                      borderRadius: 10,
                      fontWeight: 700,
                      height: 44,
                    }}
                  >
                    Start Free Industry Trial ➔
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </section>

      {/* ─── 5. PRICING SECTION ─────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: '#dcfce7',
                padding: '4px 14px',
                borderRadius: 20,
              }}
            >
              100% Free Core CRM + Impulse Add-on
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 12 }}>
              GINIE Core CRM is Completely Free. Forever.
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 17, maxWidth: 680, margin: '0 auto' }}>
              CRM, Sales Pipeline, Deals, WhatsApp Outreach aur Billing ke liye zero charges. Sirf jab aapko naye customers dhoondhne ke liye Google Maps data chahiye, tab simple ₹599/mo UPI add-on lein.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]} align="stretch" justify="center">
            {/* Tier 1: 100% Free Forever Core CRM */}
            <Col xs={24} md={12} lg={10}>
              <Card
                style={{
                  borderRadius: 20,
                  height: '100%',
                  border: '1.5px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <Tag color="blue" style={{ fontWeight: 700, fontSize: 12, padding: '2px 10px', marginBottom: 8 }}>
                    LIFETIME FREE
                  </Tag>
                  <Text strong style={{ fontSize: 22, color: '#0f172a', display: 'block' }}>
                    GINIE Core CRM
                  </Text>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    Ideal for Shopkeepers, Traders, Agencies, Clinics & Consultants
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: '#0f172a' }}>
                      ₹0
                    </span>
                    <span style={{ color: '#64748b', fontSize: 16 }}> / forever free</span>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {[
                    'Full Lead & Customer Management Directory',
                    'Visual Kanban Sales Pipeline with Custom Deal Stages',
                    '1-Click Direct WhatsApp Outreach to Customers',
                    'GST Quotations, Invoices & Dynamic UPI QR Codes',
                    'Daily Cockpit Tasks ("Aaj Ka Kaam")',
                    'Customer CSV Import & Export',
                    'Multi-User Team Collaboration',
                    'Zero Credit Card Required • Instant Free Signup',
                  ].map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#334155' }}>
                      <CheckCircleFilled style={{ color: '#16a34a' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  block
                  size="large"
                  onClick={() => router.push('/register')}
                  style={{
                    borderRadius: 12,
                    fontWeight: 700,
                    height: 48,
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    fontSize: 15,
                  }}
                >
                  Create Free CRM Account ➔
                </Button>
              </Card>
            </Col>

            {/* Tier 2: Google Maps Lead Discovery (Impulse Add-on) */}
            <Col xs={24} md={12} lg={10}>
              <Badge.Ribbon text="GROWTH ADD-ON" color="blue">
                <Card
                  style={{
                    borderRadius: 20,
                    height: '100%',
                    border: '2px solid #2563eb',
                    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <Tag color="cyan" style={{ fontWeight: 700, fontSize: 12, padding: '2px 10px', marginBottom: 8 }}>
                      POWERED BY GOOGLE MAPS
                    </Tag>
                    <Text strong style={{ fontSize: 22, color: '#0f172a', display: 'block' }}>
                      Find Customers (Lead Discovery)
                    </Text>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                      Unlock Unlimited Local B2B Leads in Your City & Area
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <span style={{ fontSize: 44, fontWeight: 900, color: '#2563eb' }}>
                        ₹599
                      </span>
                      <span style={{ color: '#64748b', fontSize: 16 }}> / month (Flat UPI)</span>
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    {[
                      'Live Google Maps Places Search in Any City / Pincode',
                      'Verified Shopkeeper, Doctor & Business Mobile Numbers',
                      'Direct WhatsApp Outreach Pitches & Pre-written Templates',
                      '1-Click Direct Import into CRM Pipeline & Deal Stages',
                      'Instant UPI QR Code Scan Payment (PhonePe, GPay, Paytm)',
                      'Fast Verification & Activation by Platform Admin',
                      'No auto-debit hassle — Pay only when you need new leads',
                    ].map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
                        <CheckCircleFilled style={{ color: '#2563eb' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => router.push(isLoggedIn ? '/find-customers' : '/register')}
                    style={{
                      borderRadius: 12,
                      fontWeight: 800,
                      height: 48,
                      fontSize: 15,
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      borderColor: '#1d4ed8',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    }}
                  >
                    {isLoggedIn ? 'Go to Find Customers (₹599) ➔' : 'Get Started Free & Unlock Leads ➔'}
                  </Button>
                </Card>
              </Badge.Ribbon>
            </Col>
          </Row>
        </div>
      </section>

      {/* ─── 6. SOCIAL PROOF / TESTIMONIALS ─────────────────────────────── */}
      <section style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Real Stories
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 8 }}>
              Loved by 500+ Indian Business Owners
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                name: 'Dr. Vikram Verma',
                role: 'Founder, Sunrise Dental Clinic, Patna',
                text: '“GINIE lene ke baad hamari patient follow-ups 3x improve ho gayi hain. Pehle receptionist bhool jati thi, ab WhatsApp automated reminders se patients time par aate hain aur review bhi dete hain!”',
                rating: 5,
              },
              {
                name: 'Rajesh Sharma',
                role: 'Owner, Apex Fitness Studio, Delhi NCR',
                text: '“Gym members se renewal mangna sabse mushkil kaam tha. GINIE ke expiry alert aur direct UPI QR code message se 90% payments 24 ghante me aa jati hain bina kisi awkward phone call ke.”',
                rating: 5,
              },
              {
                name: 'Priya Patel',
                role: 'Managing Director, Apex Media Solutions, Ahmedabad',
                text: '“Google Maps lead scraper hamari sales team ke liye lifesaver hai. Sheher select karo aur 10 seconds me 100 verified leads phone numbers ke saath spreadsheet me tayar!”',
                rating: 5,
              },
            ].map((t, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  style={{
                    borderRadius: 16,
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <StarFilled key={i} style={{ color: '#f59e0b', fontSize: 16, marginRight: 2 }} />
                    ))}
                  </div>
                  <Paragraph style={{ color: '#334155', fontSize: 15, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20 }}>
                    {t.text}
                  </Paragraph>
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 15, color: '#0f172a' }}>
                      {t.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t.role}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ─── 7. FAQ ACCORDION ───────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '80px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Frequently Asked Questions
            </span>
            <Title level={2} style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginTop: 8 }}>
              Got Questions? We Have Answers.
            </Title>
          </div>

          <Collapse
            items={faqItems}
            defaultActiveKey={['1']}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          />
        </div>
      </section>

      {/* ─── 8. FINAL HIGH-CONVERTING CTA BANNER ─────────────────────────── */}
      <section
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Title
            level={2}
            style={{
              color: '#ffffff',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900,
              margin: '0 0 16px',
            }}
          >
            Ready to 10x Your Local Business Sales?
          </Title>
          <Paragraph style={{ color: '#cbd5e1', fontSize: 18, lineHeight: 1.6, marginBottom: 36 }}>
            Join 500+ Indian doctors, gyms, institutes, and agencies who use GINIE to discover leads and close sales on WhatsApp autopilot.
          </Paragraph>

          <Space size="middle" wrap style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => router.push('/register')}
              style={{
                height: 54,
                padding: '0 36px',
                fontSize: 17,
                fontWeight: 800,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              Start Free 14-Day Trial Now
            </Button>

            <a
              href="https://wa.me/918797186001?text=Hi%20Dawood,%20I%20want%20to%20get%20started%20with%20GINIE%20CRM."
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                size="large"
                icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                style={{
                  height: 54,
                  padding: '0 28px',
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 12,
                  color: '#ffffff',
                  borderColor: '#475569',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Chat with Founder
              </Button>
            </a>
          </Space>
        </div>
      </section>

      {/* ─── 9. FOOTER ──────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#090d16',
          color: '#94a3b8',
          padding: '60px 20px 30px',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  G
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>GINIE</span>
              </div>
              <Paragraph style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
                India's leading Local CRM & WhatsApp outreach platform for doctors, clinics, gyms, coaching institutes,
                and high-ticket B2B agencies.
              </Paragraph>
              <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                📍 Proudly Built in India &bull; Sovereign Cloud Infrastructure
              </div>
            </Col>

            <Col xs={12} md={5}>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 14, fontSize: 14 }}>Product</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><a href="#discovery" style={{ color: '#94a3b8', textDecoration: 'none' }}>Lead Discovery</a></li>
                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>WhatsApp Outreach</a></li>
                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>GST Invoicing & UPI</a></li>
                <li><a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing Plans</a></li>
              </ul>
            </Col>

            <Col xs={12} md={5}>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 14, fontSize: 14 }}>Solutions</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <li><a href="#solutions" style={{ color: '#94a3b8', textDecoration: 'none' }}>For Clinics & Doctors</a></li>
                <li><a href="#solutions" style={{ color: '#94a3b8', textDecoration: 'none' }}>For Gyms & Fitness</a></li>
                <li><a href="#solutions" style={{ color: '#94a3b8', textDecoration: 'none' }}>For Coaching Classes</a></li>
                <li><a href="#solutions" style={{ color: '#94a3b8', textDecoration: 'none' }}>For Real Estate</a></li>
              </ul>
            </Col>

            <Col xs={24} md={6}>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 14, fontSize: 14 }}>Direct Contact</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
                <div>💬 WhatsApp: +91 8797186001</div>
                <div>✉️ Email: dawoodhussain504@gmail.com</div>
                <div>⏰ Support: 9:00 AM – 9:00 PM IST</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <a
                  href="https://wa.me/918797186001"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    size="small"
                    icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                    style={{
                      background: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Open Live WhatsApp Chat
                  </Button>
                </a>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: '#1e293b', margin: '36px 0 20px' }} />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <div>© {new Date().getFullYear()} GINIE CRM Space. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
              <Link href="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Security</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── 10. FLOATING WHATSAPP FOUNDER CHAT & WIDGETS ────────────────── */}
      {/* Live Social Proof Activity Ticker (Bottom-Left) */}
      {tickerVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 998,
            background: '#ffffff',
            borderRadius: 14,
            padding: '12px 16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            maxWidth: 340,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: liveTickerEvents[currentTickerIdx].color,
              boxShadow: `0 0 8px ${liveTickerEvents[currentTickerIdx].color}`,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>
            <strong>{liveTickerEvents[currentTickerIdx].name}</strong> ({liveTickerEvents[currentTickerIdx].city}){' '}
            <span style={{ color: '#475569' }}>{liveTickerEvents[currentTickerIdx].action}</span>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {liveTickerEvents[currentTickerIdx].time}
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined style={{ fontSize: 11, color: '#94a3b8' }} />}
            onClick={() => setTickerVisible(false)}
            style={{ padding: 0, width: 20, height: 20 }}
          />
        </div>
      )}

      {/* Floating Founder WhatsApp Chat (Bottom-Right) */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        <div
          style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid #334155',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#25D366', display: 'inline-block' }} />
          <span>Chat with Founder Dawood</span>
        </div>

        <a
          href="https://wa.me/918797186001?text=Namaste%20Dawood,%20mujhe%20GINIE%20CRM%20ke%20baare%20me%20jaankari%20chahiye."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 32,
            textDecoration: 'none',
            transition: 'transform 0.2s ease',
          }}
          title="Chat directly with Founder Dawood on WhatsApp"
        >
          <WhatsAppOutlined />
        </a>
      </div>

      {/* Demo WhatsApp Pitch Modal */}
      <Modal
        title={
          <Space>
            <WhatsAppOutlined style={{ color: '#25D366', fontSize: 22 }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Live WhatsApp Outreach Preview</span>
          </Space>
        }
        open={demoWhatsAppModal}
        onCancel={() => setDemoWhatsAppModal(false)}
        footer={null}
        width={540}
        destroyOnClose
      >
        {selectedDemoLead && (
          <div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{selectedDemoLead.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>📍 {selectedDemoLead.area}, {selectedDemoLead.city} &bull; {selectedDemoLead.phone}</div>
            </div>

            <Text strong style={{ fontSize: 13, color: '#475569', display: 'block', marginBottom: 6 }}>
              AI-Personalized WhatsApp Outreach Pitch:
            </Text>
            <Input.TextArea
              rows={4}
              value={selectedDemoLead.pitchText}
              readOnly
              style={{ background: '#f1f5f9', color: '#1e293b', fontSize: 14, marginBottom: 16 }}
            />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<WhatsAppOutlined />}
                block
                onClick={() => {
                  let cleanPhone = selectedDemoLead.phone.replace(/[^0-9]/g, '');
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(selectedDemoLead.pitchText)}`, '_blank');
                }}
                style={{
                  height: 44,
                  background: '#25D366',
                  borderColor: '#25D366',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Launch Live WhatsApp Test ➔
              </Button>

              <Button
                type="default"
                block
                icon={<RocketFilled style={{ color: '#2563eb' }} />}
                onClick={() => {
                  setDemoWhatsAppModal(false);
                  router.push('/register');
                }}
                style={{
                  height: 44,
                  fontWeight: 700,
                  fontSize: 14,
                  borderColor: '#2563eb',
                  color: '#2563eb',
                }}
              >
                Create Free CRM Account to Reach 100+ Leads ➔
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
