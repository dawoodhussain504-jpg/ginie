'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Select,
  Table,
  Modal,
  Image,
  message,
  Badge,
  Avatar,
  Progress,
  Tooltip,
  Divider,
} from 'antd';
import {
  WhatsAppOutlined,
  QrcodeOutlined,
  SendOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  HistoryOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  ScheduleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;

export default function WhatsAppPage() {
  const { t, brandColor, user } = useApp();
  const [activeTab, setActiveTab] = useState('inbox');
  const [session, setSession] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [antiBan, setAntiBan] = useState<any | null>(null);
  const [checkingFollowups, setCheckingFollowups] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [ruleForm] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
    loadConversations();
    loadTemplates();
    loadAntiBanStatus();
    loadRules();
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      loadThread(selectedPhone);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // Auto-refresh pairing QR & connection status while in Pairing tab
  useEffect(() => {
    if (activeTab === 'connect' && session?.status !== 'connected') {
      const timer = setInterval(() => {
        loadSession();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeTab, session?.status]);

  const loadSession = async () => {
    try {
      const res = await api.get('/api/whatsapp/session');
      setSession(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/whatsapp/conversations');
      setConversations(res || []);
      if (!selectedPhone && res && res.length > 0) {
        setSelectedPhone(res[0].phone);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadThread = async (phone: string) => {
    setLoadingThread(true);
    try {
      const res = await api.get(`/api/whatsapp/conversations/${encodeURIComponent(phone)}`);
      setActiveThread(res);
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      setLoadingThread(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await api.get('/api/whatsapp/templates');
      setTemplates(res || []);
    } catch {}
  };

  const loadAntiBanStatus = async () => {
    try {
      const res = await api.get('/api/whatsapp/anti-ban-status');
      setAntiBan(res);
    } catch {}
  };

  const loadRules = async () => {
    try {
      const res = await api.get('/api/whatsapp/auto-reply-rules');
      setRules(res || []);
    } catch {}
  };

  const handleSendReply = async () => {
    if (!selectedPhone || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await api.post(`/api/whatsapp/conversations/${encodeURIComponent(selectedPhone)}/send`, {
        message: replyText.trim(),
      });
      setReplyText('');
      message.success('Message queued and dispatched!');
      loadThread(selectedPhone);
      loadConversations();
      loadAntiBanStatus();
    } catch (err: any) {
      message.error(err.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleRunFollowupCheck = async () => {
    setCheckingFollowups(true);
    try {
      const res = await api.post('/api/whatsapp/followup-check', { daysInactive: 2 });
      message.success(res.message);
    } catch (err: any) {
      message.error(err.message || 'Followup check failed');
    } finally {
      setCheckingFollowups(false);
    }
  };

  const handleInsertTemplate = (templateBody: string) => {
    const customerName = activeThread?.customer?.name || 'Sir/Ma\'am';
    const companyName = user?.companyName || 'our company';
    const personalized = templateBody
      .replace(/{{name}}/g, customerName)
      .replace(/{{companyName}}/g, companyName);
    setReplyText(personalized);
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
      message.success('WhatsApp session disconnected.');
      loadSession();
    } catch (err: any) {
      message.error(err.message || t.common.error);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      c.phone.toLowerCase().includes(term) ||
      (c.customerName && c.customerName.toLowerCase().includes(term)) ||
      (c.lastMessage?.body && c.lastMessage.body.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <WhatsAppOutlined style={{ color: '#25D366' }} /> Messages & WhatsApp Inbox
          </Title>
          <Text type="secondary">
            Unified Customer Inbox, Anti-Ban Protection Shield & Automated Lead Engagement
          </Text>
        </div>

        <Space wrap>
          <Tooltip title="Scan conversations with no response in 2+ days and create high-priority follow-up tasks">
            <Button
              icon={<ScheduleOutlined />}
              loading={checkingFollowups}
              onClick={handleRunFollowupCheck}
            >
              Run Inactive Follow-ups Check
            </Button>
          </Tooltip>
          <Button icon={<SyncOutlined />} onClick={() => { loadConversations(); if (selectedPhone) loadThread(selectedPhone); }}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'inbox',
            label: (
              <span>
                <MessageOutlined /> Unified Chat Inbox ({conversations.length})
              </span>
            ),
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 16, height: 'calc(100vh - 220px)', minHeight: 600 }}>
                {/* Left Column: Conversations List */}
                <Card
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <Input.Search
                      placeholder="Search name, phone or text..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      allowClear
                    />
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredConversations.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: '#8c8c8c' }}>
                        No conversations yet. Inbound or outreach messages will appear here.
                      </div>
                    ) : (
                      filteredConversations.map((conv) => {
                        const isSelected = selectedPhone === conv.phone;
                        return (
                          <div
                            key={conv.phone}
                            onClick={() => setSelectedPhone(conv.phone)}
                            style={{
                              padding: '12px 14px',
                              borderBottom: '1px solid #f5f5f5',
                              cursor: 'pointer',
                              background: isSelected ? '#f0fdf4' : '#fff',
                              borderLeft: isSelected ? '4px solid #25D366' : '4px solid transparent',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <Space size={8}>
                                <Avatar
                                  size="small"
                                  style={{ backgroundColor: conv.isOptedOut ? '#ff4d4f' : '#1677ff' }}
                                  icon={<UserOutlined />}
                                />
                                <Text strong style={{ fontSize: 13, maxWidth: 140 }} ellipsis>
                                  {conv.customerName || conv.phone}
                                </Text>
                              </Space>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {conv.lastMessage?.createdAt ? formatDateIndian(conv.lastMessage.createdAt) : ''}
                              </Text>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text
                                type="secondary"
                                style={{ fontSize: 12, maxWidth: 190 }}
                                ellipsis
                              >
                                {conv.lastMessage?.direction === 'outbound' ? 'You: ' : ''}
                                {conv.lastMessage?.body || 'No messages'}
                              </Text>

                              <Space size={4}>
                                {conv.isOptedOut && (
                                  <Tag color="red" style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                    STOP
                                  </Tag>
                                )}
                                {conv.unreadCount > 0 && (
                                  <Badge count={conv.unreadCount} />
                                )}
                              </Space>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>

                {/* Right Column: Chat Window */}
                <Card
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  {selectedPhone && activeThread ? (
                    <>
                      {/* Chat Header */}
                      <div
                        style={{
                          padding: '12px 18px',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fafafa',
                        }}
                      >
                        <div>
                          <Space size={8}>
                            <Avatar style={{ backgroundColor: '#25D366' }} icon={<WhatsAppOutlined />} />
                            <div>
                              <Text strong style={{ fontSize: 14 }}>
                                {activeThread.customer?.name || activeThread.phone}
                              </Text>
                              <br />
                              <Space size={6}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {activeThread.phone}
                                </Text>
                                <Tag color="blue" style={{ fontSize: 10 }}>
                                  {activeThread.customerType}
                                </Tag>
                                {activeThread.isOptedOut && (
                                  <Tag color="error" icon={<StopOutlined />} style={{ fontSize: 10 }}>
                                    Opted-out (STOP)
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          </Space>
                        </div>

                        <Space>
                          <Button
                            size="small"
                            type="link"
                            href={`https://wa.me/${activeThread.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            icon={<WhatsAppOutlined />}
                          >
                            Open in WhatsApp Web
                          </Button>
                        </Space>
                      </div>

                      {/* Opt-out Warning Alert */}
                      {activeThread.isOptedOut && (
                        <Alert
                          message="Customer has unsubscribed (STOP). Automated and outbound messages are blocked to comply with WhatsApp safety guidelines."
                          type="warning"
                          showIcon
                          style={{ margin: 8 }}
                        />
                      )}

                      {/* Messages Thread Container */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: 16,
                          background: '#efeae2',
                          backgroundImage: 'radial-gradient(#dfd7cc 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        {activeThread.messages?.map((msg: any) => {
                          const isOutbound = msg.direction === 'outbound';
                          return (
                            <div
                              key={msg.id}
                              style={{
                                display: 'flex',
                                justifyContent: isOutbound ? 'flex-end' : 'flex-start',
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  maxWidth: '72%',
                                  padding: '8px 14px',
                                  borderRadius: 10,
                                  background: isOutbound ? '#d9fdd3' : '#ffffff',
                                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                  wordBreak: 'break-word',
                                }}
                              >
                                <div style={{ fontSize: 13, lineHeight: '1.4', color: '#111827' }}>
                                  {msg.body}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: 4,
                                    marginTop: 4,
                                    fontSize: 10,
                                    color: '#6b7280',
                                  }}
                                >
                                  {msg.ruleId && <Tag color="purple" style={{ fontSize: 9, padding: '0 2px', margin: 0 }}>Auto</Tag>}
                                  <span>{formatDateIndian(msg.createdAt)}</span>
                                  {isOutbound && (
                                    <span style={{ color: msg.status === 'sent' || msg.status === 'delivered' ? '#1677ff' : '#9ca3af' }}>
                                      ✓✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Quick Reply Templates Bar */}
                      <div style={{ padding: '6px 12px', background: '#fafafa', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                          ⚡ Quick Replies:
                        </Text>
                        {templates.map((tpl) => (
                          <Tag
                            key={tpl.id}
                            color="blue"
                            style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 12, margin: 0, whiteSpace: 'nowrap' }}
                            onClick={() => handleInsertTemplate(tpl.body)}
                          >
                            {tpl.name}
                          </Tag>
                        ))}
                      </div>

                      {/* Composer Box */}
                      <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Input.TextArea
                            rows={2}
                            placeholder={activeThread.isOptedOut ? 'Cannot send: contact is opted out' : 'Type a message (English or Hindi)...'}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onPressEnter={(e) => {
                              if (!e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                              }
                            }}
                            disabled={activeThread.isOptedOut}
                          />
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendReply}
                            loading={sendingReply}
                            disabled={activeThread.isOptedOut || !replyText.trim()}
                            style={{ height: 'auto', background: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8c8c8c' }}>
                      Select a conversation on the left to start messaging.
                    </div>
                  )}
                </Card>
              </div>
            ),
          },
          {
            key: 'anti-ban',
            label: (
              <span>
                <SafetyCertificateOutlined /> Anti-Ban Shield & Safety
              </span>
            ),
            children: (
              <div style={{ maxWidth: 840, margin: '0 auto' }}>
                <Card style={{ marginBottom: 20, borderRadius: 12 }}>
                  <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                    Active Anti-Ban Protection Shield
                  </Title>
                  <Paragraph type="secondary">
                    GINIE protects your WhatsApp number from bans using automated human-like jitter, progressive warm-up ramping, and daily throughput caps.
                  </Paragraph>

                  {antiBan && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
                      <Card size="small" style={{ background: '#f8fafc', borderRadius: 8 }}>
                        <Text type="secondary">Number Warm-Up Age</Text>
                        <Title level={3} style={{ margin: '4px 0', color: '#1677ff' }}>
                          Day {antiBan.daysActive}
                        </Title>
                        <Tag color="cyan">{antiBan.warmupStage}</Tag>
                      </Card>

                      <Card size="small" style={{ background: '#f8fafc', borderRadius: 8 }}>
                        <Text type="secondary">Today's Dispatch Quota</Text>
                        <Title level={3} style={{ margin: '4px 0', color: antiBan.healthStatus === 'safe' ? '#52c41a' : '#faad14' }}>
                          {antiBan.sentToday} / {antiBan.dailyCap}
                        </Title>
                        <Progress
                          percent={Math.min(100, Math.round((antiBan.sentToday / antiBan.dailyCap) * 100))}
                          size="small"
                          status={antiBan.healthStatus === 'limit_reached' ? 'exception' : 'active'}
                        />
                      </Card>

                      <Card size="small" style={{ background: '#f8fafc', borderRadius: 8 }}>
                        <Text type="secondary">Human-Like Jitter Delay</Text>
                        <Title level={3} style={{ margin: '4px 0', color: '#722ed1' }}>
                          {antiBan.minDelaySeconds}s – {antiBan.maxDelaySeconds}s
                        </Title>
                        <Tag color="purple">Randomized + Typing Indicator</Tag>
                      </Card>
                    </div>
                  )}

                  <Divider />

                  <Title level={5}>Safety Protocols in Place</Title>
                  <ul style={{ paddingLeft: 20, lineHeight: '1.8', color: '#4b5563' }}>
                    <li><strong>Human Takeover Protection:</strong> Pauses automated bot replies for 12 hours when an agent responds manually.</li>
                    <li><strong>Bilingual STOP / Unsubscribe Handling:</strong> Auto-detects <em>STOP, UNSUBSCRIBE, बंद, रोको, मत भेजो</em> and stops automated messages immediately.</li>
                    <li><strong>Working Hours Enforcement:</strong> Respects your company working hours and queues or pauses sales campaigns outside business hours.</li>
                    <li><strong>Contact Hourly Cap:</strong> Limits automated responses to maximum 5 per contact per hour to eliminate spam flags.</li>
                  </ul>
                </Card>
              </div>
            ),
          },
          {
            key: 'rules',
            label: (
              <span>
                <SettingOutlined /> Auto-Reply Rules ({rules.length})
              </span>
            ),
            children: (
              <Card
                title="Automated Keyword & Lead Follow-up Rules"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setRuleModalVisible(true)}>
                    Add New Rule
                  </Button>
                }
                style={{ borderRadius: 12 }}
              >
                <Table
                  dataSource={rules}
                  rowKey="id"
                  columns={[
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
                      title: 'Delay Window',
                      key: 'delay',
                      render: (_: any, record: any) => (
                        <span>{record.delayMinSeconds}s – {record.delayMaxSeconds}s random</span>
                      ),
                    },
                    {
                      title: 'Status',
                      dataIndex: 'isActive',
                      key: 'isActive',
                      render: (active: boolean) => (
                        <Tag color={active ? 'green' : 'default'}>{active ? 'ACTIVE' : 'PAUSED'}</Tag>
                      ),
                    },
                  ]}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ),
          },
          {
            key: 'connect',
            label: (
              <span>
                <QrcodeOutlined /> Phone Session & QR Pairing
              </span>
            ),
            children: (
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                  <Title level={4}>Pair WhatsApp Device</Title>
                  <Paragraph type="secondary">
                    Scan the QR code below using WhatsApp on your phone (Linked Devices) to connect your business number.
                  </Paragraph>

                  {session?.qrCode ? (
                    <div style={{ margin: '20px 0' }}>
                      <Image
                        src={session.qrCode}
                        alt="WhatsApp Pairing QR"
                        width={240}
                        style={{ border: '2px solid #e5e7eb', borderRadius: 12, padding: 8 }}
                      />
                    </div>
                  ) : (
                    <div style={{ margin: '30px 0' }}>
                      <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '6px 16px' }}>
                        Connected Status: {session?.status || 'Active'}
                      </Tag>
                    </div>
                  )}

                  <Space>
                    <Button onClick={loadSession} icon={<SyncOutlined />}>
                      Refresh Pairing QR
                    </Button>
                    <Button danger onClick={handleUnlink}>
                      Disconnect / Unlink Number
                    </Button>
                  </Space>
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* Add Auto-Reply Rule Modal */}
      <Modal
        title="Add Auto-Reply Rule"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={ruleForm} layout="vertical" onFinish={handleCreateRule}>
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Price Inquiry Auto-Responder" />
          </Form.Item>

          <Form.Item
            name="keywordsString"
            label="Trigger Keywords (comma separated)"
            rules={[{ required: true }]}
            extra="Example: price, rate, quotation, kharcha, kitna"
          >
            <Input placeholder="price, quote, rate, fees" />
          </Form.Item>

          <Form.Item
            name="variantsString"
            label="Reply Variants (one per line for human natural variety)"
            rules={[{ required: true }]}
            extra="GINIE picks a random variant every time to prevent duplicate message detection."
          >
            <Input.TextArea
              rows={4}
              placeholder="Namaste! Our plans start from ₹999/month. Can I share our brochure?&#10;Hello! Thanks for asking. Here is our pricing structure: ..."
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="delayMinSeconds" label="Min Delay (seconds)" initialValue={8}>
              <Input type="number" min={3} max={60} />
            </Form.Item>
            <Form.Item name="delayMaxSeconds" label="Max Delay (seconds)" initialValue={35}>
              <Input type="number" min={8} max={120} />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRuleModalVisible(false)}>{t.common.cancel}</Button>
              <Button type="primary" htmlType="submit">Save Rule</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
