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
} from 'antd';
import {
  HomeOutlined,
  UsergroupAddOutlined,
  CompassOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
  GlobalOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, t, locale, setLocale, isDark, setIsDark, brandColor } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('ginie_token');
    if (!token && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [router]);

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
      label: <Link href="/sales">{t.nav.sales}</Link>,
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: <Link href="/tasks">{t.nav.tasks}</Link>,
    },
    {
      key: '/people',
      icon: <TeamOutlined />,
      label: <Link href="/people">{t.nav.people}</Link>,
    },
    {
      key: '/companies',
      icon: <ShopOutlined />,
      label: <Link href="/companies">{t.nav.companies}</Link>,
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
            <Text strong>{user?.name || 'Administrator'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.companyName || 'Company'} • {user?.role || 'Owner'}
            </Text>
          </div>
        ),
      },
      { type: 'divider' as const },
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? 'dark' : 'light'}
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
                {user?.companyName || 'CRM'}
              </Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: isDark ? '#141414' : '#fff',
            padding: '0 24px',
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
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Text strong>{user?.name || 'Account'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
