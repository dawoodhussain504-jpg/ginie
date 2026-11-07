'use client';

import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface AppTabsProps extends Omit<TabsProps, 'onChange'> {
  /** The URL query parameter key used to persist the active tab (defaults to 'tab') */
  urlKey?: string;
  /** Optional custom tab change callback */
  onTabChange?: (activeKey: string) => void;
  /** Max visible tabs before overflowing into more menu (defaults to 6) */
  maxTabs?: number;
}

export const AppTabs: React.FC<AppTabsProps> = ({
  items = [],
  activeKey,
  defaultActiveKey,
  urlKey = 'tab',
  onTabChange,
  className = '',
  maxTabs = 6,
  ...restProps
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current active tab from URL query params if not explicitly controlled
  const queryTab = searchParams ? searchParams.get(urlKey) : null;
  const currentActiveKey = activeKey !== undefined
    ? activeKey
    : queryTab || defaultActiveKey || (items[0]?.key as string);

  const handleTabChange = (key: string) => {
    if (urlKey && searchParams) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set(urlKey, key);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathname}${query}`, { scroll: false });
    }
    onTabChange?.(key);
  };

  return (
    <div className={`app-tabs-container ${className}`}>
      <Tabs
        activeKey={currentActiveKey}
        items={items}
        onChange={handleTabChange}
        tabBarGutter={16}
        moreIcon={<span style={{ fontWeight: 600, fontSize: 13 }}>Aur Options...</span>}
        className="app-tabs"
        {...restProps}
      />
    </div>
  );
};

export default AppTabs;
