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
  CheckOutlined,
  LockOutlined,
  GlobalOutlined,
  PhoneOutlined,
  DollarCircleOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  CalendarOutlined,
  AuditOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MarketingLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'discovery' | 'pipeline' | 'whatsapp' | 'billing' | 'cockpit'>('discovery');

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

  const coreModules = [
    {
      id: 'discovery' as const,
      name: 'Google Maps Lead Discovery',
      badge: '₹599 / Mo Add-on',
      badgeColor: '#2563eb',
      icon: <CompassOutlined style={{ fontSize: 22, color: '#2563eb' }} />,
      headline: 'Find Verified Local Business Leads Across Any City or Pincode',
      description: 'Search any niche like dental clinics, wholesalers, manufacturers, or fitness clubs. Extract verified mobile numbers, Google star ratings, addresses, and save them straight to your sales pipeline with one click.',
      points: [
        'Live Google Places search across 500+ Indian cities and pin codes',
        'Verified direct mobile numbers, addresses, and Google review counts',
        'One-click import into your CRM sales leads and deal stages',
        'Instant WhatsApp outreach with tailored sales pitch scripts',
        'Pay ₹599 once via UPI QR when you need fresh leads — zero auto-debit',
      ],
      route: '/find-customers',
    },
    {
      id: 'pipeline' as const,
      name: 'Visual Kanban Sales Pipeline',
      badge: '100% Free Core CRM',
      badgeColor: '#10b981',
      icon: <FundProjectionScreenOutlined style={{ fontSize: 22, color: '#8b5cf6' }} />,
      headline: 'Track Deals in Indian Rupees with Drag & Drop Stages',
      description: 'Never lose track of a prospect again. Visualize your entire sales funnel from initial inquiry to proposal, negotiation, and closed sale with real-time revenue totals.',
      points: [
        'Visual drag-and-drop deal cards across custom sales stages',
        'Track deal values in INR (₹) with automatic total pipeline calculation',
        'Set expected close dates, deal priorities, and client contact cards',
        'Identify bottleneck stages where prospective deals get stuck',
        'Unlimited deals and stages included free forever',
      ],
      route: '/deals',
    },
    {
      id: 'whatsapp' as const,
      name: 'Direct WhatsApp Outreach',
      badge: '100% Free Core CRM',
      badgeColor: '#10b981',
      icon: <WhatsAppOutlined style={{ fontSize: 22, color: '#10b981' }} />,
      headline: 'Message Leads Instantly Without Saving Numbers on Your Phone',
      description: 'Indian business happens on WhatsApp. Launch one-click WhatsApp Web chats with prospects directly from your CRM workspace using pre-built, high-converting Hindi and English pitch scripts.',
      points: [
        'One-click WhatsApp Web chat launch without saving contacts to phonebook',
        'Pre-written outreach message templates for pitches and appointment follow-ups',
        'Dedicated Baileys multi-device pairing bridge for automated connectivity',
        'Quick copy-to-clipboard pitch generator tailored to each client niche',
        'Zero per-message fees or expensive API approval roadblocks',
      ],
      route: '/whatsapp',
    },
    {
      id: 'billing' as const,
      name: 'GST Invoices & Dynamic UPI QR',
      badge: '100% Free Core CRM',
      badgeColor: '#10b981',
      icon: <QrcodeOutlined style={{ fontSize: 22, color: '#0ea5e9' }} />,
      headline: 'Professional Invoices with Direct Zero-Fee UPI QR Code',
      description: 'Create professional GST and non-GST quotations and invoices in seconds. Every invoice PDF includes an auto-generated dynamic UPI QR code pre-filled with your VPA and payable amount so clients scan and pay straight into your bank.',
      points: [
        'Generate GST/Non-GST invoices and quotations in seconds with PDF download',
        'Auto-calculates itemized subtotals, CGST, SGST, IGST, and final balance',
        'Dynamic UPI QR code printed directly on invoice pre-filled with exact amount',
        'Direct bank settlement via PhonePe, Google Pay, Paytm, or BHIM',
        'Save 2% to 3% payment gateway commission charges on every transaction',
      ],
      route: '/billing',
    },
    {
      id: 'cockpit' as const,
      name: 'Aaj Ka Kaam & Customer Directory',
      badge: '100% Free Core CRM',
      badgeColor: '#10b981',
      icon: <UsergroupAddOutlined style={{ fontSize: 22, color: '#f59e0b' }} />,
      headline: 'Central Daily Cockpit for Follow-ups, Calls & Customer History',
      description: 'Start your workday with complete clarity. The "Aaj Ka Kaam" cockpit surfaces scheduled follow-up calls, overdue tasks, active client notes, and team assignments in one unified interface.',
      points: [
        'Daily "Aaj Ka Kaam" agenda with overdue and scheduled follow-up calls',
        'Complete customer directory with contact details, deal history, and invoices',
        'Add internal notes, call logs, and meeting summaries for each client',
        'Multi-user team workspace: assign leads and track staff follow-ups',
        'Centralized cloud-synced storage accessible on mobile and desktop',
      ],
      route: '/dashboard',
    },
  ];

  const currentModule = coreModules.find((m) => m.id === activeTab) || coreModules[0];

  const faqItems = [
    {
      key: '1',
      label: 'Is GINIE Core CRM really 100% free forever?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Yes. The core GINIE CRM — including full lead and contact management, visual Kanban sales pipeline, daily follow-up tasks (Aaj Ka Kaam), professional GST invoicing with dynamic UPI QR receipts, multi-user team collaboration, and 1-click WhatsApp messaging — is 100% free forever. There is no trial expiration date, no hidden renewal fee, and we never ask for your credit card.
        </Paragraph>
      ),
    },
    {
      key: '2',
      label: 'What is the ₹599 / month Find Customers add-on?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Find Customers is an optional lead discovery feature built into GINIE. It connects to live Google Maps Places data to search and extract local business leads, verified mobile phone numbers, addresses, and Google star ratings for any city or pin code in India. You only pay ₹599 if you wish to use this prospecting tool to discover and import new leads.
        </Paragraph>
      ),
    },
    {
      key: '3',
      label: 'How does the UPI QR payment and activation work?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Activating the Find Customers feature is simple and 100% transparent. Inside the app, navigate to Find Customers. You will see the platform admin UPI QR code and UPI ID. Scan the QR code using any UPI app (PhonePe, Google Pay, Paytm, or BHIM) to transfer ₹599. Enter your 12-digit UPI UTR / transaction ID and upload your payment screenshot. The platform admin reviews and approves your request, instantly granting you 30 days of active lead discovery.
        </Paragraph>
      ),
    },
    {
      key: '4',
      label: 'Are there any recurring bank deductions or auto-debits?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Never. We do not set up any recurring card charges, e-mandates, or hidden subscriptions. You only pay ₹599 via manual UPI transfer for the months you actively want to discover new leads. When your 30 days finish, your core CRM remains fully functional and 100% free forever.
        </Paragraph>
      ),
    },
    {
      key: '5',
      label: 'How does the Dynamic UPI QR on invoices save me money?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          When you create a quotation or invoice in GINIE, our system automatically generates a dynamic UPI QR code on the invoice PDF. The QR code contains your exact UPI ID and the balance amount. When your client scans it with Google Pay, PhonePe, or Paytm, the money transfers directly into your bank account with zero payment gateway deduction — saving you 2% to 3% in merchant gateway commissions.
        </Paragraph>
      ),
    },
    {
      key: '6',
      label: 'Can my sales and operations team use GINIE together?',
      children: (
        <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          Yes. You can add your sales reps, telecallers, and administrative staff to your GINIE workspace. You can assign leads to specific team members, track deal progress through the Kanban board, and monitor daily follow-up activities without messy spreadsheets.
        </Paragraph>
      ),
    },
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Top Banner */}
      <div
        style={{
          background: '#090D16',
          color: '#94a3b8',
          padding: '8px 20px',
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Space direction="horizontal" size="middle" wrap style={{ justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399' }}>
            <SafetyCertificateOutlined />
            GINIE Core CRM is 100% Free Forever
          </span>
          <span style={{ opacity: 0.3 }}>&bull;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa' }}>
            <CompassOutlined />
            Google Maps Lead Discovery: Flat ₹599 / Month
          </span>
          <span style={{ opacity: 0.3 }}>&bull;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#25D366' }}>
            <WhatsAppOutlined />
            Direct Support: +91 8797186001
          </span>
        </Space>
      </div>

      {/* Main Navigation Header */}
      <header
        style={{
          background: 'rgba(9, 13, 22, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Tagline */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              }}
            >
              <ThunderboltFilled style={{ color: '#ffffff', fontSize: 18 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  GINIE
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '1px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  Local CRM
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1 }}>India&apos;s Local Business CRM</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
            }}
            className="marketing-nav-links"
          >
            <a href="#features" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Features
            </a>
            <a href="#discovery" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Find Customers
            </a>
            <a href="#comparison" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Why GINIE
            </a>
            <a href="#pricing" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Pricing
            </a>
            <a href="#faqs" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              FAQs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <Space size="middle">
            {isLoggedIn ? (
              <>
                {isSuperAdmin && (
                  <Button
                    onClick={() => router.push('/admin')}
                    style={{
                      borderRadius: 8,
                      fontWeight: 600,
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#cbd5e1',
                      background: 'rgba(255,255,255,0.05)',
                      height: 38,
                    }}
                  >
                    Admin Console
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    borderRadius: 8,
                    fontWeight: 700,
                    height: 38,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  Go to Dashboard <ArrowRightOutlined />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push('/login')}
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#e2e8f0',
                    background: 'transparent',
                    height: 38,
                  }}
                >
                  Log In
                </Button>
                <Button
                  type="primary"
                  onClick={() => router.push('/register')}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    borderRadius: 8,
                    fontWeight: 700,
                    height: 38,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Create Free Account <ArrowRightOutlined />
                </Button>
              </>
            )}
          </Space>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1e293b 0%, #0B0F19 100%)',
          color: '#ffffff',
          padding: '80px 24px 70px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Trust Badge */}
          <div style={{ display: 'inline-flex', marginBottom: 24 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                color: '#34d399',
              }}
            >
              <SafetyCertificateOutlined />
              <span>100% Free Core CRM Forever &bull; No Credit Card Required</span>
            </div>
          </div>

          {/* Main Headline */}
          <Title
            level={1}
            style={{
              color: '#ffffff',
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            }}
          >
            The All-in-One Sales & WhatsApp CRM
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #38bdf8 50%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Built for Indian Local Businesses
            </span>
          </Title>

          {/* Subheading */}
          <Paragraph
            style={{
              color: '#94a3b8',
              fontSize: 'clamp(16px, 2vw, 19px)',
              lineHeight: 1.6,
              maxWidth: 780,
              margin: '0 auto 36px',
            }}
          >
            Manage customer leads, visual deal stages, daily team follow-ups, and GST invoices with instant dynamic UPI QR payments — completely free forever. Need fresh local clients? Unlock live Google Maps verified lead discovery anytime for just ₹599/month.
          </Paragraph>

          {/* Call to Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <Button
              type="primary"
              size="large"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
              style={{
                background: '#2563eb',
                borderColor: '#2563eb',
                height: 48,
                padding: '0 28px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              }}
            >
              {isLoggedIn ? 'Open My Dashboard' : 'Create Free CRM Account'} <ArrowRightOutlined />
            </Button>

            <Button
              size="large"
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                height: 48,
                padding: '0 24px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                color: '#f8fafc',
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              View Pricing & Plans
            </Button>

            <Button
              size="large"
              href="https://wa.me/918797186001?text=Hello%20GINIE%20Team,%20I%20have%20a%20question%20about%20the%20CRM"
              target="_blank"
              icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 17 }} />}
              style={{
                height: 48,
                padding: '0 22px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                color: '#25D366',
                background: 'rgba(37, 211, 102, 0.1)',
                borderColor: 'rgba(37, 211, 102, 0.28)',
              }}
            >
              Chat with GINIE
            </Button>
          </div>

          {/* Quick Real Guarantees (Zero Emojis, Clean Check Icons) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
              fontSize: 13,
              color: '#cbd5e1',
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleFilled style={{ color: '#10b981' }} />
              100% Free Core CRM Forever
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleFilled style={{ color: '#10b981' }} />
              Google Maps Discovery: ₹599 / Month
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleFilled style={{ color: '#10b981' }} />
              Zero Auto-Debit or Credit Card
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleFilled style={{ color: '#10b981' }} />
              Dynamic UPI QR On Invoices
            </span>
          </div>
        </div>
      </section>

      {/* Interactive App Cockpit Preview */}
      <section style={{ maxWidth: 1200, margin: '-30px auto 70px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <Card
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Cockpit Top Tab Bar */}
          <div
            style={{
              background: '#0f172a',
              padding: '12px 20px',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ marginLeft: 10, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                GINIE Real Business Cockpit
              </span>
            </div>

            {/* Tab Selectors */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {coreModules.map((m) => {
                const isSelected = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id)}
                    style={{
                      background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cockpit Active Module Showcase */}
          <div style={{ padding: '36px 32px', background: '#ffffff' }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={11}>
                <div style={{ display: 'inline-block', marginBottom: 12 }}>
                  <Tag
                    color={currentModule.badgeColor}
                    style={{
                      fontWeight: 800,
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: 12,
                    }}
                  >
                    {currentModule.badge}
                  </Tag>
                </div>
                <Title level={3} style={{ color: '#0f172a', fontWeight: 800, marginTop: 0, marginBottom: 14 }}>
                  {currentModule.headline}
                </Title>
                <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                  {currentModule.description}
                </Paragraph>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                  {currentModule.points.map((pt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{pt}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(isLoggedIn ? currentModule.route : '/register')}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    fontWeight: 700,
                    borderRadius: 8,
                  }}
                >
                  {isLoggedIn ? `Open ${currentModule.name}` : 'Get Started Free'} <ArrowRightOutlined />
                </Button>
              </Col>

              {/* Cockpit Visual Card Mockup */}
              <Col xs={24} lg={13}>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: 24,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  {activeTab === 'discovery' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>Google Maps Places Search</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Search live businesses in any city or pin code</div>
                        </div>
                        <Tag color="blue" style={{ fontWeight: 700 }}>₹599 / Mo Add-on</Tag>
                      </div>

                      <div style={{ background: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                        <Row gutter={8}>
                          <Col span={10}>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CITY / LOCATION</div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Mumbai, MH</div>
                          </Col>
                          <Col span={10}>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BUSINESS CATEGORY</div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Dental Clinics</div>
                          </Col>
                          <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Button size="small" type="primary" style={{ background: '#2563eb' }}>Search</Button>
                          </Col>
                        </Row>
                      </div>

                      {/* Sample Discovered Leads */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Apex Dental Care & Implant Studio</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Bandra West &bull; +91 98201 44210</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <StarFilled style={{ color: '#f59e0b', fontSize: 12 }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>4.9</span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>(142 reviews)</span>
                            </div>
                          </div>
                          <Space>
                            <Button size="small" icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}>Pitch</Button>
                            <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }}>Save Lead</Button>
                          </Space>
                        </div>

                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Dr. Mehta Multi-Speciality Clinic</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Andheri East &bull; +91 98192 11980</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <StarFilled style={{ color: '#f59e0b', fontSize: 12 }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>4.8</span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>(98 reviews)</span>
                            </div>
                          </div>
                          <Space>
                            <Button size="small" icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}>Pitch</Button>
                            <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }}>Save Lead</Button>
                          </Space>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pipeline' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>Deals Kanban Board</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Visual drag-and-drop pipeline with Rupee values</div>
                        </div>
                        <Tag color="green" style={{ fontWeight: 700 }}>100% Free Core CRM</Tag>
                      </div>

                      <Row gutter={10}>
                        <Col span={8}>
                          <div style={{ background: '#e2e8f0', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                            NEW LEADS (₹75,000)
                          </div>
                          <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>Sharma Auto Parts</div>
                            <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 800 }}>₹45,000</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Follow-up: Today</div>
                          </div>
                        </Col>

                        <Col span={8}>
                          <div style={{ background: '#dbeafe', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
                            PROPOSAL (₹1,20,000)
                          </div>
                          <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>Global Fitness Club</div>
                            <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 800 }}>₹1,20,000</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Quote Sent via PDF</div>
                          </div>
                        </Col>

                        <Col span={8}>
                          <div style={{ background: '#dcfce7', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 8 }}>
                            WON DEALS (₹2,10,000)
                          </div>
                          <div style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>Apex Dental Studio</div>
                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 800 }}>₹65,000</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Paid via UPI QR</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>WhatsApp Web Direct Chat</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Launch WhatsApp instantly without saving phone numbers</div>
                        </div>
                        <Tag color="green" style={{ fontWeight: 700 }}>100% Free Core CRM</Tag>
                      </div>

                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <WhatsAppOutlined style={{ fontSize: 24, color: '#25D366' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Quick WhatsApp Pitch: Dr. Mehta Multi-Speciality</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Recipient: +91 98192 11980</div>
                          </div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534', lineHeight: 1.5, marginBottom: 12 }}>
                          &quot;Namaste Dr. Mehta, we noticed your stellar 4.8 rating on Google Maps in Andheri East. We help healthcare clinics reduce patient appointment no-shows by 75% via automated WhatsApp reminders. Can we share a 2-minute demo?&quot;
                        </div>
                        <Button type="primary" block icon={<WhatsAppOutlined />} style={{ background: '#25D366', borderColor: '#25D366', fontWeight: 700 }}>
                          Launch WhatsApp Web Chat
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>GST Invoice & Dynamic UPI QR</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Zero payment gateway charges &bull; Instant bank credit</div>
                        </div>
                        <Tag color="green" style={{ fontWeight: 700 }}>100% Free Core CRM</Tag>
                      </div>

                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>TAX INVOICE #GIN-2026-089</div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Billed to: Apex Dental Care</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Total Payable: ₹25,000 (Incl. 18% GST)</div>
                          </div>
                          <div style={{ textAlign: 'center', background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <QrcodeOutlined style={{ fontSize: 52, color: '#0f172a' }} />
                            <div style={{ fontSize: 10, color: '#0f172a', fontWeight: 700 }}>Scan with GPay/PhonePe</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#15803d', background: '#dcfce7', padding: '6px 10px', borderRadius: 4, fontWeight: 600 }}>
                          Direct Bank Settlement: UPI VPA pre-filled with ₹25,000 payable amount. 0% gateway commission.
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'cockpit' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>Aaj Ka Kaam (Daily Cockpit)</Text>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Central task and follow-up command center</div>
                        </div>
                        <Tag color="green" style={{ fontWeight: 700 }}>100% Free Core CRM</Tag>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Tag color="error" style={{ fontSize: 10, fontWeight: 700 }}>OVERDUE CALL</Tag>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Royal Auto Spares (Pune)</span>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Follow-up on quotation discussion</div>
                          </div>
                          <Button size="small" icon={<PhoneOutlined />} type="primary" danger>Call</Button>
                        </div>

                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Tag color="blue" style={{ fontSize: 10, fontWeight: 700 }}>TODAY 3:30 PM</Tag>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>FitZone Gym (Ahmedabad)</span>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Demo meeting with gym manager</div>
                          </div>
                          <Button size="small" icon={<CalendarOutlined />}>Details</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </section>

      {/* Real Core Modules Section */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag color="blue" style={{ fontWeight: 800, padding: '4px 12px', fontSize: 12, borderRadius: 999 }}>
            EVERYTHING YOU NEED TO SCALE
          </Tag>
          <Title level={2} style={{ color: '#0f172a', fontWeight: 900, marginTop: 12, marginBottom: 12 }}>
            5 Real Modules. Zero Fluff. Built for India.
          </Title>
          <Paragraph style={{ color: '#64748b', fontSize: 16, maxWidth: 680, margin: '0 auto' }}>
            Foreign CRMs are bloated and priced in expensive US Dollars. GINIE is engineered specifically for Indian businesses, wholesalers, clinics, and service providers.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {coreModules.map((m) => (
            <Col xs={24} md={12} lg={8} key={m.id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {m.icon}
                  </div>
                  <Tag color={m.badgeColor} style={{ fontWeight: 700, borderRadius: 6, margin: 0 }}>
                    {m.badge}
                  </Tag>
                </div>

                <Title level={4} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 10 }}>
                  {m.name}
                </Title>

                <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, flexGrow: 1, marginBottom: 16 }}>
                  {m.description}
                </Paragraph>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 700, color: '#2563eb' }}
                    onClick={() => router.push(isLoggedIn ? m.route : '/register')}
                  >
                    {isLoggedIn ? 'Access Module' : 'Get Started Free'} <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Comparison Section: Foreign CRMs vs GINIE */}
      <section id="comparison" style={{ background: '#ffffff', padding: '80px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Tag color="orange" style={{ fontWeight: 800, padding: '4px 12px', fontSize: 12, borderRadius: 999 }}>
              WHY INDIAN BUSINESSES SWITCH TO GINIE
            </Tag>
            <Title level={2} style={{ color: '#0f172a', fontWeight: 900, marginTop: 12, marginBottom: 12 }}>
              Stop Paying Expensive Dollar Subscriptions
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 16, maxWidth: 680, margin: '0 auto' }}>
              See why hundreds of Indian traders, clinics, agencies, and small businesses choose GINIE over traditional foreign CRMs or disorganized Excel diaries.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {/* Foreign CRMs / Manual Diary */}
            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 14,
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  height: '100%',
                }}
                bodyStyle={{ padding: 28 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LockOutlined style={{ color: '#ef4444', fontSize: 18 }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 17, color: '#991b1b' }}>Traditional Foreign CRMs / Excel</Text>
                    <div style={{ fontSize: 12, color: '#b91c1c' }}>HubSpot, Zoho, Salesforce or Paper Diaries</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>&times;</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d' }}>Costs ₹3,000 to ₹10,000/month per user billed in US Dollars with recurring card auto-debits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>&times;</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d' }}>Zero local lead generation: You must buy expensive third-party data lists or burn money on ads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>&times;</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d' }}>No native dynamic UPI QR on invoices: You pay 2% to 3% in payment gateway processing fees</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>&times;</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d' }}>Overly complex English configuration with hundreds of enterprise settings your staff will never use</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>&times;</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d' }}>Scattered customer phone numbers across staff mobile phones with no central communication history</span>
                  </div>
                </div>
              </Card>
            </Col>

            {/* The GINIE Advantage */}
            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 14,
                  border: '2px solid #2563eb',
                  background: '#f0fdf4',
                  height: '100%',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
                }}
                bodyStyle={{ padding: 28 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 17, color: '#166534' }}>The GINIE Advantage</Text>
                    <div style={{ fontSize: 12, color: '#15803d' }}>India&apos;s Local Business CRM</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 600 }}>100% Free Core CRM Forever: No credit card, no 14-day expiry limit, no monthly billing shock</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 600 }}>Integrated Google Maps Lead Discovery: Search local buyers anytime for flat ₹599/month via UPI</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 600 }}>Dynamic UPI QR Invoicing: Auto-embeds your UPI QR on invoice PDFs for instant 0% fee bank receipts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 600 }}>WhatsApp Web Outreach: Message prospects instantly without saving numbers on your personal phone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircleFilled style={{ color: '#10b981', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 600 }}>Built for India: Clean, bilingual Hindi/English design that any salesperson or receptionist can master in 5 minutes</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 100% Honest Pricing Section (Strictly 2 Cards, Zero Emojis) */}
      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '90px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <Tag color="green" style={{ fontWeight: 800, padding: '4px 14px', fontSize: 12, borderRadius: 999 }}>
            TRANSPARENT & HONEST PRICING
          </Tag>
          <Title level={2} style={{ color: '#0f172a', fontWeight: 900, marginTop: 14, marginBottom: 12 }}>
            Simple Pricing. No Credit Card. No Surprises.
          </Title>
          <Paragraph style={{ color: '#64748b', fontSize: 16, maxWidth: 650, margin: '0 auto' }}>
            The entire core CRM is 100% free forever for all your team members. When you need fresh local business leads from Google Maps, activate Discovery anytime via UPI for just ₹599/month.
          </Paragraph>
        </div>

        <Row gutter={[28, 28]} align="stretch">
          {/* Card 1: GINIE Core CRM */}
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ marginBottom: 20 }}>
                <Tag color="green" style={{ fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
                  CORE PLATFORM
                </Tag>
                <Title level={3} style={{ color: '#0f172a', fontWeight: 800, marginTop: 10, marginBottom: 6 }}>
                  GINIE Core CRM
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                  Everything you need to organize leads, sales pipeline, follow-ups, and GST invoices in one central platform.
                </Paragraph>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: '#0f172a' }}>₹0</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>Lifetime Free Forever</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Full Lead & Customer Directory</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Visual Kanban Sales Pipeline with Custom Deal Stages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Daily Follow-up Tasks Cockpit (&quot;Aaj Ka Kaam&quot;)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Professional GST Quotations & Invoices (PDF Download)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Dynamic UPI QR Code on Invoices (Zero Gateway Fees)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>1-Click WhatsApp Web Outreach (No Number Saving Needed)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>Multi-User Team Member Collaboration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckOutlined style={{ color: '#10b981', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>100% Cloud Synced & Secure Database</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                <SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 6 }} />
                No credit card required. No 14-day expiry limit. Free forever.
              </div>

              <Button
                size="large"
                block
                onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
                style={{
                  borderRadius: 10,
                  fontWeight: 700,
                  height: 48,
                  borderColor: '#0f172a',
                  color: '#0f172a',
                }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Create Free Account'}
              </Button>
            </Card>
          </Col>

          {/* Card 2: Find Customers Add-on */}
          <Col xs={24} md={12}>
            <Badge.Ribbon text="GROWTH ADD-ON" color="#2563eb">
              <Card
                style={{
                  borderRadius: 16,
                  border: '2px solid #2563eb',
                  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.12)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
                bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div style={{ marginBottom: 20 }}>
                  <Tag color="blue" style={{ fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
                    LEAD PROSPECTING
                  </Tag>
                  <Title level={3} style={{ color: '#0f172a', fontWeight: 800, marginTop: 10, marginBottom: 6 }}>
                    Find Customers (Lead Discovery)
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                    Extract verified local business leads with mobile numbers directly from Google Maps in any city or pin code.
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: '#2563eb' }}>₹599</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#64748b' }}>/ Month (Flat UPI Payment)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1, marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>Live Google Maps Places Search in Any City or Pincode</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>Verified Business Mobile Numbers, Addresses & Google Ratings</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>1-Click Save Directly to Your Sales Pipeline & Deal Stages</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>Pre-written High-Converting WhatsApp Sales Pitches</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>Simple UPI QR Code Scan Payment (PhonePe, GPay, Paytm)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>Admin Payment Review & 30-Day Instant Account Activation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckOutlined style={{ color: '#2563eb', fontSize: 15, marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: '#334155' }}>No Auto-Debit Hassle — Renew Only When You Need New Leads</span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  <QrcodeOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  Pay once via UPI QR when you need fresh clients. Zero auto-renewal lock-in.
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => router.push(isLoggedIn ? '/find-customers' : '/register')}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    borderColor: '#2563eb',
                    borderRadius: 10,
                    fontWeight: 800,
                    height: 48,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  {isLoggedIn ? 'Go to Find Customers' : 'Sign Up & Unlock Leads'} <ArrowRightOutlined />
                </Button>
              </Card>
            </Badge.Ribbon>
          </Col>
        </Row>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" style={{ background: '#ffffff', padding: '80px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <Tag color="blue" style={{ fontWeight: 800, padding: '4px 12px', fontSize: 12, borderRadius: 999 }}>
              FREQUENTLY ASKED QUESTIONS
            </Tag>
            <Title level={2} style={{ color: '#0f172a', fontWeight: 900, marginTop: 12, marginBottom: 8 }}>
              Everything You Need to Know
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 15 }}>
              Got questions? Here are honest answers regarding our free CRM and ₹599 UPI add-on.
            </Paragraph>
          </div>

          <Collapse
            items={faqItems}
            defaultActiveKey={['1', '2', '3']}
            bordered={false}
            style={{ background: 'transparent' }}
          />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B0F19 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '70px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <Title level={2} style={{ color: '#ffffff', fontWeight: 900, marginBottom: 14 }}>
            Ready to Streamline Your Sales and Customer Follow-ups?
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Join smart Indian local businesses managing their deals, WhatsApp pitches, and GST invoices on GINIE. Create your free account in under 30 seconds.
          </Paragraph>
          <Space size="middle" wrap style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/register')}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderColor: '#2563eb',
                height: 50,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 800,
                borderRadius: 8,
              }}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Create Free Account Now'} <ArrowRightOutlined />
            </Button>

            <Button
              size="large"
              href="https://wa.me/918797186001?text=Hello%20GINIE%20Team,%20I%20have%20a%20question%20about%20the%20CRM"
              target="_blank"
              icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
              style={{
                height: 50,
                padding: '0 24px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 8,
                color: '#e2e8f0',
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.16)',
              }}
            >
              Chat with GINIE
            </Button>
          </Space>
        </div>
      </section>

      {/* Modern Clean Footer (Zero Emojis) */}
      <footer
        style={{
          background: '#0B0F19',
          color: '#94a3b8',
          padding: '60px 24px 30px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[40, 32]}>
            <Col xs={24} md={10}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThunderboltFilled style={{ color: '#ffffff', fontSize: 16 }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
                  GINIE
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  Local CRM
                </span>
              </div>
              <Paragraph style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, maxWidth: 360, marginBottom: 16 }}>
                India&apos;s dedicated sales CRM for local businesses, clinics, manufacturers, and agencies. 100% Free Core CRM with on-demand Google Maps lead discovery via UPI.
              </Paragraph>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                GINIE WhatsApp Support:{' '}
                <a
                  href="https://wa.me/918797186001"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}
                >
                  +91 8797186001
                </a>
              </div>
            </Col>

            <Col xs={12} md={5}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
                Product
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a>
                <a href="#discovery" style={{ color: '#94a3b8', textDecoration: 'none' }}>Find Customers</a>
                <a href="#comparison" style={{ color: '#94a3b8', textDecoration: 'none' }}>Why GINIE</a>
                <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
                <a href="#faqs" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQs</a>
              </div>
            </Col>

            <Col xs={12} md={5}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
                App Links
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Log In</Link>
                <Link href="/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>Create Free Account</Link>
                <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
                <Link href="/find-customers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Find Customers (₹599)</Link>
              </div>
            </Col>

            <Col xs={24} md={4}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
                Trust & Support
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <SafetyCertificateOutlined />
                  <span>100% Free Core CRM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa' }}>
                  <CompassOutlined />
                  <span>₹599 / Mo UPI Add-on</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                  <LockOutlined />
                  <span>Secure SSL Encryption</span>
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '36px 0 24px' }} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <div>&copy; {new Date().getFullYear()} GINIE Space. All rights reserved. Built for India.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span>Zero E-Mandate</span>
              <span>Zero Auto-Debit</span>
              <span>Flat UPI QR Activation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
