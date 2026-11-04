'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Typography, Breadcrumb, Divider, Tag } from 'antd';
import { ThunderboltFilled, ArrowLeftOutlined, DollarCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function RefundPolicyPage() {
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
              Refund & Cancellation
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
            { title: 'Refund & Cancellation Policy' },
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
            <Tag color="green" icon={<SafetyCertificateOutlined />}>100% TRANSPARENT POLICY</Tag>
            <Tag color="blue" icon={<DollarCircleOutlined />}>NO RECURRING AUTO-DEBIT</Tag>
          </div>

          <Title level={1} style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>
            Refund & Cancellation Policy
          </Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 28 }}>
            Last Updated: November 2026 &bull; Effective Date: November 2026
          </Text>

          <Divider style={{ margin: '16px 0 24px' }} />

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              1. 100% Free Core Platform
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              The Core GINIE suite (Sales CRM, Multi-Trade ERP Inventory, POS Counter, Daybook, and Digital Storefront) is provided completely free of charge. No payment details or credit cards are collected, meaning no monetary refund obligations apply to the free core features.
            </Paragraph>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              2. Google Maps Discovery Add-on (₹599 / Month)
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              For our paid add-on (₹599/month for verified local business lead extraction):
            </Paragraph>
            <ul style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', paddingLeft: 24 }}>
              <li><strong>Zero Auto-Renewal / Auto-Debit:</strong> Because payments are made one-time via manual UPI QR scan, you will never be surprised by unwanted automated deductions. Your subscription simply lapses after 30 days unless you choose to pay again.</li>
              <li><strong>48-Hour Technical Refund Window:</strong> If you paid ₹599 and experience verified technical inability to execute searches or access the tool within 48 hours of activation, you are entitled to a full 100% refund.</li>
              <li><strong>Utilized Searches:</strong> Once multiple successful search batches have been generated and contact phone numbers exported, the service is deemed fully delivered.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <Title level={3} style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              3. How to Request a Refund
            </Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>
              To request a refund under the 48-hour technical window, simply contact us with your payment transaction details:
            </Paragraph>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: 8, fontSize: 14, color: '#334155' }}>
              <div><strong>WhatsApp Support:</strong> +91 8797186001 (Send payment screenshot + UPI UTR number)</div>
              <div><strong>Email:</strong> billing@ginie.space</div>
              <div><strong>Processing Time:</strong> Approved refunds are credited directly back to the originating UPI account / VPA within 3 to 5 business days.</div>
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
