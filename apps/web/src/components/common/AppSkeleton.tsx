'use client';

import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';

export interface AppSkeletonProps {
  /** Type of skeleton layout */
  type?: 'table' | 'cards' | 'stats' | 'form' | 'detail';
  /** Number of rows or cards */
  count?: number;
  active?: boolean;
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  type = 'table',
  count = 4,
  active = true,
}) => {
  if (type === 'stats') {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: count }).map((_, idx) => (
          <Col xs={12} sm={12} lg={6} key={idx}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton active={active} paragraph={{ rows: 1 }} title={{ width: '40%' }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (type === 'cards') {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: count }).map((_, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton active={active} avatar paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (type === 'form') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton active={active} paragraph={{ rows: 4 }} title={false} />
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div>
        <Skeleton active={active} avatar paragraph={{ rows: 3 }} />
        <div style={{ marginTop: 24 }}>
          <Skeleton active={active} paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div
      style={{
        background: '#ffffff',
        padding: 20,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <Skeleton.Input active={active} size="small" style={{ width: 180 }} />
        <Skeleton.Button active={active} size="small" style={{ width: 100 }} />
      </div>
      <Skeleton active={active} paragraph={{ rows: Math.min(count, 8) }} title={false} />
    </div>
  );
};

export default AppSkeleton;
