'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Typography } from 'antd';
import type { DrawerProps } from 'antd';
import AppButton from './AppButton';
import ConfirmDialog from './ConfirmDialog';

const { Title } = Typography;

export interface AppDrawerProps extends Omit<DrawerProps, 'footer'> {
  title: string;
  subtitle?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => Promise<void> | void;
  onCancel?: () => void;
  isDirty?: boolean;
  confirmLoading?: boolean;
  customFooter?: React.ReactNode;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  title,
  subtitle,
  okText = 'Save Karein',
  cancelText = 'Cancel',
  onOk,
  onCancel,
  isDirty = false,
  confirmLoading,
  children,
  width = 620,
  customFooter,
  destroyOnClose = true,
  ...restProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLoading = confirmLoading !== undefined ? confirmLoading : internalLoading;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const firstInput = containerRef.current.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), .ant-select:not(.ant-select-disabled)'
          );
          if (firstInput && typeof firstInput.focus === 'function') {
            firstInput.focus();
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleRequestClose = () => {
    if (isLoading) return;
    if (isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onCancel?.();
  };

  const handleConfirmDiscard = () => {
    setDiscardConfirmOpen(false);
    onCancel?.();
  };

  const handlePrimaryClick = async () => {
    if (!onOk || isLoading) return;
    try {
      const res = onOk();
      if (res && typeof (res as any).then === 'function') {
        setInternalLoading(true);
        await res;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={handleRequestClose}
        width={width}
        destroyOnClose={destroyOnClose}
        maskClosable={!isLoading}
        keyboard={!isLoading}
        styles={{
          header: {
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
          },
          body: {
            padding: '24px',
          },
          footer: {
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafafa',
          },
        }}
        title={
          <div>
            <Title level={4} style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>
              {title}
            </Title>
            {subtitle && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
        }
        footer={
          customFooter !== null && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {customFooter ? (
                customFooter
              ) : (
                <>
                  <AppButton onClick={handleRequestClose} disabled={isLoading} style={{ minWidth: 90 }}>
                    {cancelText}
                  </AppButton>
                  {onOk && (
                    <AppButton
                      type="primary"
                      loading={isLoading}
                      onClick={handlePrimaryClick}
                      style={{ minWidth: 120 }}
                    >
                      {okText}
                    </AppButton>
                  )}
                </>
              )}
            </div>
          )
        }
        {...restProps}
      >
        <div ref={containerRef}>{children}</div>
      </Drawer>

      <ConfirmDialog
        open={discardConfirmOpen}
        title="Badlav save nahi hue. Band karein?"
        description="Aapne jo jaankari bhari hai wo save nahi hogi."
        confirmLabel="Haan, Band Karein"
        cancelLabel="Form Par Lautein"
        danger={false}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
};

export default AppDrawer;
