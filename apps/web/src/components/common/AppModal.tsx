'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Typography } from 'antd';
import type { ModalProps } from 'antd';
import AppButton from './AppButton';
import ConfirmDialog from './ConfirmDialog';

const { Title } = Typography;

export interface AppModalProps extends Omit<ModalProps, 'onOk' | 'footer'> {
  /** Clear title describing the task e.g. "Naya Customer Jodein" */
  title: string;
  /** Subtitle or context */
  subtitle?: string;
  /** Label for primary action button e.g. "Customer Jodein", "Save Karein" (never "Submit" or "OK") */
  okText?: string;
  cancelText?: string;
  /** Primary button click handler (can be async) */
  onOk?: () => Promise<void> | void;
  onCancel?: () => void;
  /** Whether the form has unsaved edits */
  isDirty?: boolean;
  /** Optional custom footer, or set to null to hide */
  customFooter?: React.ReactNode;
}

export const AppModal: React.FC<AppModalProps> = ({
  open,
  title,
  subtitle,
  okText = 'Save Karein',
  cancelText = 'Cancel',
  onOk,
  onCancel,
  isDirty = false,
  children,
  confirmLoading,
  customFooter,
  width = 520,
  destroyOnClose = true,
  ...restProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLoading = confirmLoading !== undefined ? confirmLoading : internalLoading;

  // Auto-focus first input field when modal opens
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
      }, 120);
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
      <Modal
        open={open}
        onCancel={handleRequestClose}
        footer={null}
        centered
        destroyOnClose={destroyOnClose}
        width={width}
        maskClosable={!isLoading}
        keyboard={!isLoading}
        styles={{
          content: {
            borderRadius: 12,
            padding: 0,
            overflow: 'hidden',
          },
        }}
        {...restProps}
      >
        <div ref={containerRef}>
          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
            }}
          >
            <Title level={4} style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>
              {title}
            </Title>
            {subtitle && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>
            {children}
          </div>

          {/* Standard Footer: Cancel + Primary action */}
          {customFooter !== null && (
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #f1f5f9',
                background: '#fafafa',
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
          )}
        </div>
      </Modal>

      {/* Discard changes guard */}
      <ConfirmDialog
        open={discardConfirmOpen}
        title="Badlav save nahi hue. Band karein?"
        description="Aapne jo badlav kiye hain wo save nahi honge."
        confirmLabel="Haan, Band Karein"
        cancelLabel="Form Par Lautein"
        danger={false}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
};

export default AppModal;
