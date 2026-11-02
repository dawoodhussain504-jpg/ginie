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
  MedicineBoxOutlined,
  ReadOutlined,
  ApartmentOutlined,
  CheckOutlined,
  FireFilled,
  SmileOutlined,
  RocketFilled,
  LockOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MarketingLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState('clinics');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

      {/* ─── 10. FLOATING WHATSAPP HELP BUBBLE ───────────────────────────── */}
      <a
        href="https://wa.me/918797186001?text=Hi%20GINIE%20Support,%20I%20have%20a%20question%20about%20GINIE%20CRM."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          width: 58,
          height: 58,
          borderRadius: 29,
          background: '#25D366',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 32,
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
        }}
        title="Chat with GINIE Support on WhatsApp"
      >
        <WhatsAppOutlined />
      </a>
    </div>
  );
}
