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
  Tag,
  Tooltip,
  Badge,
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
  SafetyCertificateOutlined,
  SwapOutlined,
  CrownOutlined,
  ArrowLeftOutlined,
  ShopOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import OnboardingWizardModal from '@/components/OnboardingWizardModal';
import GinieAiAssistantDrawer from '@/components/GinieAiAssistantDrawer';

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
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        message.success('Internet connected! GINIE cloud sync is active.');
      };
      const handleOffline = () => {
        setIsOnline(false);
        message.warning('Offline mode active - Bills & data will be cached locally.');
      };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsImpersonating(!!sessionStorage.getItem('admin_master_token'));
    }
  }, [pathname]);

  const handleExitImpersonation = () => {
    const masterToken = sessionStorage.getItem('admin_master_token');
    if (masterToken) {
      localStorage.setItem('ginie_token', masterToken);
      sessionStorage.removeItem('admin_master_token');
      message.success('Master Admin session restored!');
      window.location.href = '/admin';
    } else {
      router.push('/admin');
    }
  };

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
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">{t.nav.home}</Link>,
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
      key: '/erp',
      icon: <AppstoreOutlined />,
      label: (
        <Link href="/erp">
          <span style={{ fontWeight: 600 }}>ERP & Operations</span>
        </Link>
      ),
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

  const isOwnerOrSuper = user?.isSuperAdmin || user?.role === 'Owner';
  const canViewBilling = isOwnerOrSuper || user?.permissions?.billing?.view !== false;

  const visibleMenuItems = [
    ...menuItems.filter((item) => {
      if (item.key === '/billing' && !canViewBilling) return false;
      return true;
    }),
    ...(user?.isSuperAdmin
      ? [
          {
            key: '/admin',
            icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
            label: (
              <Link href="/admin">
                <span style={{ color: '#faad14', fontWeight: 600 }}>Master Console</span>
              </Link>
            ),
          },
        ]
      : []),
  ];

  const userDropdownItems = {
    items: [
      {
        key: 'user-info',
        label: (
          <div style={{ padding: '6px 8px' }}>
            <Text strong>{user?.name || 'User'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.companyName || 'Ginie Space'}
            </Text>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: user?.isSuperAdmin ? '#fffbe6' : user?.role === 'Owner' ? '#f9f0ff' : '#e6f4ff',
                  color: user?.isSuperAdmin ? '#d48806' : user?.role === 'Owner' ? '#722ed1' : '#1677ff',
                  border: user?.isSuperAdmin ? '1px solid #ffe58f' : user?.role === 'Owner' ? '1px solid #d3adf7' : '1px solid #91caff',
                }}
              >
                {user?.isSuperAdmin ? 'Platform Admin' : user?.role || 'Staff Member'}
              </span>
            </div>
          </div>
        ),
      },
      { type: 'divider' as const },
      ...(user?.isSuperAdmin
        ? [
            {
              key: 'admin-console',
              icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
              label: (
                <Link href="/admin">
                  <span style={{ color: '#d48806', fontWeight: 600 }}>Platform Master Console</span>
                </Link>
              ),
            },
          ]
        : []),
      ...(isOwnerOrSuper
        ? [
            {
              key: 'onboarding-wizard',
              icon: <AppstoreOutlined />,
              label: <a onClick={() => setOnboardingOpen(true)}>Business Setup Wizard</a>,
            },
          ]
        : []),
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
    if (pathname === '/admin') return '/admin';
    if (pathname === '/dashboard') return '/dashboard';
    if (pathname.startsWith('/customers') || pathname === '/people' || pathname === '/companies') return '/customers';
    if (pathname.startsWith('/sales') || pathname === '/tasks') return '/sales';
    if (pathname.startsWith('/find-customers')) return '/find-customers';
    if (pathname.startsWith('/whatsapp')) return '/whatsapp';
    if (pathname.startsWith('/billing')) return '/billing';
    if (pathname.startsWith('/reports')) return '/reports';
    if (pathname.startsWith('/settings') || pathname === '/subscriptions' || pathname === '/forms' || pathname === '/automations' || pathname === '/audit-logs') return '/settings';
    return '/dashboard';
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
          items={visibleMenuItems}
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

            {/* Online / Offline Status Badge */}
            <Tag color={isOnline ? 'green' : 'orange'} style={{ borderRadius: 12, margin: 0, fontWeight: 700 }}>
              {isOnline ? '🟢 Live Cloud' : '🟠 Offline Mode'}
            </Tag>

            {/* AI Assistant Button */}
            <Button
              type="primary"
              icon={<ThunderboltFilled />}
              onClick={() => setAiDrawerOpen(true)}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
                borderColor: 'transparent',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(114, 46, 209, 0.25)',
              }}
            >
              Ask GINIE AI
            </Button>

            {/* Digital Storefront Link */}
            <Tooltip title="View your Public Digital Storefront & Catalog">
              <Link href="/store/catalog" target="_blank">
                <Button icon={<ShopOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>
                  Storefront
                </Button>
              </Link>
            </Tooltip>

            {isImpersonating && (
              <Button
                type="primary"
                danger
                size="middle"
                icon={<ArrowLeftOutlined />}
                onClick={handleExitImpersonation}
                style={{ fontWeight: 600, borderRadius: 6 }}
              >
                Exit Impersonation
              </Button>
            )}

            {user?.isSuperAdmin && !isImpersonating && (
              pathname === '/admin' ? (
                <Button
                  size="middle"
                  icon={<HomeOutlined />}
                  onClick={() => router.push('/dashboard')}
                  style={{
                    fontWeight: 600,
                    borderRadius: 8,
                    background: isDark ? '#262626' : '#f5f5f5',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  CRM Workspace
                </Button>
              ) : (
                <Button
                  size="middle"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => router.push('/admin')}
                  style={{
                    background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                    borderColor: '#d48806',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: 8,
                    boxShadow: '0 2px 6px rgba(212, 136, 6, 0.25)',
                  }}
                >
                  Master Console
                </Button>
              )
            )}

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
                { value: 'hi', label: 'हिंदी (HI)' },
              ]}
              prefix={<GlobalOutlined />}
              style={{ width: 120 }}
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

        {/* Impersonation Warning Banner */}
        {isImpersonating && (
          <div
            style={{
              background: 'linear-gradient(90deg, #722ed1 0%, #1677ff 100%)',
              color: '#fff',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            <Space size="middle">

              <SafetyCertificateOutlined style={{ fontSize: 18, color: '#faad14' }} />
              <div>
                <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                  Client Workspace Impersonation Active
                </Text>
                <span style={{ color: '#e6f4ff', fontSize: 12, marginLeft: 8 }}>
                  Managing as <strong>{user?.companyName || 'Business Client'}</strong> ({user?.name || 'User'} &bull; {user?.role || 'Owner'})
                </span>
              </div>
            </Space>
            <Button
              type="primary"
              danger
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={handleExitImpersonation}
              style={{ fontWeight: 600, borderRadius: 6 }}
            >
              Exit & Return to Master Console
            </Button>
          </div>
        )}

        {/* Content Area */}
        <Content style={{ margin: 20, minHeight: 280, paddingBottom: 64 }}>
          {children}
        </Content>

        {/* Mobile Bottom Navigation Bar (Under 768px) */}
        <div className="ginie-mobile-bottom-nav">
          <Link href="/dashboard" className={`bottom-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '8px 0 20px' }}>
            <Link
              href="/erp"
              onClick={() => setMoreDrawerOpen(false)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#262626' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <span style={{ fontSize: 12 }}>ERP Modules</span>
            </Link>
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
      <GinieAiAssistantDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </Layout>
  );
}
