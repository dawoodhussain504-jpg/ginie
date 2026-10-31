'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Alert,
  Button,
  Space,
  Tag,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Modal,
  Image,
  message,
} from 'antd';
import {
  WhatsAppOutlined,
  QrcodeOutlined,
  SendOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function WhatsAppPage() {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [sendForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [ruleModalVisible, setRuleModalVisible] = useState(false);

  useEffect(() => {
    loadSession();
    loadMessages();
    loadRules();
  }, []);

  const loadSession = async () => {
    try {
      const res = await api.get('/api/whatsapp/session');
      setSession(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.get('/api/whatsapp/messages');
      setMessages(res || []);
    } catch {}
  };

  const loadRules = async () => {
    try {
      const res = await api.get('/api/whatsapp/auto-reply-rules');
      setRules(res || []);
    } catch {}
  };

  const handleSendMessage = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/api/whatsapp/messages', values);
      message.success('Message queued for delivery.');
      sendForm.resetFields();
      loadMessages();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (values: any) => {
    try {
      const keywords = (values.keywordsString || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

      const variants = (values.variantsString || '')
        .split('\n')
        .map((v: string) => v.trim())
        .filter(Boolean);

      await api.post('/api/whatsapp/auto-reply-rules', {
        name: values.name,
        triggerType: 'keyword',
        triggerConfig: { keywords },
        replyVariants: variants.length > 0 ? variants : [values.singleReply || 'Hello! We received your message.'],
        delayMinSeconds: values.delayMinSeconds || 8,
        delayMaxSeconds: values.delayMaxSeconds || 45,
      });

      message.success(t.common.success);
      setRuleModalVisible(false);
      ruleForm.resetFields();
      loadRules();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const handleUnlink = async () => {
    try {
      await api.delete('/api/whatsapp/session');
      message.success('WhatsApp unlinked.');
      loadSession();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const messageColumns = [
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <Text strong>{phone}</Text>,
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: (dir: string) => (
        <Tag color={dir === 'inbound' ? 'blue' : 'green'}>
          {dir === 'inbound' ? 'INCOMING' : 'OUTGOING'}
        </Tag>
      ),
    },
    {
      title: 'Message Content',
      dataIndex: 'body',
      key: 'body',
      render: (body: string, record: any) => (
        <div>
          <span>{body}</span>
          {record.ruleId && (
            <Tag color="purple" style={{ marginLeft: 8 }}>
              Auto-Reply ({record.delayMs ? `${Math.round(record.delayMs / 1000)}s delay` : ''})
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => <Tag color={st === 'sent' ? 'green' : 'orange'}>{st.toUpperCase()}</Tag>,
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => formatDateIndian(d),
    },
  ];

  const ruleColumns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Trigger Keywords',
      key: 'keywords',
      render: (_: any, record: any) => {
        const kws = record.triggerConfig?.keywords || [];
        return (
          <Space wrap>
            {kws.map((k: string, i: number) => (
              <Tag key={i} color="geekblue">{k}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Delay Range (Human Randomization)',
      key: 'delay',
      render: (_: any, record: any) => (
        <span>
          {record.delayMinSeconds || 8}s – {record.delayMaxSeconds || 45}s
        </span>
      ),
    },
    {
      title: 'Variations',
      key: 'variants',
      render: (_: any, record: any) => (
        <Tag color="cyan">{(record.replyVariants || []).length} variations</Tag>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'link',
      label: (
        <span>
          <QrcodeOutlined /> {t.whatsapp.linkTitle}
        </span>
      ),
      children: (
        <Card style={{ maxWidth: 640, borderRadius: 12 }}>
          <Alert
            message={t.whatsapp.warningNotice}
            type="warning"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={4}>{t.whatsapp.linkTitle}</Title>
            <Paragraph type="secondary">{t.whatsapp.scanQrInstruction}</Paragraph>

            <div style={{ margin: '20px auto', display: 'inline-block', border: '1px solid #d9d9d9', padding: 12, borderRadius: 12 }}>
              <Image
                src={session?.qrCode || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GINIE_WHATSAPP_CONNECT_DEMO'}
                alt="WhatsApp QR Code"
                width={220}
                height={220}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <Space>
                <Tag color={session?.status === 'connected' ? 'green' : 'blue'} style={{ padding: '4px 12px', fontSize: 13 }}>
                  {session?.status === 'connected' ? t.whatsapp.connected : t.whatsapp.disconnected}
                </Tag>
                {session?.status === 'connected' && (
                  <Button danger onClick={handleUnlink}>
                    {t.whatsapp.unlinkButton}
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'messages',
      label: (
        <span>
          <SendOutlined /> {t.whatsapp.chatHistory}
        </span>
      ),
      children: (
        <div>
          <Card title={t.whatsapp.sendMessageTitle} style={{ marginBottom: 24, borderRadius: 12, maxWidth: 640 }}>
            <Form form={sendForm} layout="vertical" onFinish={handleSendMessage}>
              <Form.Item
                name="phone"
                label="Recipient Phone Number (with Country Code)"
                rules={[{ required: true, message: t.common.pleaseCheckField }]}
              >
                <Input placeholder="+91 98200 00000" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message Text"
                rules={[{ required: true, message: t.common.pleaseCheckField }]}
              >
                <Input.TextArea rows={3} placeholder="Write your message here..." />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
                Send Message
              </Button>
            </Form>
          </Card>

          <Card title={t.whatsapp.chatHistory} style={{ borderRadius: 12 }}>
            <Table
              dataSource={messages}
              columns={messageColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No WhatsApp messages exchanged yet.' }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'autoreply',
      label: (
        <span>
          <SettingOutlined /> {t.whatsapp.autoReplyTitle}
        </span>
      ),
      children: (
        <Card
          title={t.whatsapp.autoReplyTitle}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setRuleModalVisible(true)}
            >
              {t.whatsapp.addRule}
            </Button>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={rules}
            columns={ruleColumns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No auto-reply rules configured yet. Click above to add your first rule.' }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t.whatsapp.title}
        </Title>
        <Text type="secondary">{t.whatsapp.subtitle}</Text>
      </div>

      <Tabs items={tabItems} size="large" />

      {/* Add Auto-Reply Rule Modal */}
      <Modal
        title={t.whatsapp.addRule}
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={ruleForm} layout="vertical" onFinish={handleCreateRule} initialValues={{ delayMinSeconds: 8, delayMaxSeconds: 45 }}>
          <Form.Item
            name="name"
            label="Rule Name"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. Pricing Inquiries" />
          </Form.Item>

          <Form.Item
            name="keywordsString"
            label="Keywords to trigger this reply (comma-separated)"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input placeholder="e.g. price, cost, rate, quotation, fees" />
          </Form.Item>

          <Form.Item
            name="variantsString"
            label="Reply Variations (one per line for natural variety)"
            rules={[{ required: true, message: t.common.pleaseCheckField }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Hi! Here is our latest pricing breakdown: ...&#10;Hello, thanks for asking about our rates! You can view options here: ..."
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="delayMinSeconds" label="Min Delay (seconds)">
              <InputNumber min={3} max={60} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="delayMaxSeconds" label="Max Delay (seconds)">
              <InputNumber min={10} max={120} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button onClick={() => setRuleModalVisible(false)}>{t.common.cancel}</Button>
            <Button type="primary" htmlType="submit">
              {t.common.save}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
