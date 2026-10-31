'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  message,
} from 'antd';
import { PlusOutlined, CheckSquareOutlined, CalendarOutlined } from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text } = Typography;

export default function TasksPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tasks');
      setTasks(res || []);
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values: any) => {
    try {
      await api.post('/api/tasks', {
        ...values,
        dueAt: values.dueAt ? values.dueAt.toISOString() : undefined,
      });
      message.success(t.common.success);
      setAddModalVisible(false);
      form.resetFields();
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

  const columns = [
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
        return <Tag color={colors[priority] || 'blue'}>{priority.toUpperCase()}</Tag>;
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
            {t.tasks.title}
          </Title>
          <Text type="secondary">Keep track of customer follow-ups and daily activities.</Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setAddModalVisible(true)}
        >
          {t.tasks.addTask}
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* Add Task Modal */}
      <Modal
        title={t.tasks.addTask}
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask} initialValues={{ priority: 'medium' }}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Call Rajesh to confirm delivery schedule" />
          </Form.Item>

          <Form.Item name="description" label="Notes or Instructions">
            <Input.TextArea rows={3} placeholder="Add any details..." />
          </Form.Item>

          <Form.Item name="priority" label="Priority">
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </Form.Item>

          <Form.Item name="dueAt" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setAddModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
