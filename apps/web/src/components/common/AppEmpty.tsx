'use client';

import React from 'react';
import { Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import AppButton from './AppButton';

const { Text } = Typography;

export interface AppEmptyProps {
  /** One friendly, simple sentence e.g. "Abhi koi customer nahi hai." */
  description: string;
  /** Action button label e.g. "Pehla Customer Jodein" */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Custom icon or defaults to clean SVG Inbox */
  icon?: React.ReactNode;
  /** Optional secondary helper note */
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AppEmpty: React.FC<AppEmptyProps> = ({
  description,
  actionLabel,
  onAction,
  icon,
  hint,
  className = '',
  style,
}) => {
  return (
    <div
      className={`app-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: 12,
        border: '1px dashed #cbd5e1',
        margin: '12px 0',
        ...style,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          marginBottom: 14,
        }}
      >
        {icon || <InboxOutlined />}
      </div>

      <Text strong style={{ fontSize: 15, color: '#1e293b', marginBottom: 4, display: 'block' }}>
        {description}
      </Text>

      {hint && (
        <Text type="secondary" style={{ fontSize: 13, maxWidth: 360, marginBottom: 16, display: 'block', lineHeight: 1.4 }}>
          {hint}
        </Text>
      )}

      {actionLabel && onAction && (
        <div style={{ marginTop: hint ? 0 : 12 }}>
          <AppButton type="primary" onClick={onAction}>
            {actionLabel}
          </AppButton>
        </div>
      )}
    </div>
  );
};

export default AppEmpty;
