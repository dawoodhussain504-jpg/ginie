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
          if (company && (company.onboardingCompleted === false || !company.businessType)) {
            setOnboardingOpen(true);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const isOwnerOrSuper = user?.isSuperAdmin || user?.role === 'Owner';
  const canViewBilling = isOwnerOrSuper || user?.permissions?.billing?.view !== false;

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return t.nav.home || 'Home';
    if (path.startsWith('/customers')) return t.nav.customers || 'Customers & Leads';
    if (path.startsWith('/sales')) return 'Sales & Pipeline';
    if (path.startsWith('/find-customers')) return t.nav.findCustomers || 'Find Customers';
    if (path.startsWith('/erp')) return 'ERP & Operations';
    if (path.startsWith('/digital-store')) return 'Digital Storefront';
    if (path.startsWith('/whatsapp')) return 'Messages & WhatsApp';
    if (path.startsWith('/billing')) return t.nav.billing || 'Billing & Invoices';
    if (path.startsWith('/reports')) return t.nav.reports || 'Reports & Insights';
    if (path.startsWith('/settings')) return t.nav.settings || 'Settings';
    if (path === '/admin') return 'Master Console';
    return 'Dashboard';
  };

  // Structured 3-Tier Sidebar Menu
  const visibleMenuItems: any[] = [
    {
      type: 'group',
      label: (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>
          Core Sales
        </span>
      ),
      children: [
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
          key: '/sales',
          icon: <FundProjectionScreenOutlined />,
          label: <Link href="/sales">Sales & Tasks</Link>,
        },
        {
          key: '/find-customers',
          icon: <CompassOutlined style={{ color: '#2563eb' }} />,
          label: (
            <Link href="/find-customers">
              <span style={{ fontWeight: 600 }}>{t.nav.findCustomers}</span>
            </Link>
          ),
        },
      ],
    },
    {
      type: 'group',
      label: (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>
          Operations & ERP
        </span>
      ),
      children: [
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
          key: '/digital-store',
          icon: <ShopOutlined />,
          label: (
            <Link href="/digital-store">
              <span style={{ fontWeight: 600 }}>Digital Store</span>
            </Link>
          ),
        },
        ...(canViewBilling
          ? [
              {
                key: '/billing',
                icon: <FileTextOutlined />,
                label: <Link href="/billing">{t.nav.billing}</Link>,
              },
            ]
          : []),
      ],
    },
    {
      type: 'group',
      label: (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>
          Channels & Setup
        </span>
      ),
      children: [
        {
          key: '/whatsapp',
          icon: <WhatsAppOutlined style={{ color: '#25D366' }} />,
          label: <Link href="/whatsapp">WhatsApp Inbox</Link>,
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
      ],
    },
    ...(user?.isSuperAdmin
      ? [
          {
            type: 'group',
            label: (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#d48806', textTransform: 'uppercase' }}>
                Platform HQ
              </span>
            ),
            children: [
              {
                key: '/admin',
                icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
                label: (
                  <Link href="/admin">
                    <span style={{ color: '#d48806', fontWeight: 600 }}>Master Console</span>
                  </Link>
                ),
              },
            ],
          },
        ]
      : []),
  ];

  const userDropdownItems = {
    items: [
      {
        key: 'user-info',
        label: (
          <div style={{ padding: '8px 10px' }}>
            <Text strong style={{ fontSize: 14 }}>{user?.name || 'User'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.companyName || 'Business Cockpit'}
            </Text>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: user?.isSuperAdmin ? '#fffbe6' : user?.role === 'Owner' ? '#f9f0ff' : '#eff6ff',
                  color: user?.isSuperAdmin ? '#d48806' : user?.role === 'Owner' ? '#722ed1' : '#2563eb',
                  border: user?.isSuperAdmin ? '1px solid #ffe58f' : user?.role === 'Owner' ? '1px solid #d3adf7' : '1px solid #bfdbfe',
                }}
              >
                {user?.isSuperAdmin ? 'Platform Admin' : user?.role || 'Staff Member'}
              </span>
            </div>
          </div>
        ),
      },
      { type: 'divider' as const },
      {
        key: 'digital-store',
        icon: <ShopOutlined style={{ color: '#2563eb' }} />,
        label: (
          <Link href="/digital-store">
            <span style={{ fontWeight: 600 }}>Digital Storefront</span>
          </Link>
        ),
      },
      ...(isInstallable
        ? [
            {
              key: 'install-app',
              icon: <MobileOutlined style={{ color: '#10b981' }} />,
              label: <a onClick={handleInstallApp}>Install GINIE Mobile App</a>,
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
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href="/settings">{t.nav.settings}</Link>,
      },
      { type: 'divider' as const },
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
    if (pathname.startsWith('/erp')) return '/erp';
    if (pathname.startsWith('/digital-store')) return '/digital-store';
    if (pathname.startsWith('/whatsapp')) return '/whatsapp';
    if (pathname.startsWith('/billing')) return '/billing';
    if (pathname.startsWith('/reports')) return '/reports';
    if (pathname.startsWith('/settings') || pathname === '/subscriptions' || pathname === '/forms' || pathname === '/automations' || pathname === '/audit-logs') return '/settings';
    return '/dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#0b0f17' : '#f8fafc' }}>
      {/* Desktop Sider */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? 'dark' : 'light'}
        className="ginie-desktop-sider"
        style={{
          borderRight: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          background: isDark ? '#0f172a' : '#ffffff',
        }}
        width={250}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: 12,
            borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 18,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              flexShrink: 0,
            }}
          >
            G
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text strong style={{ fontSize: 16, lineHeight: 1.2, letterSpacing: '-0.02em', color: isDark ? '#f8fafc' : '#0f172a' }}>
                  GINIE
                </Text>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '1px 6px',
                    borderRadius: 999,
                    border: '1px solid #bfdbfe',
                  }}
                >
                  CRM
                </span>
              </div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.companyName || 'Business Cockpit'}
              </Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={visibleMenuItems}
          style={{
            borderRight: 0,
            marginTop: 8,
            background: 'transparent',
          }}
        />
      </Sider>

      <Layout style={{ background: isDark ? '#0b0f17' : '#f8fafc' }}>
        {/* Top Header */}
        <Header
          style={{
            background: isDark ? '#0f172a' : '#ffffff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Left: Breadcrumb & Workspace badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' }}>
                GINIE
              </span>
              <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: 12 }}>/</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {getPageTitle(pathname)}
              </span>
            </div>

            <Tag
              style={{
                borderRadius: 999,
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
                background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#f0f9ff',
                color: isDark ? '#38bdf8' : '#0284c7',
                padding: '2px 10px',
              }}
            >
              {user?.companyName || 'Business Cockpit'}
            </Tag>
          </div>

          {/* Right: Controls & User Profile */}
          <Space size="middle" align="center">
            {/* Sync status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#f59e0b',
                  boxShadow: isOnline ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
                }}
              />
              <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                {isOnline ? 'Cloud Synced' : 'Offline'}
              </span>
            </div>

            {/* AI Assistant Button */}
            <Button
              icon={<ThunderboltFilled style={{ color: '#2563eb' }} />}
              onClick={() => setAiDrawerOpen(true)}
              style={{
                borderRadius: 8,
                background: isDark ? 'rgba(37, 99, 235, 0.12)' : '#eff6ff',
                borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : '#bfdbfe',
                color: isDark ? '#60a5fa' : '#2563eb',
                fontWeight: 700,
                height: 36,
              }}
            >
              Ask GINIE AI
            </Button>

            {/* Impersonation Exit if active */}
            {isImpersonating && (
              <Button
                type="primary"
                danger
                size="middle"
                icon={<ArrowLeftOutlined />}
                onClick={handleExitImpersonation}
                style={{ fontWeight: 600, borderRadius: 8, height: 36 }}
              >
                Exit Impersonation
              </Button>
            )}

            {/* Language Selector */}
            <Select
              size="middle"
              value={locale}
              onChange={setLocale}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिंदी (HI)' },
              ]}
              prefix={<GlobalOutlined style={{ color: isDark ? '#94a3b8' : '#64748b' }} />}
              style={{ width: 110 }}
            />

            {/* Theme Toggle */}
            <Button
              type="text"
              icon={isDark ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined style={{ color: '#64748b' }} />}
              onClick={() => setIsDark(!isDark)}
              style={{ borderRadius: 8, height: 36, width: 36 }}
            />

            {/* User Dropdown */}
            <Dropdown menu={userDropdownItems} trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s ease',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: brandColor || '#2563eb',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  }}
                  size={32}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <div className="ginie-header-username" style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 13, display: 'block', color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {user?.name || 'My Account'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user?.isSuperAdmin ? 'Platform Admin' : user?.role || 'Staff'}
                  </Text>
                </div>
              </div>
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
        <Content style={{ margin: '24px 24px', minHeight: 'calc(100vh - 120px)', paddingBottom: 64 }}>
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
