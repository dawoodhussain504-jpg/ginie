'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency } from '@ginie/i18n';

const { Title, Text } = Typography;

export default function SalesPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [lostModalVisible, setLostModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [targetStageId, setTargetStageId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [lostForm] = Form.useForm();

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/deals/pipelines');
      setPipelines(res || []);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (values: any) => {
    try {
      const currentPipeline = pipelines[0];
      await api.post('/api/deals', {
        ...values,
        pipelineId: currentPipeline.id,
      });
      message.success(t.common.success);
      setAddModalVisible(false);
      form.resetFields();
      loadPipelines();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleStageChange = async (dealId: string, newStageId: string, stageName: string) => {
    if (stageName.toLowerCase().includes('lost')) {
      setSelectedDeal({ id: dealId });
      setTargetStageId(newStageId);
      setLostModalVisible(true);
      return;
    }

    const isWon = stageName.toLowerCase().includes('won');
    try {
      await api.patch(`/api/deals/${dealId}/stage`, {
        stageId: newStageId,
        status: isWon ? 'won' : 'open',
      });
      message.success(t.common.success);
      loadPipelines();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const submitLostReason = async (values: any) => {
    if (!selectedDeal || !targetStageId) return;
    try {
      await api.patch(`/api/deals/${selectedDeal.id}/stage`, {
        stageId: targetStageId,
        status: 'lost',
        lostReason: values.lostReason,
      });
      message.success(t.common.success);
      setLostModalVisible(false);
      lostForm.resetFields();
      loadPipelines();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const currentPipeline = pipelines[0];
  const stages = currentPipeline?.stages || [];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t.sales.title}
          </Title>
          <Text type="secondary">{t.sales.subtitle}</Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setAddModalVisible(true)}
        >
          {t.sales.addSale}
        </Button>
      </div>

      {/* Kanban Board View */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 16,
          minHeight: '75vh',
        }}
      >
        {stages.map((stage: any) => {
          const stageTotal = (stage.deals || []).reduce(
            (acc: number, d: any) => acc + (Number(d.value) || 0),
            0,
          );

          return (
            <div
              key={stage.id}
              style={{
                flex: '0 0 290px',
                background: '#f8f9fa',
                borderRadius: 10,
                border: '1px solid #e8e8e8',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '80vh',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e8e8e8',
                  background: '#fff',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14 }}>
                    {stage.name}
                  </Text>
                  <Tag color={stage.color || 'blue'}>{(stage.deals || []).length}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatIndianCurrency(stageTotal)}
                </Text>
              </div>

              {/* Deals List */}
              <div
                className="kanban-column-scroll"
                style={{
                  padding: 12,
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {(stage.deals || []).map((deal: any) => (
                  <Card
                    key={deal.id}
                    size="small"
                    style={{
                      borderRadius: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Text strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
                      {deal.title}
                    </Text>

                    {deal.company?.name && (
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        <ShopOutlined /> {deal.company.name}
                      </Text>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 10,
                      }}
                    >
                      <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                        {formatIndianCurrency(Number(deal.value) || 0)}
                      </Text>

                      {/* Stage Mover Selector */}
                      <Select
                        size="small"
                        value={stage.id}
                        style={{ width: 110 }}
                        onChange={(newId) => {
                          const targetStage = stages.find((s: any) => s.id === newId);
                          handleStageChange(deal.id, newId, targetStage?.name || '');
                        }}
                        options={stages.map((s: any) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                      />
                    </div>
                  </Card>
                ))}

                {(stage.deals || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t.sales.emptyColumn}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sale in Progress Modal */}
      <Modal
        title={t.sales.addSale}
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateDeal}
          initialValues={{ stageId: stages[0]?.id }}
        >
          <Form.Item
            name="title"
            label="Sale Title / Subject"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Annual Software Contract" />
          </Form.Item>

          <Form.Item
            name="value"
            label={t.sales.valueLabel}
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="50000"
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            name="stageId"
            label="Initial Sales Step"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Select
              options={stages.map((s: any) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setAddModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Lost Reason Modal */}
      <Modal
        title={t.sales.lost}
        open={lostModalVisible}
        onCancel={() => setLostModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={lostForm} layout="vertical" onFinish={submitLostReason}>
          <Form.Item
            name="lostReason"
            label={t.sales.lostReason}
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input.TextArea rows={3} placeholder="e.g. Budget constraints / Selected another vendor" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setLostModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" danger htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
