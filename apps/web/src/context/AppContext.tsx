'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import hiIN from 'antd/locale/hi_IN';
import { AuthenticatedUser } from '@ginie/common';
import { getDictionary, Locale, Dictionary } from '@ginie/i18n';

interface AppContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  locale: Locale;
  setLocale: (loc: Locale) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  t: Dictionary;
  login: (token: string, user: AuthenticatedUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [brandColor, setBrandColor] = useState<string>('#2563eb');

  useEffect(() => {
    const savedToken = localStorage.getItem('ginie_token');
    const savedUser = localStorage.getItem('ginie_user');
    const savedLocale = localStorage.getItem('ginie_locale') as Locale;
    const savedDark = localStorage.getItem('ginie_dark') === 'true';

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
        if (parsed.companyBrandColor) {
          setBrandColor(parsed.companyBrandColor);
        }
      } catch {}
    }

    if (savedLocale === 'en' || savedLocale === 'hi') {
      setLocaleState(savedLocale);
    }
    setIsDark(savedDark);
  }, []);

  const login = (newToken: string, newUser: AuthenticatedUser) => {
    localStorage.setItem('ginie_token', newToken);
    localStorage.setItem('ginie_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.companyBrandColor) {
      setBrandColor(newUser.companyBrandColor);
    }
  };

  const logout = () => {
    localStorage.removeItem('ginie_token');
    localStorage.removeItem('ginie_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem('ginie_locale', newLocale);
    setLocaleState(newLocale);
  };

  const setDark = (dark: boolean) => {
    localStorage.setItem('ginie_dark', String(dark));
    setIsDark(dark);
  };

  const t = getDictionary(locale);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        locale,
        setLocale,
        isDark,
        setIsDark: setDark,
        brandColor,
        setBrandColor,
        t,
        login,
        logout,
      }}
    >
      <ConfigProvider
        locale={locale === 'hi' ? hiIN : enUS}
        theme={{
          token: {
            colorPrimary: brandColor || '#2563eb',
            colorInfo: brandColor || '#2563eb',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            borderRadius: 8,
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            colorBgContainer: isDark ? '#141923' : '#ffffff',
            colorBgLayout: isDark ? '#0b0f17' : '#f8fafc',
            colorBorder: isDark ? '#263042' : '#e2e8f0',
            colorBorderSecondary: isDark ? '#1e2638' : '#f1f5f9',
            fontSize: 14,
            lineHeight: 1.5714,
          },
          components: {
            Button: {
              controlHeight: 38,
              borderRadius: 8,
              fontWeight: 600,
            },
            Card: {
              borderRadiusLG: 12,
              paddingLG: 20,
            },
            Table: {
              borderRadius: 8,
            },
            Menu: {
              itemBorderRadius: 8,
              itemMarginInline: 8,
            },
          },
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
