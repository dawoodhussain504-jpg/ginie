'use client';

import React, { useState } from 'react';
import { Modal, Typography, Space, Tag, Input, Button, Card, Divider, message } from 'antd';
import {
  WhatsAppOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ShopOutlined,
  UserOutlined,
  CompassOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import GinieLogo from '@/components/GinieLogo';

const { Title, Text, Paragraph } = Typography;

export interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

const SUPPORT_CATEGORIES = [
  { id: 'billing', label: 'Billing & POS Invoicing', icon: '🧾', detail: 'Billing, GST invoice generation, POS counter, printing' },
  { id: 'erp', label: 'Inventory & ERP Items', icon: '📦', detail: 'Stock quantity, multi-trade items, batch/expiry, barcode' },
  { id: 'store', label: 'Digital Store & Orders', icon: '🛍️', detail: 'Online storefront catalog, customer checkout, order sync' },
  { id: 'upi', label: 'UPI QR & Payments', icon: '💳', detail: 'UPI QR scan setup, settlement, invoice payment status' },
  { id: 'leads', label: 'Lead Discovery Add-on', icon: '📍', detail: 'Google Maps business lead search, phone number exports' },
  { id: 'whatsapp', label: 'WhatsApp Inbox & Alerts', icon: '💬', detail: 'WhatsApp bot, automated greetings, broadcast campaigns' },
  { id: 'technical', label: 'Bug / Technical Error', icon: '⚠️', detail: 'Screen not loading, error message, sync failure' },
  { id: 'general', label: 'General Query & Setup', icon: '💡', detail: 'Account onboarding, business customization, feedback' },
];

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const { user, isDark } = useApp();
  const pathname = usePathname() || '/dashboard';
  const [selectedCategory, setSelectedCategory] = useState<string>('billing');
  const [customNote, setCustomNote] = useState<string>('');

  const currentCategory = SUPPORT_CATEGORIES.find((c) => c.id === selectedCategory) || SUPPORT_CATEGORIES[0];

  const handleLaunchWhatsApp = (directBypass = false) => {
    const supportPhone = '917870819862';

    let textMessage = '';
    if (directBypass) {
      textMessage = `Namaste GINIE Support Team! Mujhe assistance chahiye.\n\nBusiness: ${user?.companyName || 'Not Specified'}\nUser: ${user?.name || 'Staff'}\nScreen: ${pathname}`;
    } else {
      const userContact = (user as any)?.phone || user?.email || '';
      const parts = [
        '👋 *Namaste GINIE Support Team!*',
        '',
        'Mujhe app me issue/help chahiye:',
        `🏢 *Business:* ${user?.companyName || 'Not Specified'}`,
        `👤 *User:* ${user?.name || 'User'}${userContact ? ` (${userContact})` : ''}`,
        `📍 *Current Module:* ${pathname}`,
        `🏷️ *Category:* ${currentCategory.icon} ${currentCategory.label}`,
      ];

      if (customNote.trim()) {
        parts.push(`📝 *Issue Note:* ${customNote.trim()}`);
      }

      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      parts.push(`⏰ *Sent At:* ${timestamp}`);

      textMessage = parts.join('\n');
    }

    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(textMessage)}`;

    message.success('Opening GINIE WhatsApp Support...');
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          borderRadius: 20,
          overflow: 'hidden',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          background: isDark ? '#0f172a' : '#ffffff',
        },
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B0F19 0%, #1e1b4b 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GinieLogo size={38} isDark={true} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: 18, fontWeight: 800 }}>
                  GINIE Priority Support
                </Title>
              </div>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                Official WhatsApp Desk &bull; Direct Developer & Support Access
              </Text>
            </div>
          </div>
          <Tag
            color="success"
            style={{
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <WhatsAppOutlined /> +91 7870819862
          </Tag>
        </div>

        {/* User Context Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
            <ShopOutlined style={{ color: '#38bdf8' }} />
            <span style={{ fontWeight: 600 }}>{user?.companyName || 'Business Account'}</span>
            <span style={{ color: '#64748b' }}>&bull;</span>
            <UserOutlined style={{ color: '#a78bfa' }} />
            <span>{user?.name || 'Staff'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#facc15', fontWeight: 600 }}>
            <CompassOutlined />
            <span>Screen: {pathname}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ marginBottom: 14 }}>
          <Text strong style={{ fontSize: 14, color: isDark ? '#f1f5f9' : '#0f172a' }}>
            Aapko kis module / feature me issue aa raha hai?
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            Category choose karein taaki message WhatsApp par pre-fill ho jaye:
          </Text>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {SUPPORT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid #25D366'
                    : isDark
                    ? '1px solid #334155'
                    : '1px solid #e2e8f0',
                  background: isSelected
                    ? isDark
                      ? 'rgba(37, 211, 102, 0.15)'
                      : '#f0fdf4'
                    : isDark
                    ? '#1e293b'
                    : '#f8fafc',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? (isDark ? '#4ade80' : '#15803d') : isDark ? '#e2e8f0' : '#1e293b',
                      }}
                    >
                      {cat.label}
                    </div>
                  </div>
                </div>
                {isSelected && <CheckCircleFilled style={{ color: '#25D366', fontSize: 16 }} />}
              </div>
            );
          })}
        </div>

        {/* Optional Custom Note */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text strong style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#334155' }}>
              Apne issue ke baare me kuch aur batana chahte hain? (Optional)
            </Text>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Optional</span>
          </div>
          <Input.TextArea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Invoice print karne par preview load nahi ho raha hai..."
            style={{
              borderRadius: 10,
              fontSize: 13,
              borderColor: isDark ? '#334155' : '#cbd5e1',
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
            }}
          />
        </div>

        {/* Primary Action Button */}
        <Button
          type="primary"
          block
          size="large"
          icon={<WhatsAppOutlined style={{ fontSize: 22 }} />}
          onClick={() => handleLaunchWhatsApp(false)}
          style={{
            height: 48,
            borderRadius: 12,
            background: '#25D366',
            borderColor: '#25D366',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          WhatsApp Par Msg Karein (+91 7870819862)
        </Button>

        {/* Fast Track Bypass */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a
            onClick={() => handleLaunchWhatsApp(true)}
            style={{
              fontSize: 12,
              color: '#64748b',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Direct bina detail ke turant chat shuru karein &rarr;
          </a>
        </div>

        <Divider style={{ margin: '18px 0 14px' }} />

        {/* Support Highlights / Guarantee */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#64748b',
            background: isDark ? '#1e293b' : '#f8fafc',
            padding: '10px 14px',
            borderRadius: 10,
            border: isDark ? '1px solid #334155' : '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined style={{ color: '#10b981' }} />
            <span>
              <strong>Timings:</strong> 10:00 AM – 8:00 PM IST
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MailOutlined style={{ color: '#2563eb' }} />
            <span>billing@ginie.space</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
