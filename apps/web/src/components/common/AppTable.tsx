'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Typography } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import AppEmpty from './AppEmpty';
import AppSkeleton from './AppSkeleton';

const { Text } = Typography;

export interface AppTableProps<RecordType extends object = any> extends TableProps<RecordType> {
  /** Optional custom card renderer for mobile screens (< 768px) */
  mobileCardRender?: (record: RecordType, index: number) => React.ReactNode;
  /** Empty state description */
  emptyText?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function AppTable<RecordType extends object = any>({
  columns = [],
  dataSource = [],
  loading,
  mobileCardRender,
  emptyText = 'Koi data nahi mila.',
  emptyActionLabel,
  onEmptyAction,
  rowKey = 'id',
  className = '',
  pagination = { pageSize: 10 },
  ...restProps
}: AppTableProps<RecordType>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return <AppSkeleton type={isMobile ? 'cards' : 'table'} count={4} />;
  }

  const items = (dataSource || []) as RecordType[];

  if (items.length === 0) {
    return (
      <AppEmpty
        description={emptyText}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  // Mobile View: Render responsive cards below 768px
  if (isMobile) {
    return (
      <div className="app-mobile-card-table" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((record, index) => {
          if (mobileCardRender) {
            return (
              <React.Fragment key={typeof rowKey === 'function' ? rowKey(record, index) : ((record as any)[rowKey as string] || index)}>
                {mobileCardRender(record, index)}
              </React.Fragment>
            );
          }

          // Default auto-card generator from columns
          return (
            <Card
              key={typeof rowKey === 'function' ? rowKey(record, index) : ((record as any)[rowKey as string] || index)}
              size="small"
              style={{
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              bodyStyle={{ padding: 14 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {columns.map((col: any, colIdx) => {
                  const title = typeof col.title === 'function' ? col.title({}) : col.title;
                  const dataIndex = col.dataIndex;
                  const value = dataIndex ? (record as any)[dataIndex] : null;
                  const renderedValue = col.render ? col.render(value, record, index) : value;

                  // Render primary title (first column) boldly
                  if (colIdx === 0) {
                    return (
                      <div key={col.key || colIdx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {renderedValue}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={col.key || colIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {title}
                      </Text>
                      <div>{renderedValue}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop View: Ant Design Table with responsive wrapper and row hover
  return (
    <div className={`app-table-wrapper ${className}`}>
      <Table<RecordType>
        columns={columns}
        dataSource={items}
        rowKey={rowKey}
        pagination={pagination}
        className="app-table"
        locale={{
          emptyText: <AppEmpty description={emptyText} actionLabel={emptyActionLabel} onAction={onEmptyAction} />,
        }}
        {...restProps}
      />
    </div>
  );
}

export default AppTable;
