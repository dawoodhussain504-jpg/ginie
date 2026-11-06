'use client';

export const dynamic = 'force-dynamic';

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
  TeamOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import OnboardingWizardModal from '@/components/OnboardingWizardModal';
import GinieAiAssistantDrawer from '@/components/GinieAiAssistantDrawer';
import SupportModal from '@/components/SupportModal';
import GinieLogo from '@/components/GinieLogo';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, login, logout, t, locale, setLocale, isDark, setIsDark, brandColor } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
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
      const hasSession = !!sessionStorage.getItem('admin_master_token');
      const hasLocalBackup = !!localStorage.getItem('ginie_master_backup');
      const isImpersonatedFlag = !!(user as any)?.impersonated;
      setIsImpersonating(hasSession || hasLocalBackup || isImpersonatedFlag);
    }
  }, [pathname, user]);

  const isImpersonatingActive =
    isImpersonating ||
    (typeof window !== 'undefined' && (
      !!sessionStorage.getItem('admin_master_token') ||
      !!localStorage.getItem('ginie_master_backup') ||
      !!(user as any)?.impersonated
    ));

  const handleExitImpersonation = async () => {
    try {
      let masterToken = sessionStorage.getItem('admin_master_token');
      let masterUserStr = sessionStorage.getItem('admin_master_user');
      let masterRefreshToken = sessionStorage.getItem('admin_master_refresh_token');

      const backupStr = localStorage.getItem('ginie_master_backup');
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          masterToken = masterToken || backup.token;
          masterUserStr = masterUserStr || (backup.user ? JSON.stringify(backup.user) : null);
          masterRefreshToken = masterRefreshToken || backup.refreshToken;
        } catch {}
      }

      // 1. Call secure backend endpoint to restore Super Admin tokens & profile (passing masterToken)
      const res = await api.post('/api/auth/exit-impersonation', { masterToken }).catch(() => null);

      if (res?.tokens?.accessToken && res?.user) {
        sessionStorage.removeItem('admin_master_token');
        sessionStorage.removeItem('admin_master_user');
        sessionStorage.removeItem('admin_master_refresh_token');
        localStorage.removeItem('ginie_master_backup');

        login(res.tokens.accessToken, res.user, res.tokens.refreshToken);
        message.success('Master Admin session restored successfully!');
        window.location.href = '/admin';
        return;
      }

      // 2. Local fallback if offline or backend call returned null
      if (masterToken && masterUserStr) {
        const masterUser = JSON.parse(masterUserStr);
        sessionStorage.removeItem('admin_master_token');
        sessionStorage.removeItem('admin_master_user');
        sessionStorage.removeItem('admin_master_refresh_token');
        localStorage.removeItem('ginie_master_backup');

        login(masterToken, masterUser, masterRefreshToken || undefined);
        message.success('Master Admin session restored!');
        window.location.href = '/admin';
        return;
      }

      // 3. Fallback: navigate to admin
      message.info('Redirecting to Master Console...');
      window.location.href = '/admin';
    } catch (err) {
      window.location.href = '/admin';
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
    if (path.startsWith('/khata')) return 'Udhari Khata & Ledger (खाता बही)';
    if (path.startsWith('/staff')) return 'Staff & Payroll (कर्मचारी व वेतन)';
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
          key: '/khata',
          icon: <BookOutlined style={{ color: '#059669' }} />,
          label: (
            <Link href="/khata">
              <span style={{ fontWeight: 600 }}>Khata & Ledger</span>
            </Link>
          ),
        },
        {
          key: '/staff',
          icon: <TeamOutlined style={{ color: '#2563eb' }} />,
          label: (
            <Link href="/staff">
              <span style={{ fontWeight: 600 }}>Staff & Payroll</span>
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
    ...(user?.isSuperAdmin || isImpersonatingActive
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
                label: isImpersonatingActive ? (
                  <span onClick={handleExitImpersonation} style={{ cursor: 'pointer', color: '#d48806', fontWeight: 600 }}>
                    Exit to Master Console
                  </span>
                ) : (
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
      ...(isImpersonatingActive
        ? [
            {
              key: 'exit-impersonation-dropdown',
              icon: <ArrowLeftOutlined style={{ color: '#ef4444' }} />,
              danger: true,
              label: (
                <div onClick={handleExitImpersonation} style={{ fontWeight: 700, color: '#ef4444' }}>
                  Exit Impersonation & Return to Master Console
                </div>
              ),
            },
            { type: 'divider' as const },
          ]
        : []),
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
        key: 'whatsapp-support',
        icon: <WhatsAppOutlined style={{ color: '#25D366' }} />,
        label: <a onClick={() => setSupportModalOpen(true)}>Help & WhatsApp Support</a>,
      },
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
    if (pathname.startsWith('/khata')) return '/khata';
    if (pathname.startsWith('/staff')) return '/staff';
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
          <GinieLogo size={36} isDark={isDark} />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text strong style={{ fontSize: 17, lineHeight: 1.2, letterSpacing: '-0.02em', color: isDark ? '#f8fafc' : '#0f172a' }}>
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
          className="ginie-mobile-header"
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
          {/* Left: Breadcrumb & Workspace badge (Desktop) + Mobile Brand Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Show GINIE brand logo & title on mobile */}
            <div className="show-on-mobile" style={{ alignItems: 'center' }}>
              <GinieLogo size={30} showText={true} textSize={16} isDark={isDark} />
            </div>

            {/* Desktop breadcrumb */}
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' }}>
                GINIE
              </span>
              <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: 12 }}>/</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {getPageTitle(pathname)}
              </span>
            </div>

            <Tag
              className="hide-on-mobile"
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
            {/* Sync status - Desktop */}
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
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

            {/* AI Assistant Button - Desktop */}
            <div className="hide-on-mobile">
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
            </div>

            {/* WhatsApp Support Button - Desktop */}
            <div className="hide-on-mobile">
              <Button
                icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 16 }} />}
                onClick={() => setSupportModalOpen(true)}
                style={{
                  borderRadius: 8,
                  background: isDark ? 'rgba(37, 211, 102, 0.12)' : '#f0fdf4',
                  borderColor: isDark ? 'rgba(37, 211, 102, 0.3)' : '#bbf7d0',
                  color: isDark ? '#4ade80' : '#15803d',
                  fontWeight: 700,
                  height: 36,
                }}
              >
                Support
              </Button>
            </div>

            {/* AI Assistant Button - Mobile Compact */}
            <div className="show-on-mobile">
              <Button
                type="primary"
                shape="circle"
                size="middle"
                icon={<ThunderboltFilled />}
                onClick={() => setAiDrawerOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
                  borderColor: 'transparent',
                  boxShadow: '0 2px 6px rgba(114, 46, 209, 0.3)',
                }}
              />
            </div>

            {/* WhatsApp Support Button - Mobile Compact */}
            <div className="show-on-mobile">
              <Button
                shape="circle"
                size="middle"
                icon={<WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />}
                onClick={() => setSupportModalOpen(true)}
                style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? 'rgba(37, 211, 102, 0.3)' : '#bbf7d0',
                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                }}
              />
            </div>

            {/* Impersonation Exit if active */}
            {isImpersonatingActive && (
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
        {isImpersonatingActive && (
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
        <Content className="ginie-mobile-content-container" style={{ margin: '24px 24px', minHeight: 'calc(100vh - 120px)', paddingBottom: 64 }}>
          {children}
        </Content>

        {/* Mobile Bottom Navigation Bar (Under 768px - 5 High-Impact Tabs) */}
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
            href="/erp"
            className={`bottom-nav-item ${pathname.startsWith('/erp') ? 'active' : ''}`}
          >
            <AppstoreOutlined />
            <span>ERP POS</span>
          </Link>
          <Link
            href="/digital-store"
            className={`bottom-nav-item ${pathname.startsWith('/digital-store') ? 'active' : ''}`}
          >
            <ShopOutlined />
            <span>Store</span>
          </Link>
          <div
            className={`bottom-nav-item ${moreDrawerOpen ? 'active' : ''}`}
            onClick={() => setMoreDrawerOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <MenuOutlined />
            <span>Menu</span>
          </div>
        </div>

        {/* Mobile More Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>All Business Modules</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GinieLogo size={22} />
                <Tag color="purple" style={{ borderRadius: 10, margin: 0, fontWeight: 700 }}>GINIE</Tag>
              </div>
            </div>
          }
          placement="bottom"
          height="auto"
          onClose={() => setMoreDrawerOpen(false)}
          open={moreDrawerOpen}
          bodyStyle={{ padding: '16px 16px 28px' }}
        >
          {/* Quick AI & Support Action Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                type="primary"
                block
                icon={<ThunderboltFilled />}
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setAiDrawerOpen(true);
                }}
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1677ff 0%, #722ed1 100%)',
                  borderColor: 'transparent',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                GINIE AI
              </Button>
              <Button
                type="primary"
                block
                icon={<WhatsAppOutlined />}
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setSupportModalOpen(true);
                }}
                style={{
                  height: 42,
                  borderRadius: 10,
                  background: '#25D366',
                  borderColor: '#25D366',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#ffffff',
                }}
              >
                WhatsApp Help
              </Button>
            </div>
            {isInstallable && (
              <Button
                block
                icon={<MobileOutlined />}
                onClick={() => {
                  setMoreDrawerOpen(false);
                  handleInstallApp();
                }}
                style={{
                  height: 38,
                  borderRadius: 10,
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  fontWeight: 600,
                }}
              >
                Install App
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Link
              href="/find-customers"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CompassOutlined style={{ fontSize: 22, color: '#0284c7' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Find Leads</span>
            </Link>

            <Link
              href="/sales"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FundProjectionScreenOutlined style={{ fontSize: 22, color: '#7c3aed' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Sales CRM</span>
            </Link>

            <Link
              href="/whatsapp"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WhatsAppOutlined style={{ fontSize: 22, color: '#16a34a' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Messages</span>
            </Link>

            <Link
              href="/billing"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileTextOutlined style={{ fontSize: 22, color: '#2563eb' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Invoices & GST</span>
            </Link>

            <Link
              href="/khata"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOutlined style={{ fontSize: 22, color: '#059669' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Khata Book</span>
            </Link>

            <Link
              href="/staff"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TeamOutlined style={{ fontSize: 22, color: '#2563eb' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Staff & HR</span>
            </Link>

            <Link
              href="/reports"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChartOutlined style={{ fontSize: 22, color: '#ea580c' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Analytics</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMoreDrawerOpen(false)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#1e293b',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SettingOutlined style={{ fontSize: 22, color: '#475569' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Settings</span>
            </Link>

            {(user?.isSuperAdmin || isImpersonatingActive) && (
              <div
                onClick={() => {
                  setMoreDrawerOpen(false);
                  if (isImpersonatingActive) {
                    handleExitImpersonation();
                  } else {
                    router.push('/admin');
                  }
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 6px',
                  borderRadius: 12,
                  background: isImpersonatingActive ? '#fef2f2' : '#fffbeb',
                  border: isImpersonatingActive ? '1px solid #fee2e2' : '1px solid #fef3c7',
                  color: isImpersonatingActive ? '#dc2626' : '#92400e',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: isImpersonatingActive ? '#fee2e2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isImpersonatingActive ? (
                    <ArrowLeftOutlined style={{ fontSize: 22, color: '#dc2626' }} />
                  ) : (
                    <SafetyCertificateOutlined style={{ fontSize: 22, color: '#d97706' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {isImpersonatingActive ? 'Exit Admin' : 'Master Admin'}
                </span>
              </div>
            )}
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
      <SupportModal
        open={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Floating WhatsApp Support Trigger (Desktop) */}
      <div
        className="hide-on-mobile"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 990,
        }}
      >
        <Tooltip title="Direct WhatsApp Support (+91 7870819862)" placement="left">
          <Button
            type="primary"
            icon={<WhatsAppOutlined style={{ fontSize: 22 }} />}
            onClick={() => setSupportModalOpen(true)}
            style={{
              height: 46,
              borderRadius: 24,
              background: '#25D366',
              borderColor: '#25D366',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: '0 4px 18px rgba(37, 211, 102, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 18px',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <span>Need Help?</span>
          </Button>
        </Tooltip>
      </div>
    </Layout>
  );
}
