'use client';

import React, { useState } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  message,
} from 'antd';
import {
  ShopOutlined,
  ReadOutlined,
  MedicineBoxOutlined,
  GoldOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { BUSINESS_TEMPLATES } from '@ginie/common';

const { Title, Text, Paragraph } = Typography;

interface OnboardingWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const businessIcons: Record<string, React.ReactNode> = {
  shop: <ShopOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
  school: <ReadOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
  clinic: <MedicineBoxOutlined style={{ fontSize: 28, color: '#eb2f96' }} />,
  factory: <GoldOutlined style={{ fontSize: 28, color: '#fa8c16' }} />,
  services: <CustomerServiceOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
  other: <AppstoreOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
};

export default function OnboardingWizardModal({
  open,
  onClose,
  onSuccess,
}: OnboardingWizardModalProps) {
  const { user, t, locale, setLocale, brandColor } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>('shop');

  const businessTypes = Object.values(BUSINESS_TEMPLATES);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await api.post('/api/settings/onboarding/complete', {
        businessName: values.businessName || user?.companyName || 'My Business',
        businessType: selectedType,
        teamSize: values.teamSize || '1-5',
        language: values.language || locale || 'en',
      });

      if (values.language && values.language !== locale) {
        setLocale(values.language);
      }

      message.success('Business template applied successfully! Welcome to GINIE.');
      onClose();
      if (onSuccess) onSuccess();
      window.location.reload();
    } catch (err: any) {
      message.error(err.message || 'Failed to complete setup wizard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      maskClosable={false}
      style={{ borderRadius: 16, overflow: 'hidden' }}
    >
      <div style={{ padding: '8px 12px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            ✨ Welcome to GINIE CRM
          </Title>
          <Text type="secondary">
            Setup your personalized business cockpit in under 1 minute.
          </Text>
        </div>

        <Steps
          current={currentStep}
          style={{ marginBottom: 28 }}
          items={[
            { title: 'Business Info' },
            { title: 'Business Type' },
            { title: 'Preferences' },
          ]}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            businessName: user?.companyName || '',
            teamSize: '1-5',
            language: locale || 'en',
          }}
        >
          {/* Step 0: Business Info */}
          {currentStep === 0 && (
            <div>
              <Form.Item
                name="businessName"
                label={<Text strong>Company / Shop / Business Name</Text>}
                rules={[{ required: true, message: 'Please enter your business name' }]}
              >
                <Input size="large" placeholder="e.g. Acme Enterprises, Apex Dental Clinic" />
              </Form.Item>

              <Form.Item
                name="teamSize"
                label={<Text strong>Total Team Members</Text>}
              >
                <Radio.Group size="large" buttonStyle="solid" style={{ width: '100%' }}>
                  <Row gutter={[12, 12]}>
                    <Col xs={12} sm={6}>
                      <Radio.Button value="1-5" style={{ width: '100%', textAlign: 'center' }}>
                        1 – 5
                      </Radio.Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Radio.Button value="6-15" style={{ width: '100%', textAlign: 'center' }}>
                        6 – 15
                      </Radio.Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Radio.Button value="16-50" style={{ width: '100%', textAlign: 'center' }}>
                        16 – 50
                      </Radio.Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Radio.Button value="50+" style={{ width: '100%', textAlign: 'center' }}>
                        50+
                      </Radio.Button>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </div>
          )}

          {/* Step 1: Select Business Type */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 15 }}>
                  Select your business industry:
                </Text>
                <Paragraph type="secondary" style={{ fontSize: 13, margin: '2px 0 12px' }}>
                  GINIE will automatically configure custom pipeline stages, customer fields, and WhatsApp message templates for your industry.
                </Paragraph>
              </div>

              <Row gutter={[16, 16]}>
                {businessTypes.map((item) => {
                  const isSelected = selectedType === item.id;
                  return (
                    <Col xs={24} sm={12} key={item.id}>
                      <Card
                        hoverable
                        onClick={() => setSelectedType(item.id)}
                        style={{
                          borderRadius: 12,
                          cursor: 'pointer',
                          borderColor: isSelected ? brandColor : undefined,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: isSelected ? 'rgba(22, 119, 255, 0.04)' : undefined,
                          position: 'relative',
                          height: '100%',
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        {isSelected && (
                          <CheckCircleFilled
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              color: brandColor,
                              fontSize: 18,
                            }}
                          />
                        )}
                        <Space align="start" size={14}>
                          <div>{businessIcons[item.id] || <ShopOutlined />}</div>
                          <div>
                            <Text strong style={{ fontSize: 15, display: 'block' }}>
                              {item.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', margin: '2px 0' }}>
                              {item.titleHi}
                            </Text>
                            <Paragraph
                              type="secondary"
                              style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}
                            >
                              {locale === 'hi' ? item.descriptionHi : item.description}
                            </Paragraph>
                            <div style={{ marginTop: 8 }}>
                              <Tag color="blue">{item.pipelineStages.length} Pipeline Stages</Tag>
                              <Tag color="cyan">{item.customFields.length} Custom Fields</Tag>
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {/* Step 2: Language & Template Summary */}
          {currentStep === 2 && (
            <div>
              <Form.Item
                name="language"
                label={<Text strong>App Language / भाषा चुनें</Text>}
              >
                <Radio.Group size="large">
                  <Radio.Button value="en">English (English)</Radio.Button>
                  <Radio.Button value="hi">हिंदी (Hindi)</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {BUSINESS_TEMPLATES[selectedType] && (
                <Card
                  title={<Text strong>Template Details: {BUSINESS_TEMPLATES[selectedType].title}</Text>}
                  style={{ borderRadius: 12, marginTop: 12 }}
                  size="small"
                >
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      Pre-configured Sales Pipeline Stages:
                    </Text>
                    <Space wrap>
                      {BUSINESS_TEMPLATES[selectedType].pipelineStages.map((st, idx) => (
                        <Tag key={idx} color={st.color}>
                          {idx + 1}. {st.name} ({st.probability}%)
                        </Tag>
                      ))}
                    </Space>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      Included WhatsApp Templates:
                    </Text>
                    <Space wrap>
                      {BUSINESS_TEMPLATES[selectedType].messageTemplates.map((mt, idx) => (
                        <Tag key={idx} color="green">
                          💬 {mt.name}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 32,
              borderTop: '1px solid #f0f0f0',
              paddingTop: 16,
            }}
          >
            {currentStep > 0 ? (
              <Button onClick={() => setCurrentStep((prev) => prev - 1)} icon={<LeftOutlined />}>
                Back
              </Button>
            ) : (
              <Button type="text" onClick={onClose} style={{ color: '#8c8c8c' }}>
                Skip for now
              </Button>
            )}

            {currentStep < 2 ? (
              <Button
                type="primary"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                icon={<RightOutlined />}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleFinish}
                loading={submitting}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Apply Template & Launch CRM
              </Button>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
}
