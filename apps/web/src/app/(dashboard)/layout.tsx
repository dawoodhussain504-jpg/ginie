'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Select,
  Typography,
  Drawer,
  message,
} from 'antd';
import {
  HomeOutlined,
  UsergroupAddOutlined,
  CompassOutlined,
  FundProjectionScreenOutlined,
  WhatsAppOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  GlobalOutlined,
  MobileOutlined,
  MenuOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import OnboardingWizardModal from '@/components/OnboardingWizardModal';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, t, locale, setLocale, isDark, setIsDark, brandColor } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      message.info('App install karne ke liye browser menu (3 dots) par "Install App" ya "Add to Home screen" par click karein.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      message.success('GINIE App installed successfully!');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ginie_token');
    if (!token && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [router]);

  // Check if onboarding needs to be shown for first-time business login
  useEffect(() => {
    if (!user) return;
    const skipped = localStorage.getItem(`ginie_wizard_skip_${user.tenantId}`);
    if (!skipped) {
      api.get('/api/settings/company')
        .then((company: any) => {
          if (company && company.onboardingCompleted === false) {
            setOnboardingOpen(true);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Exactly 8 Simplified Menu Groups (Upgrade Spec 1.1)
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">{t.nav.home}</Link>,
    },
    {
      key: '/customers',
      icon: <UsergroupAddOutlined />,
      label: <Link href="/customers">{t.nav.customers}</Link>,
    },
    {
      key: '/find-customers',
      icon: <CompassOutlined />,
      label: (
        <Link href="/find-customers">
          <span style={{ fontWeight: 600 }}>{t.nav.findCustomers}</span>
        </Link>
      ),
    },
    {
      key: '/sales',
      icon: <FundProjectionScreenOutlined />,
      label: <Link href="/sales">Sales & Tasks</Link>,
    },
    {
      key: '/whatsapp',
      icon: <WhatsAppOutlined />,
      label: <Link href="/whatsapp">Messages</Link>,
    },
    {
      key: '/billing',
      icon: <FileTextOutlined />,
      label: <Link href="/billing">{t.nav.billing}</Link>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: <Link href="/reports">{t.nav.reports}</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">{t.nav.settings}</Link>,
    },
  ];

  const userDropdownItems = {
    items: [
      {
        key: 'user-info',
        label: (
          <div style={{ padding: '4px 8px' }}>
            <Text strong>{user?.name || 'Master Admin'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.companyName || 'Ginie Space'} • {user?.role || 'Administrator'}
            </Text>
          </div>
        ),
      },
      { type: 'divider' as const },
      {
        key: 'onboarding-wizard',
        icon: <AppstoreOutlined />,
        label: <a onClick={() => setOnboardingOpen(true)}>Business Setup Wizard</a>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href="/settings">{t.nav.settings}</Link>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        danger: true,
        label: t.nav.logout,
        onClick: logout,
      },
    ],
  };

  const getActiveKey = () => {
    if (pathname.startsWith('/customers') || pathname === '/people' || pathname === '/companies') return '/customers';
    if (pathname.startsWith('/sales') || pathname === '/tasks') return '/sales';
    if (pathname.startsWith('/find-customers')) return '/find-customers';
    if (pathname.startsWith('/whatsapp')) return '/whatsapp';
    if (pathname.startsWith('/billing')) return '/billing';
    if (pathname.startsWith('/reports')) return '/reports';
    if (pathname.startsWith('/settings') || pathname === '/admin' || pathname === '/subscriptions' || pathname === '/forms' || pathname === '/automations' || pathname === '/audit-logs') return '/settings';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? 'dark' : 'light'}
        className="ginie-desktop-sider"
        style={{
          borderRight: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
        }}
        width={240}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 12,
            borderBottom: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: brandColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            G
          </div>
          {!collapsed && (
            <div>
              <Text strong style={{ fontSize: 16, display: 'block', lineHeight: 1.2 }}>
                {t.app.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {user?.companyName || 'Private Cockpit'}
              </Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        {/* Top Header */}
        <Header
          style={{
            background: isDark ? '#141414' : '#fff',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
            height: 64,
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t.app.tagline}
            </Text>
          </div>

          <Space size="middle">
            {isInstallable && (
              <Button
                type="primary"
                size="small"
                icon={<MobileOutlined />}
                onClick={handleInstallApp}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  borderColor: '#4f46e5',
                  borderRadius: 20,
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                Install App
              </Button>
            )}

            <Select
              size="middle"
              value={locale}
              onChange={setLocale}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिन्दी' },
              ]}
              prefix={<GlobalOutlined />}
              style={{ width: 110 }}
            />

            <Button
              type="text"
              icon={isDark ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
              onClick={() => setIsDark(!isDark)}
            />

            <Dropdown menu={userDropdownItems} trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: brandColor }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Text strong className="ginie-header-username">{user?.name || 'Master Admin'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Area */}
        <Content style={{ margin: 20, minHeight: 280, paddingBottom: 64 }}>
          {children}
        </Content>

        {/* Mobile Bottom Navigation Bar (Under 768px) */}
        <div className="ginie-mobile-bottom-nav">
          <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
            <HomeOutlined />
            <span>Home</span>
          </Link>
          <Link
            href="/customers"
            className={`bottom-nav-item ${pathname.startsWith('/customers') ? 'active' : ''}`}
          >
            <UsergroupAddOutlined />
            <span>Customers</span>
          </Link>
          <Link
            href="/find-customers"
            className={`bottom-nav-item ${pathname.startsWith('/find-customers') ? 'active' : ''}`}
          >
            <CompassOutlined />
            <span>Find</span>
          </Link>
          <Link
            href="/sales"
            className={`bottom-nav-item ${pathname.startsWith('/sales') ? 'active' : ''}`}
          >
            <FundProjectionScreenOutlined />
            <span>Sales</span>
          </Link>
          <Link
            href="/whatsapp"
            className={`bottom-nav-item ${pathname.startsWith('/whatsapp') ? 'active' : ''}`}
          >
            <WhatsAppOutlined />
            <span>Messages</span>
          </Link>
          <div
            className="bottom-nav-item"
            onClick={() => setMoreDrawerOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <MenuOutlined />
            <span>More</span>
          </div>
        </div>

        {/* Mobile More Drawer */}
        <Drawer
          title="More GINIE Modules"
          placement="bottom"
          height="auto"
          onClose={() => setMoreDrawerOpen(false)}
          open={moreDrawerOpen}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '8px 0 20px' }}>
            <Link
              href="/billing"
              onClick={() => setMoreDrawerOpen(false)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#262626' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileTextOutlined style={{ fontSize: 22, color: '#1677ff' }} />
              </div>
              <span style={{ fontSize: 12 }}>Billing & Quotes</span>
            </Link>

            <Link
              href="/reports"
              onClick={() => setMoreDrawerOpen(false)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#262626' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              </div>
              <span style={{ fontSize: 12 }}>Reports</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMoreDrawerOpen(false)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#262626' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SettingOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              </div>
              <span style={{ fontSize: 12 }}>Settings</span>
            </Link>
          </div>
        </Drawer>
      </Layout>

      {/* Onboarding Setup Wizard Modal */}
      <OnboardingWizardModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </Layout>
  );
}
