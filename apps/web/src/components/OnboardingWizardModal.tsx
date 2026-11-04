'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Radio,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  message,
  Divider,
} from 'antd';
import {
  ShopOutlined,
  ReadOutlined,
  MedicineBoxOutlined,
  BuildOutlined,
  RocketOutlined,
  CoffeeOutlined,
  CarOutlined,
  ExperimentOutlined,
  CrownOutlined,
  ScissorOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  WhatsAppOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CheckOutlined,
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
  retail: <ShopOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
  wholesale: <AppstoreOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
  automobile: <CarOutlined style={{ fontSize: 28, color: '#faad14' }} />,
  pharmacy: <ExperimentOutlined style={{ fontSize: 28, color: '#059669' }} />,
  jewellery: <CrownOutlined style={{ fontSize: 28, color: '#d97706' }} />,
  restaurant: <CoffeeOutlined style={{ fontSize: 28, color: '#fa541c' }} />,
  salon: <ScissorOutlined style={{ fontSize: 28, color: '#db2777' }} />,
  education: <ReadOutlined style={{ fontSize: 28, color: '#4f46e5' }} />,
  clinic: <MedicineBoxOutlined style={{ fontSize: 28, color: '#eb2f96' }} />,
  manufacturing: <BuildOutlined style={{ fontSize: 28, color: '#fa8c16' }} />,
  services: <RocketOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
  other: <AppstoreOutlined style={{ fontSize: 28, color: '#595959' }} />,
  // Aliases
  shop: <ShopOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
  school: <ReadOutlined style={{ fontSize: 28, color: '#4f46e5' }} />,
  factory: <BuildOutlined style={{ fontSize: 28, color: '#fa8c16' }} />,
};

// 11 Core Indian Trades
const PRIMARY_TRADE_KEYS = [
  'retail',
  'wholesale',
  'automobile',
  'pharmacy',
  'jewellery',
  'restaurant',
  'salon',
  'education',
  'clinic',
  'manufacturing',
  'services',
];

