'use client';

import React, { useState } from 'react';
import {
  Modal,
  Steps,
  Upload,
  Button,
  Table,
  Select,
  Typography,
  Space,
  Radio,
  Card,
  Alert,
  message,
} from 'antd';
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface CustomerImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CustomerImportModal({
  open,
  onClose,
  onSuccess,
}: CustomerImportModalProps) {
  const { t, brandColor } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    city: '',
    address: '',
    notes: '',
  });
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'merge' | 'create'>('skip');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Download Sample CSV
  const handleDownloadSample = () => {
    const csvContent =
      'Name,Phone,Email,Company,City,Address,Notes\n' +
      'Rajesh Kumar,+91 98201 11223,rajesh@example.com,Kumar Traders,Mumbai,12 Commercial Marg,Interested in wholesale\n' +
      'Sunita Patel,9890233445,sunita@apex.in,Apex Clinic,Pune,FC Road,Regular clinic client\n' +
      'Vikram Singh,+91 98453 55667,,Singh Engineering,Bangalore,Peenya Industrial Area,Sample dispatch requested';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ginie_customer_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple and resilient CSV parser
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      message.error('CSV file must have a header row and at least 1 customer row');
      return;
    }

    const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    setHeaders(rawHeaders);

    // Auto-detect mappings based on header text
    const initialMapping: Record<string, string> = {};
    rawHeaders.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes('name') && !lower.includes('company')) initialMapping.name = h;
      else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact')) initialMapping.phone = h;
      else if (lower.includes('email') || lower.includes('mail')) initialMapping.email = h;
      else if (lower.includes('company') || lower.includes('business') || lower.includes('firm')) initialMapping.companyName = h;
      else if (lower.includes('city')) initialMapping.city = h;
      else if (lower.includes('address')) initialMapping.address = h;
      else if (lower.includes('note') || lower.includes('remark')) initialMapping.notes = h;
    });
    setColumnMapping((prev) => ({ ...prev, ...initialMapping }));

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Split by comma ignoring commas inside quotes
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
        v.trim().replace(/^["']|["']$/g, ''),
      );
      const rowObj: any = { _rowId: i };
      rawHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setCurrentStep(1);
    message.success(`Parsed ${rows.length} rows successfully.`);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
    return false; // prevent automatic HTTP upload
  };

  const handleExecuteImport = async () => {
    if (!columnMapping.name) {
      message.error('Please map the Customer Name column');
      return;
    }

    setImporting(true);
    try {
      // Transform rows based on user column mapping
      const mappedRows = parsedRows.map((r) => ({
        name: r[columnMapping.name] || 'Unnamed Customer',
        phone: columnMapping.phone ? r[columnMapping.phone] : undefined,
        email: columnMapping.email ? r[columnMapping.email] : undefined,
        companyName: columnMapping.companyName ? r[columnMapping.companyName] : undefined,
        city: columnMapping.city ? r[columnMapping.city] : undefined,
        address: columnMapping.address ? r[columnMapping.address] : undefined,
        notes: columnMapping.notes ? r[columnMapping.notes] : undefined,
      }));

      const res = await api.post('/api/contacts/import', {
        duplicateStrategy,
        rows: mappedRows,
      });

      setResult(res);
      setCurrentStep(2);
      message.success('Import completed successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Customer import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setParsedRows([]);
    setHeaders([]);
    setResult(null);
  };

  return (
    <Modal
      title={<Text strong style={{ fontSize: 16 }}>📥 Import Customers (Excel / CSV)</Text>}
      open={open}
      onCancel={() => {
        handleReset();
        onClose();
      }}
      width={780}
      footer={null}
      destroyOnClose
    >
      <div style={{ padding: '8px 4px 16px' }}>
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          items={[
            { title: 'Upload File' },
            { title: 'Map Columns' },
            { title: 'Import Report' },
          ]}
        />

        {/* Step 0: Upload File */}
        {currentStep === 0 && (
          <div>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadSample}>
                Download Sample CSV Template
              </Button>
            </div>

            <Dragger
              accept=".csv,.txt"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              style={{ padding: '32px 16px', borderRadius: 12 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: brandColor, fontSize: 48 }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 600 }}>
                Click or drag CSV file to this area to import
              </p>
              <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                Supports standard CSV files exported from Excel, Google Sheets, or other CRMs.
              </p>
            </Dragger>

            <Alert
              style={{ marginTop: 20, borderRadius: 8 }}
              type="info"
              showIcon
              message="Indian Phone Numbers (+91)"
              description="Phone numbers with 10 digits will be automatically formatted to standard Indian format (+91 XXXXX XXXXX)."
            />
          </div>
        )}

        {/* Step 1: Column Mapping & Duplicate Resolution */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15 }}>
                1. Match columns from your CSV ({parsedRows.length} customers found):
              </Text>
            </div>

            <Card size="small" style={{ borderRadius: 10, marginBottom: 20 }}>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong>Customer Name (Required):</Text>
                  <Select
                    style={{ width: 260 }}
                    value={columnMapping.name}
                    onChange={(val) => setColumnMapping((prev) => ({ ...prev, name: val }))}
                    options={headers.map((h) => ({ label: h, value: h }))}
                    placeholder="Select Name column"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>Phone Number:</Text>
                  <Select
                    style={{ width: 260 }}
                    allowClear
                    value={columnMapping.phone || undefined}
                    onChange={(val) => setColumnMapping((prev) => ({ ...prev, phone: val || '' }))}
                    options={headers.map((h) => ({ label: h, value: h }))}
                    placeholder="Select Phone column"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>Email Address:</Text>
                  <Select
                    style={{ width: 260 }}
                    allowClear
                    value={columnMapping.email || undefined}
                    onChange={(val) => setColumnMapping((prev) => ({ ...prev, email: val || '' }))}
                    options={headers.map((h) => ({ label: h, value: h }))}
                    placeholder="Select Email column"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>Company / Firm Name:</Text>
                  <Select
                    style={{ width: 260 }}
                    allowClear
                    value={columnMapping.companyName || undefined}
                    onChange={(val) => setColumnMapping((prev) => ({ ...prev, companyName: val || '' }))}
                    options={headers.map((h) => ({ label: h, value: h }))}
                    placeholder="Select Company column"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>City:</Text>
                  <Select
                    style={{ width: 260 }}
                    allowClear
                    value={columnMapping.city || undefined}
                    onChange={(val) => setColumnMapping((prev) => ({ ...prev, city: val || '' }))}
                    options={headers.map((h) => ({ label: h, value: h }))}
                    placeholder="Select City column"
                  />
                </div>
              </Space>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 15 }}>
                2. Duplicate Handling (Matches Phone or Email):
              </Text>
            </div>

            <Radio.Group
              value={duplicateStrategy}
              onChange={(e) => setDuplicateStrategy(e.target.value)}
              style={{ width: '100%', marginBottom: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="skip">
                  <Text strong>Skip duplicates (Recommended)</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    If a customer with the same phone or email exists, leave them unchanged.
                  </Text>
                </Radio>
                <Radio value="merge">
                  <Text strong>Merge & Update existing</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    Update the existing customer with any new address, city, or note information.
                  </Text>
                </Radio>
                <Radio value="create">
                  <Text strong>Create anyway</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    Create new customer record even if phone or email matches.
                  </Text>
                </Radio>
              </Space>
            </Radio.Group>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setCurrentStep(0)}>Back</Button>
              <Button
                type="primary"
                onClick={handleExecuteImport}
                loading={importing}
                icon={<UploadOutlined />}
              >
                Import {parsedRows.length} Customers Now
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Import Report */}
        {currentStep === 2 && result && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 52, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4} style={{ marginBottom: 8 }}>
              Customer Import Finished!
            </Title>
            <Paragraph type="secondary">
              Processed a total of {result.totalProcessed} records from your file.
            </Paragraph>

            <Space size={16} style={{ marginBottom: 28, justifyContent: 'center' }}>
              <Card size="small" style={{ width: 140, borderRadius: 10, background: '#f6ffed' }}>
                <Text type="secondary">Added / Merged</Text>
                <Title level={3} style={{ color: '#52c41a', margin: '4px 0 0' }}>
                  {result.addedCount}
                </Title>
              </Card>

              <Card size="small" style={{ width: 140, borderRadius: 10, background: '#fffbe6' }}>
                <Text type="secondary">Duplicates</Text>
                <Title level={3} style={{ color: '#faad14', margin: '4px 0 0' }}>
                  {result.duplicateCount}
                </Title>
              </Card>

              <Card size="small" style={{ width: 140, borderRadius: 10, background: result.errorCount > 0 ? '#fff2f0' : '#f5f5f5' }}>
                <Text type="secondary">Errors</Text>
                <Title level={3} style={{ color: result.errorCount > 0 ? '#ff4d4f' : '#8c8c8c', margin: '4px 0 0' }}>
                  {result.errorCount}
                </Title>
              </Card>
            </Space>

            <div>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  handleReset();
                  onClose();
                  window.location.reload();
                }}
              >
                Done & View Customers
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
