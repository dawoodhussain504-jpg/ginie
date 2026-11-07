'use client';

import React, { useState } from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import AppButton from './AppButton';

const { Text, Title } = Typography;

export interface ConfirmDialogProps {
  open: boolean;
  /** Clear title stating the item and action e.g. "Ramesh Traders ko hatana hai?" */
  title: string;
  /** Additional explanation or consequence e.g. "Hatane ke baad yeh customer list me nahi dikhega." */
  description?: string;
  /** Name of the item to delete/archive for explicit safety */
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  itemName,
  confirmLabel = 'Haan, Hatayein',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      centered
      destroyOnClose
      width={440}
      styles={{
        content: {
          borderRadius: 12,
          padding: '24px 24px 20px',
        },
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: danger ? '#fef2f2' : '#f0f9ff',
            color: danger ? '#ef4444' : '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          <ExclamationCircleFilled />
        </div>

        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: '0 0 6px 0', fontSize: 16, color: '#0f172a' }}>
            {title}
          </Title>

          {itemName && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '6px 12px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                color: '#334155',
                marginBottom: 8,
              }}
            >
              {itemName}
            </div>
          )}

          {description && (
            <Text type="secondary" style={{ fontSize: 13, display: 'block', lineHeight: 1.5 }}>
              {description}
            </Text>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 20,
            }}
          >
            <AppButton onClick={onCancel} disabled={loading} style={{ minWidth: 90 }}>
              {cancelLabel}
            </AppButton>
            <AppButton
              type="primary"
              danger={danger}
              loading={loading}
              onClick={handleConfirm}
              style={{ minWidth: 120 }}
            >
              {confirmLabel}
            </AppButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
