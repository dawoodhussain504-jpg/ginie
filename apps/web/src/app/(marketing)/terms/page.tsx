'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Typography, Breadcrumb, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import GinieLogo from '@/components/GinieLogo';

const { Title, Paragraph, Text } = Typography;

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Top Header */}
      <header
        style={{
          background: '#0B0F19',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GinieLogo size={34} isDark={true} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: 999 }}>
              Terms of Service
            </span>
          </div>
          <Link href="/" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftOutlined /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: 960, margin: '40px auto 80px', padding: '0 24px' }}>
        <Breadcrumb
          style={{ marginBottom: 20 }}
          items={[
            { title: <Link href="/">Home</Link> },
            { title: 'Terms of Service' },
          ]}
        />

        <Card
          style={{
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            padding: '24px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Tag color="blue" icon={<FileTextOutlined />}>COMMERCIAL TERMS</Tag>
            <Tag color="green" icon={<CheckCircleOutlined />}>ZERO LOCK-IN GUARANTEE</Tag>
          </div>

          <Title level={1} style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>
            Terms of Service
          </Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 28 }}>
            Last Updated: November 2026 &bull; Effective Date: November 2026
          </Text>

          <Divider style={{ margin: '16px 0 24px' }} />

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              1. Acceptance of Terms
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              By creating an account, accessing, or utilizing any services provided by GINIE (including the web platform, POS counter, digital storefront, and API services), you agree to be legally bound by these Terms of Service. If you are registering on behalf of a business entity, you warrant that you have full authorization to bind that entity.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              2. Core Platform: 100% Free Forever
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              GINIE provides its Core Platform (Sales CRM, visual pipeline, multi-trade ERP inventory, POS counter, Daybook cash register, and 0% commission digital storefront) completely free of subscription fees. There are no mandatory monthly software rental charges, no credit card lock-ins, and no artificial trial expiration dates for the core suite.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              3. On-Demand Add-on: GINIE Maps Lead Discovery (₹599/Mo)
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              Users who wish to extract local business leads with direct phone numbers from GINIE Maps may activate the Discovery Add-on for ₹599 per month:
            </Paragraph>
            <ul style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', paddingLeft: 24 }}>
              <li><strong>Zero Auto-Debit:</strong> Payments are processed solely via one-time UPI QR scans. GINIE will never mandate recurring debit (e-mandate) on your bank account.</li>
              <li><strong>Validity:</strong> Each activation provides 30 calendar days of search access. When expired, your core CRM and ERP remain 100% active; you renew Discovery only when you need new leads.</li>
              <li><strong>Payment Verification:</strong> Manual UPI payments are verified by our team and unlocked promptly upon receipt of the bank transaction reference (UTR).</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              4. Merchant Responsibilities & Acceptable Use
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              As a merchant or account holder, you agree:
            </Paragraph>
            <ul style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', paddingLeft: 24 }}>
              <li>Not to list contraband, counterfeit goods, prescription drugs without legitimate pharmacy licenses, or illegal services on your public digital storefront.</li>
              <li>To adhere to Indian telecommunication norms and WhatsApp anti-spam policies when sending automated or manual outreach messages to prospective customers.</li>
              <li>To maintain accurate tax computation (GST/HSN) for invoices issued to your retail or wholesale buyers.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              5. Limitation of Liability
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              GINIE provides the service on an &quot;as is&quot; and &quot;as available&quot; basis. While we strive for 99.9% uptime and implement continuous backups, GINIE shall not be held liable for indirect commercial losses, internet connectivity outages at the merchant counter, or WhatsApp account bans resulting from aggressive user spamming.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              6. Governing Law & Dispute Resolution
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Patna, Bihar, India.
            </Paragraph>
          </section>
        </Card>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B0F19', color: '#64748b', padding: '24px', textAlign: 'center', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        &copy; {new Date().getFullYear()} GINIE. All rights reserved. Built with pride for Indian Businesses.
      </footer>
    </div>
  );
}
