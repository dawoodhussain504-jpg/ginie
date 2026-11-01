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
  Tabs,
  Table,
  Checkbox,
  DatePicker,
  message,
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency, formatDateIndian } from '@ginie/i18n';
import { useSearchParams, useRouter } from 'next/navigation';

const { Title, Text } = Typography;

function SalesAndTasksContent() {
  const { t, brandColor } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') === 'tasks' ? 'tasks' : 'pipeline';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Deals state
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [addDealModalVisible, setAddDealModalVisible] = useState(false);
  const [lostModalVisible, setLostModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [targetStageId, setTargetStageId] = useState<string | null>(null);
  const [dealForm] = Form.useForm();
  const [lostForm] = Form.useForm();

  // Tasks state
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [taskForm] = Form.useForm();

  useEffect(() => {
    loadPipelines();
    loadTasks();
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

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await api.get('/api/tasks');
      setTasks(res || []);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateDeal = async (values: any) => {
    try {
      const currentPipeline = pipelines[0];
      await api.post('/api/deals', {
        ...values,
        pipelineId: currentPipeline?.id,
      });
      message.success(t.common.success);
      setAddDealModalVisible(false);
      dealForm.resetFields();
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

  const handleCreateTask = async (values: any) => {
    try {
      await api.post('/api/tasks', {
        ...values,
        dueAt: values.dueAt ? values.dueAt.toISOString() : undefined,
      });
      message.success(t.common.success);
      setAddTaskModalVisible(false);
      taskForm.resetFields();
      loadTasks();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.patch(`/api/tasks/${task.id}`, { status: newStatus });
      loadTasks();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const currentPipeline = pipelines[0];
  const stages = currentPipeline?.stages || [];

  const taskColumns = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.status === 'completed'}
          onChange={() => toggleTaskStatus(record)}
        />
      ),
    },
    {
      title: 'Task Details',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <Text delete={record.status === 'completed'} strong={record.status !== 'completed'}>
            {text}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = {
          high: 'red',
          medium: 'orange',
          low: 'blue',
        };
        return <Tag color={colors[priority] || 'blue'}>{(priority || 'medium').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueAt',
      key: 'dueAt',
      render: (dueAt: string) =>
        dueAt ? (
          <Space>
            <CalendarOutlined />
            <span>{formatDateIndian(dueAt)}</span>
          </Space>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '16px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <FundProjectionScreenOutlined style={{ marginRight: 10, color: brandColor }} />
            Sales & Tasks
          </Title>
          <Text type="secondary">
            Manage your sales pipeline, deals in progress, and daily action tasks.
          </Text>
        </div>

        <Space wrap>
          {activeTab === 'pipeline' ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddDealModalVisible(true)}
            >
              Add Deal / Sale
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddTaskModalVisible(true)}
            >
              Add Task
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ borderRadius: 14 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            router.push(`/sales?tab=${key}`);
          }}
          items={[
            {
              key: 'pipeline',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  📊 Pipeline & Deals
                </span>
              ),
              children: (
                <div>
                  {/* Kanban View */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      overflowX: 'auto',
                      paddingBottom: 16,
                      minHeight: '65vh',
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
                            background: '#f9f9f9',
                            borderRadius: 12,
                            padding: 12,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Text strong style={{ fontSize: 14 }}>
                                {stage.name}
                              </Text>
                              <Tag color={stage.color || 'blue'}>{stage.deals?.length || 0}</Tag>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatIndianCurrency(stageTotal)}
                            </Text>
                          </div>

                          <div
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                              overflowY: 'auto',
                            }}
                          >
                            {(stage.deals || []).map((deal: any) => (
                              <Card
                                key={deal.id}
                                size="small"
                                style={{
                                  borderRadius: 8,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                }}
                              >
                                <Text strong style={{ display: 'block', fontSize: 14 }}>
                                  {deal.title}
                                </Text>
                                <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
                                  {formatIndianCurrency(Number(deal.value))}
                                </Text>

                                {deal.contact?.name && (
                                  <div style={{ marginTop: 6, fontSize: 12, color: '#8c8c8c' }}>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {deal.contact.name}
                                  </div>
                                )}

                                {deal.company?.name && (
                                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                    <ShopOutlined style={{ marginRight: 4 }} />
                                    {deal.company.name}
                                  </div>
                                )}

                                <div style={{ marginTop: 10, borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
                                  <Select
                                    size="small"
                                    value={deal.stageId}
                                    style={{ width: '100%' }}
                                    onChange={(newStageId) => {
                                      const targetStage = stages.find((s: any) => s.id === newStageId);
                                      handleStageChange(deal.id, newStageId, targetStage?.name || '');
                                    }}
                                    options={stages.map((s: any) => ({
                                      label: s.name,
                                      value: s.id,
                                    }))}
                                  />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            },
            {
              key: 'tasks',
              label: (
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  📋 Tasks ({tasks.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={tasks}
                  columns={taskColumns}
                  rowKey="id"
                  loading={tasksLoading}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 8 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Add Deal Modal */}
      <Modal
        title={t.sales.addSale}
        open={addDealModalVisible}
        onCancel={() => setAddDealModalVisible(false)}
        onOk={() => dealForm.submit()}
        okText={t.common.save}
      >
        <Form form={dealForm} layout="vertical" onFinish={handleCreateDeal}>
          <Form.Item
            name="title"
            label="Deal / Opportunity Title"
            rules={[{ required: true, message: 'Please enter deal title' }]}
          >
            <Input placeholder="e.g. 50 Sets School Uniforms, Industrial Machinery" />
          </Form.Item>

          <Form.Item
            name="value"
            label="Estimated Value (₹)"
            rules={[{ required: true, message: 'Please enter value' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="50000" />
          </Form.Item>

          <Form.Item
            name="stageId"
            label="Initial Stage"
            rules={[{ required: true, message: 'Please select stage' }]}
          >
            <Select
              placeholder="Select Pipeline Stage"
              options={stages.map((s: any) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        title="Create New Task"
        open={addTaskModalVisible}
        onCancel={() => setAddTaskModalVisible(false)}
        onOk={() => taskForm.submit()}
        okText="Create Task"
      >
        <Form form={taskForm} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item
            name="title"
            label="Task Summary"
            rules={[{ required: true, message: 'Please enter task summary' }]}
          >
            <Input placeholder="e.g. Follow up for revised commercial quotation" />
          </Form.Item>

          <Form.Item name="description" label="Details">
            <Input.TextArea rows={3} placeholder="Customer mentioned budget approval pending..." />
          </Form.Item>

          <Form.Item name="priority" label="Priority" initialValue="medium">
            <Select
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
            />
          </Form.Item>

          <Form.Item name="dueAt" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mark Lost Modal */}
      <Modal
        title="Mark Deal as Lost"
        open={lostModalVisible}
        onCancel={() => setLostModalVisible(false)}
        onOk={() => lostForm.submit()}
        okText="Confirm Lost"
        okButtonProps={{ danger: true }}
      >
        <Form form={lostForm} layout="vertical" onFinish={submitLostReason}>
          <Form.Item
            name="lostReason"
            label="Reason for deal lost"
            rules={[{ required: true, message: 'Please provide reason' }]}
          >
            <Select
              options={[
                { label: 'Competitor price lower', value: 'competitor_price' },
                { label: 'Client postponed project', value: 'postponed' },
                { label: 'Budget issues', value: 'budget_issues' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function SalesAndTasksPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Loading sales & tasks...</div>}>
      <SalesAndTasksContent />
    </React.Suspense>
  );
}
