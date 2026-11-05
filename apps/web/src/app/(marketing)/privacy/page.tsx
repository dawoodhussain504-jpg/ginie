'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Typography, Breadcrumb, Divider, Tag } from 'antd';
import { ThunderboltFilled, ArrowLeftOutlined, SafetyCertificateOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function PrivacyPolicyPage() {
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThunderboltFilled style={{ color: '#ffffff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>GINIE</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: 999 }}>
              Legal & Compliance
            </span>
          </Link>
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
            { title: 'Privacy Policy' },
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
            <Tag color="green" icon={<SafetyCertificateOutlined />}>DPDP ACT 2023 COMPLIANT</Tag>
            <Tag color="blue" icon={<LockOutlined />}>END-TO-END DATA ISOLATION</Tag>
          </div>

          <Title level={1} style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>
            Privacy Policy
          </Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 28 }}>
            Last Updated: November 2026 &bull; Effective Date: November 2026
          </Text>

          <Divider style={{ margin: '16px 0 24px' }} />

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              1. Introduction & Scope
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              GINIE Space (&quot;GINIE&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy, confidentiality, and data sovereignty of our business users, retail merchants, clinics, manufacturers, and their end-customers across India. This Privacy Policy outlines our practices regarding data collection, storage, processing, and protection in compliance with the Information Technology Act (2000) and the Digital Personal Data Protection Act (DPDP Act, 2023).
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              2. Information We Collect
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              We collect only the minimum necessary information required to deliver CRM, ERP, and Storefront services:
            </Paragraph>
            <ul style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', paddingLeft: 24 }}>
              <li><strong>Account Credentials:</strong> Name, business name, WhatsApp mobile number, email address, and encrypted authentication tokens.</li>
              <li><strong>Business & ERP Records:</strong> Product SKUs, inventory counts, barcode indices, invoice totals, tax/GST rates, and Daybook ledger entries.</li>
              <li><strong>Customer Directory Data:</strong> Customer contact names, phone numbers, deal notes, and transaction histories uploaded by your business.</li>
              <li><strong>Communication Metadata:</strong> WhatsApp outreach logs, message dispatch timestamps, and delivery statuses.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              3. Strict Merchant Data Ownership
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              <strong>Your business data belongs exclusively to you.</strong> GINIE operates under a strict Zero-Monetization policy for private business data:
            </Paragraph>
            <ul style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', paddingLeft: 24 }}>
              <li>We <strong>never sell, lease, rent, or trade</strong> your customer contacts, pricing lists, or turnover records to third-party advertisers or competing businesses.</li>
              <li>All database queries are scoped to your unique `tenantId` using multi-tier tenant isolation in PostgreSQL.</li>
              <li>You may export your complete database (products, contacts, invoices) to Excel or request permanent account erasure at any time.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              4. WhatsApp Integration & Third-Party APIs
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              GINIE provides direct WhatsApp Web click-to-chat links and multi-device connection bridges. We do not store raw end-to-end encrypted chat histories of your private WhatsApp personal conversations. When utilizing the Google Maps Lead Discovery module, public business metadata is retrieved directly via Google Places APIs solely for your designated prospecting search.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              5. Data Security & Storage
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              All network data transmission occurs over 256-bit TLS/SSL encryption. Passwords and session keys are securely hashed using industry-standard bcrypt algorithms. Automated database backups are safeguarded against hardware failure with strict access controls.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              6. Grievance Redressal & Contact Officer
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              In accordance with the Information Technology Act (2000) and DPDP Act (2023), for any privacy concerns, data deletion requests, or grievances, please reach our Grievance Officer:
            </Paragraph>
            <div style={{ background: '#f1f5f9', padding: '16px 20px', borderRadius: 8, fontSize: 14, color: '#334155' }}>
              <div><strong>Grievance Officer:</strong> Compliance Team &bull; GINIE Space</div>
              <div><strong>Email:</strong> compliance@ginie.space / support@ginie.space</div>
              <div><strong>WhatsApp Support:</strong> +91 7870819862</div>
              <div><strong>Jurisdiction:</strong> Bihar / New Delhi, India</div>
            </div>
          </section>
        </Card>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B0F19', color: '#64748b', padding: '24px', textAlign: 'center', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        &copy; {new Date().getFullYear()} GINIE Space. All rights reserved. Built with pride for Indian Businesses.
      </footer>
    </div>
  );
}