export default function OnboardingWizardModal({
  open,
  onClose,
  onSuccess,
}: OnboardingWizardModalProps) {
  const { user, locale, setLocale, brandColor } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>('retail');
  const [storeSlug, setStoreSlug] = useState<string>('');

  useEffect(() => {
    if (user?.companyName) {
      const generatedSlug = user.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setStoreSlug(generatedSlug || 'my-store');
      form.setFieldsValue({
        businessName: user.companyName,
        storeSlug: generatedSlug,
      });
    }
  }, [user, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setStoreSlug(generatedSlug);
    form.setFieldsValue({ storeSlug: generatedSlug });
  };

  const businessTypes = PRIMARY_TRADE_KEYS.map((k) => BUSINESS_TEMPLATES[k]).filter(Boolean);
  const currentTemplate = BUSINESS_TEMPLATES[selectedType] || BUSINESS_TEMPLATES.retail;

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await api.post('/api/settings/onboarding/complete', {
        businessName: values.businessName || user?.companyName || 'My Business',
        businessType: selectedType,
        teamSize: values.teamSize || '1-5',
        language: values.language || locale || 'en',
        city: values.city || '',
        storeSlug: values.storeSlug || storeSlug || 'store',
      });

      if (values.language && values.language !== locale) {
        setLocale(values.language);
      }

      message.success('Business cockpit & digital storefront configured successfully!');
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
      width={840}
      centered
      maskClosable={false}
      style={{ borderRadius: 16, overflow: 'hidden', maxWidth: '96vw' }}
    >
      <div style={{ padding: '4px 6px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Space align="center" style={{ marginBottom: 4 }}>
            <RocketOutlined style={{ fontSize: 24, color: brandColor || '#1677ff' }} />
            <Title level={3} style={{ margin: 0, fontSize: 22 }}>
              Welcome to GINIE Cockpit
            </Title>
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Configure your 11-Trade ERP, Barcode POS counter, and 0% commission storefront in under 1 minute.
            </Text>
          </div>
        </div>

        {/* Steps */}
        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: 'Business Info' },
            { title: 'Industry (11 Trades)' },
            { title: 'Superpowers & Launch' },
          ]}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            businessName: user?.companyName || '',
            teamSize: '1-5',
            language: locale || 'en',
            city: '',
            storeSlug: storeSlug,
          }}
        >
          {/* Step 0: Business Info */}
          {currentStep === 0 && (
            <div>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={14}>
                  <Form.Item
                    name="businessName"
                    label={<Text strong>Company / Shop / Enterprise Name</Text>}
                    rules={[{ required: true, message: 'Please enter your business name' }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g. Apex Pharmacy, Royal Jewellers, Verma Automobiles"
                      onChange={handleNameChange}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={10}>
                  <Form.Item
                    name="city"
                    label={<Text strong>City / Business Location</Text>}
                  >
                    <Input size="large" placeholder="e.g. Mumbai, Delhi, Jaipur" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="storeSlug"
                label={
                  <Space>
                    <Text strong>Your 0% Commission Digital Storefront Link</Text>
                    <Tag color="green">Ready-to-Share</Tag>
                  </Space>
                }
              >
                <Input
                  size="large"
                  addonBefore="https://ginie.space/store/"
                  placeholder="my-business"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase())}
                />
              </Form.Item>

              <Form.Item
                name="teamSize"
                label={<Text strong>Total Team Members</Text>}
              >
                <Radio.Group size="large" buttonStyle="solid" style={{ width: '100%' }}>
                  <Row gutter={[8, 8]}>
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

          {/* Step 1: Select Business Type (11 Trades) */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 15 }}>
                  Select your primary business trade:
                </Text>
                <Paragraph type="secondary" style={{ fontSize: 12, margin: '2px 0 14px' }}>
                  GINIE automatically configures specialized ERP workflows, barcode POS registers, sales pipelines, and storefront styles for your chosen industry.
                </Paragraph>
              </div>

              <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                <Row gutter={[12, 12]}>
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
                            borderColor: isSelected ? (brandColor || '#1677ff') : '#e8e8e8',
                            borderWidth: isSelected ? 2 : 1,
                            backgroundColor: isSelected ? 'rgba(22, 119, 255, 0.04)' : '#ffffff',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                          }}
                          bodyStyle={{ padding: 14 }}
                        >
                          {isSelected && (
                            <CheckCircleFilled
                              style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                color: brandColor || '#1677ff',
                                fontSize: 18,
                              }}
                            />
                          )}
                          <Space align="start" size={12}>
                            <div>{businessIcons[item.id] || <ShopOutlined />}</div>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: 14, display: 'block' }}>
                                {item.title}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                {item.titleHi}
                              </Text>
                              <Paragraph
                                type="secondary"
                                style={{ fontSize: 11, margin: 0, lineHeight: 1.4 }}
                                ellipsis={{ rows: 2 }}
                              >
                                {locale === 'hi' ? item.descriptionHi : item.description}
                              </Paragraph>

                              {item.superpowers && item.superpowers.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <Tag color="blue" style={{ fontSize: 10, margin: '2px 4px 2px 0' }}>
                                    <ThunderboltOutlined style={{ marginRight: 3 }} />
                                    {item.superpowers[0]}
                                  </Tag>
                                  <Tag color="cyan" style={{ fontSize: 10, margin: '2px 0' }}>
                                    {item.superpowers[1]}
                                  </Tag>
                                </div>
                              )}
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </div>
          )}

          {/* Step 2: Language & Trade Superpowers Preview */}
          {currentStep === 2 && (
            <div>
              <Row gutter={[16, 12]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="language"
                    label={<Text strong>Cockpit Language / भाषा चुनें</Text>}
                  >
                    <Radio.Group size="middle" buttonStyle="solid">
                      <Radio.Button value="en">English (English)</Radio.Button>
                      <Radio.Button value="hi">हिंदी (Hindi)</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <div style={{ textAlign: 'right', paddingTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Selected Category:
                    </Text>
                    <Tag color="processing" style={{ fontSize: 13, padding: '4px 10px', marginTop: 4 }}>
                      {currentTemplate.title}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 16px' }} />

              {/* Superpowers Breakdown Card */}
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Tailored Modules Configured for Your Business:</Text>
                  </Space>
                }
                style={{ borderRadius: 12 }}
                size="small"
              >
                {/* 1. Superpowers list */}
                {currentTemplate.superpowers && currentTemplate.superpowers.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                      ERP & Storefront Superpowers Included:
                    </Text>
                    <Space wrap size={[6, 6]}>
                      {currentTemplate.superpowers.map((sp: string, idx: number) => (
                        <Tag key={idx} color="gold" style={{ fontSize: 11 }}>
                          <CheckOutlined style={{ marginRight: 4 }} />
                          {sp}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {/* 2. Pipeline Stages */}
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Sales Follow-Up Pipeline Stages:
                  </Text>
                  <Space wrap size={[6, 6]}>
                    {currentTemplate.pipelineStages.map((st, idx) => (
                      <Tag key={idx} color={st.color} style={{ fontSize: 11 }}>
                        {idx + 1}. {st.name} ({st.probability}%)
                      </Tag>
                    ))}
                  </Space>
                </div>

                {/* 3. WhatsApp Templates */}
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Instant WhatsApp Notifications Included:
                  </Text>
                  <Space wrap size={[6, 6]}>
                    {currentTemplate.messageTemplates.map((mt, idx) => (
                      <Tag key={idx} color="green" style={{ fontSize: 11 }}>
                        <WhatsAppOutlined style={{ marginRight: 4 }} />
                        {mt.name}
                      </Tag>
                    ))}
                  </Space>
                </div>

                {/* 4. Custom Contact Fields */}
                {currentTemplate.customFields && currentTemplate.customFields.length > 0 && (
                  <div>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                      Specialized Trade Custom Fields:
                    </Text>
                    <Space wrap size={[6, 6]}>
                      {currentTemplate.customFields.map((cf, idx) => (
                        <Tag key={idx} color="purple" style={{ fontSize: 11 }}>
                          {cf.label}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 24,
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
                icon={<CheckOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Apply Template & Launch Cockpit
              </Button>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
}
