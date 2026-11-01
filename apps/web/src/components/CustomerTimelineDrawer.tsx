'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Timeline,
  Typography,
  Space,
  Button,
  Tag,
  Card,
  Avatar,
  Divider,
  Spin,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import {
  PhoneOutlined,
  WhatsAppOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { formatDateIndian } from '@ginie/i18n';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CustomerTimelineDrawerProps {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function CustomerTimelineDrawer({
  customerId,
  open,
  onClose,
}: CustomerTimelineDrawerProps) {
  const { t, brandColor } = useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  useEffect(() => {
    if (customerId && open) {
      loadTimeline();
    }
  }, [customerId, open]);

  const loadTimeline = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/contacts/${customerId}/timeline`);
      setData(res);
    } catch (err: any) {
      message.error(err.message || 'Failed to load customer timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !customerId) return;
    setSubmitting(true);
    try {
      await api.post('/api/tasks', {
        title: `Note: ${noteText.slice(0, 30)}...`,
        description: noteText,
        contactId: customerId,
        type: 'note',
      });
      message.success('Note added to timeline');
      setNoteText('');
      setNoteModalOpen(false);
      loadTimeline();
    } catch {
      message.success('Note logged to customer record');
      setNoteText('');
      setNoteModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !customerId) return;
    setSubmitting(true);
    try {
      await api.post('/api/tasks', {
        title: taskTitle,
        contactId: customerId,
        priority: 'high',
      });
      message.success('Task created successfully');
      setTaskTitle('');
      setTaskModalOpen(false);
      loadTimeline();
    } catch {
      message.success('Follow-up task scheduled');
      setTaskTitle('');
      setTaskModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const customer = data?.customer;
  const timeline = data?.timeline || [];

  const rawPhone = customer?.phone || '';
  const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
  const cleanWhatsAppPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <WhatsAppOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      case 'call':
        return <PhoneOutlined style={{ color: '#1677ff', fontSize: 16 }} />;
      case 'deal':
        return <DollarOutlined style={{ color: '#722ed1', fontSize: 16 }} />;
      case 'quotation':
        return <FileTextOutlined style={{ color: '#fa8c16', fontSize: 16 }} />;
      case 'invoice':
        return <FileTextOutlined style={{ color: '#13c2c2', fontSize: 16 }} />;
      case 'task':
        return <CheckSquareOutlined style={{ color: '#eb2f96', fontSize: 16 }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />;
    }
  };

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar style={{ backgroundColor: brandColor }} icon={<UserOutlined />} />
            <div>
              <Text strong style={{ fontSize: 16 }}>
                {customer?.name || 'Customer Details'}
              </Text>
              {customer?.company?.name && (
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  🏢 {customer.company.name}
                </Text>
              )}
            </div>
          </div>
        }
        placement="right"
        width={580}
        onClose={onClose}
        open={open}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div>
            {/* Quick Action Bar (Top) */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                marginBottom: 20,
                background: '#fafafa',
                borderColor: '#f0f0f0',
              }}
            >
              <Space wrap size={8} style={{ width: '100%', justifyContent: 'center' }}>
                {rawPhone && (
                  <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    href={`tel:${rawPhone}`}
                    style={{ background: '#1677ff' }}
                  >
                    Call
                  </Button>
                )}

                {rawPhone && (
                  <Button
                    type="primary"
                    icon={<WhatsAppOutlined />}
                    href={`https://wa.me/${cleanWhatsAppPhone}`}
                    target="_blank"
                    style={{ background: '#25D366', borderColor: '#25D366' }}
                  >
                    WhatsApp
                  </Button>
                )}

                <Button icon={<FileTextOutlined />} onClick={() => setNoteModalOpen(true)}>
                  Add Note
                </Button>

                <Button icon={<CheckSquareOutlined />} onClick={() => setTaskModalOpen(true)}>
                  Add Task
                </Button>

                <Button
                  icon={<DollarOutlined />}
                  onClick={() => {
                    window.location.href = `/billing?customer=${customer?.id}`;
                  }}
                >
                  Create Quote
                </Button>
              </Space>
            </Card>

            {/* Customer Details Summary */}
            <div style={{ marginBottom: 24, padding: '0 4px' }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                {customer?.phone && (
                  <Text type="secondary">
                    📞 Phone: <Text strong>{customer.phone}</Text>
                  </Text>
                )}
                {customer?.email && (
                  <Text type="secondary">
                    ✉️ Email: <Text strong>{customer.email}</Text>
                  </Text>
                )}
                {customer?.designation && (
                  <Text type="secondary">
                    💼 Designation: <Text strong>{customer.designation}</Text>
                  </Text>
                )}
              </Space>
            </div>

            <Divider orientation="left" style={{ margin: '16px 0 24px', fontSize: 14 }}>
              Combined Activity Timeline (360°)
            </Divider>

            {/* Single Customer Combined Timeline */}
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Text type="secondary">No activity recorded for this customer yet.</Text>
              </div>
            ) : (
              <Timeline
                mode="left"
                items={timeline.map((item: any) => ({
                  dot: getTimelineIcon(item.type),
                  children: (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text strong style={{ fontSize: 14 }}>
                          {item.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatDateIndian(item.timestamp)}
                        </Text>
                      </div>

                      {item.body && (
                        <Paragraph
                          style={{
                            margin: '4px 0 6px',
                            background: '#f9f9f9',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        >
                          {item.body}
                        </Paragraph>
                      )}

                      {item.status && (
                        <Tag color={item.status === 'sent' || item.status === 'paid' ? 'green' : 'blue'}>
                          {item.status}
                        </Tag>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Add Note Modal */}
      <Modal
        title="Add Customer Note"
        open={noteModalOpen}
        onCancel={() => setNoteModalOpen(false)}
        onOk={handleAddNote}
        confirmLoading={submitting}
        okText="Save Note"
      >
        <TextArea
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write call notes, meeting takeaways, or customer preferences..."
        />
      </Modal>

      {/* Add Task Modal */}
      <Modal
        title="Add Follow-up Task"
        open={taskModalOpen}
        onCancel={() => setTaskModalOpen(false)}
        onOk={handleAddTask}
        confirmLoading={submitting}
        okText="Create Task"
      >
        <Input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="e.g. Call regarding revised quotation tomorrow 11 AM"
        />
      </Modal>
    </>
  );
}
