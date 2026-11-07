'use client';

import React, { useState } from 'react';
import { Button as AntButton, Tooltip } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface AppButtonProps extends Omit<AntButtonProps, 'onClick'> {
  /** Optional custom tooltip (mandatory for icon-only buttons for accessibility) */
  tooltip?: string;
  /** Async or sync onClick handler with automatic double-click prevention */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void | Promise<any>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  tooltip,
  children,
  onClick,
  loading: externalLoading,
  disabled,
  style,
  className = '',
  icon,
  type = 'default',
  danger,
  ...restProps
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = Boolean(externalLoading || internalLoading);

  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    if (!onClick || isBusy || disabled) return;

    try {
      const result = onClick(e);
      if (result && typeof (result as any).then === 'function') {
        setInternalLoading(true);
        await result;
      }
    } catch (err) {
      // Handled upstream
    } finally {
      setInternalLoading(false);
    }
  };

  const isIconOnly = Boolean(icon && !children);

  const baseStyle: React.CSSProperties = {
    minHeight: 40,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...style,
  };

  const buttonElement = (
    <AntButton
      type={type}
      danger={danger}
      icon={icon}
      loading={externalLoading !== undefined ? externalLoading : internalLoading}
      disabled={disabled || isBusy}
      onClick={handleClick}
      style={baseStyle}
      className={`app-button ${isIconOnly ? 'app-button-icon-only' : ''} ${className}`}
      aria-label={isIconOnly ? tooltip || restProps['aria-label'] || 'Action' : undefined}
      {...restProps}
    >
      {children}
    </AntButton>
  );

  if (isIconOnly && tooltip) {
    return (
      <Tooltip title={tooltip} placement="top">
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default AppButton;
