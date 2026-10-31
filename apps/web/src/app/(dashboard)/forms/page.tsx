'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  message,
} from 'antd';
import {
  FormOutlined,
  PlusOutlined,
  CopyOutlined,
  GlobalOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

export default function FormsPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [formBuilder] = Form.useForm();
  const [fieldBuilder] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsRes, fieldsRes] = await Promise.all([
        api.get('/api/forms'),
        api.get('/api/custom-fields'),
      ]);
      setForms(formsRes || []);
      setCustomFields(fieldsRes || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (values: any) => {
    try {
      await api.post('/api/forms', values);
      message.success(t.common.success);
      setFormModalVisible(false);
      formBuilder.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleCreateField = async (values: any) => {
    try {
      const options = (values.optionsString || '')
        .split(',')
        .map((o: string) => o.trim())
        .filter(Boolean);

      await api.post('/api/custom-fields', {
        ...values,
        options,
      });

      message.success(t.common.success);
      setFieldModalVisible(false);
      fieldBuilder.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleCopyLink = (formId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ginie.space';
    const link = `${origin}/forms/view/${formId}`;
    navigator.clipboard.writeText(link);
    message.success('Public form link copied to clipboard!');
  };

  const formColumns = [
    {
      title: 'Form Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (d: string) => d || '—',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'orange'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>
      ),
    },
    {
      title: 'Share & Embed',
      key: 'share',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyLink(record.id)}
          >
            {t.forms.copyLink}
          </Button>
          <Button
            size="small"
            type="link"
            href={`/forms/view/${record.id}`}
            target="_blank"
          >
            Preview
          </Button>
        </Space>
      ),
    },
  ];

  const fieldColumns = [
    {
      title: 'Attached Module',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Field Label',
      dataIndex: 'label',
      key: 'label',
      render: (l: string) => <Text strong>{l}</Text>,
    },
    {
      title: 'Field Type',
      dataIndex: 'fieldType',
      key: 'fieldType',
      render: (t: string) => <Tag color="purple">{t}</Tag>,
    },
    {
      title: 'Required?',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (req: boolean) => (req ? <Tag color="red">YES</Tag> : 'No'),
    },
  ];

  const tabItems = [
    {
      key: 'forms',
      label: (
        <span>
          <FormOutlined /> {t.forms.formsTab}
        </span>
      ),
      children: (
        <Card
          title={t.forms.formsTab}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormModalVisible(true)}
            >
              {t.forms.createForm}
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={forms}
            columns={formColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: 'No website lead forms created yet.' }}
          />
        </Card>
      ),
    },
    {
      key: 'fields',
      label: (
        <span>
          <AppstoreAddOutlined /> {t.forms.fieldsTab}
        </span>
      ),
      children: (
        <Card
          title={t.forms.fieldsTab}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFieldModalVisible(true)}
            >
              {t.forms.addField}
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={customFields}
            columns={fieldColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: 'No extra custom fields defined yet.' }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.forms.title}
        </Title>
        <Text type="secondary">{t.forms.subtitle}</Text>
      </div>

      <Tabs items={tabItems} size="large" />

      {/* Create Web Form Modal */}
      <Modal
        title={t.forms.createForm}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={formBuilder} layout="vertical" onFinish={handleCreateForm}>
          <Form.Item
            name="title"
            label="Form Name"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Website Contact & Inquiries Form" />
          </Form.Item>

          <Form.Item name="description" label="Instructions for Visitors">
            <Input.TextArea rows={2} placeholder="e.g. Fill in your details and our team will get back to you within 24 hours." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setFormModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Custom Field Modal */}
      <Modal
        title={t.forms.addField}
        open={fieldModalVisible}
        onCancel={() => setFieldModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={fieldBuilder} layout="vertical" onFinish={handleCreateField} initialValues={{ entityType: 'lead', fieldType: 'text' }}>
          <Form.Item name="entityType" label="Attach to Module">
            <Select
              options={[
                { value: 'lead', label: 'Potential Customers (Leads)' },
                { value: 'deal', label: 'Sales in Progress (Deals)' },
                { value: 'contact', label: 'People' },
                { value: 'company', label: 'Companies' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="label"
            label="Field Label"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. GST Number, Budget, Industry Type" />
          </Form.Item>

          <Form.Item
            name="key"
            label="Field Identifier (lowercase letters and underscores)"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. gst_number, budget_range" />
          </Form.Item>

          <Form.Item name="fieldType" label="Field Type">
            <Select
              options={[
                { value: 'text', label: 'Single Line Text' },
                { value: 'number', label: 'Number' },
                { value: 'date', label: 'Date' },
                { value: 'dropdown', label: 'Dropdown / Select' },
                { value: 'boolean', label: 'Yes / No Checkbox' },
              ]}
            />
          </Form.Item>

          <Form.Item name="optionsString" label="Options (if Dropdown, comma-separated)">
            <Input placeholder="Option 1, Option 2, Option 3" />
          </Form.Item>

          <Form.Item name="isRequired" valuePropName="checked">
            <Checkbox>Make this field mandatory</Checkbox>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setFieldModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
