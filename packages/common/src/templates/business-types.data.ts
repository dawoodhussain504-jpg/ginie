import type { BusinessTemplate } from '../index';

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  shop: {
    id: 'shop',
    title: 'Shop / Retail / Trading',
    titleHi: 'दुकान / रीटेल / व्यापारी',
    description: 'Retail stores, wholesale merchants, electronics, garments, groceries & traders.',
    descriptionHi: 'रीटेल स्टोर्स, होलसेल व्यापारी, इलेक्ट्रॉनिक्स, गारमेंट्स, किराना और ट्रेडर्स।',
    icon: 'ShopOutlined',
    pipelineStages: [
      { name: 'Product Enquiry', probability: 20, color: '#1677ff' },
      { name: 'Quotation Sent', probability: 50, color: '#fa8c16' },
      { name: 'Order Confirmed', probability: 80, color: '#722ed1' },
      { name: 'Delivered & Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'customerSegment',
        label: 'Customer Segment',
        fieldType: 'dropdown',
        options: ['Retail Walk-in', 'Wholesale Regular', 'VIP / Bulk Buyer'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'preferredProduct',
        label: 'Preferred Category',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'creditLimit',
        label: 'Credit Limit (₹)',
        fieldType: 'number',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Order Confirmation',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Thank you for ordering from {{companyName}}. Your invoice is ready and your items are being packed.',
      },
      {
        name: 'Payment Reminder',
        channel: 'whatsapp',
        body: 'Hello {{name}}, friendly reminder from {{companyName}} regarding pending balance of ₹{{amount}}. Please let us know once paid.',
      },
    ],
  },

  school: {
    id: 'school',
    title: 'School / Coaching / Education',
    titleHi: 'स्कूल / कोचिंग / संस्थान',
    description: 'Schools, coaching institutes, tuition centers, colleges & online academies.',
    descriptionHi: 'स्कूल, कोचिंग संस्थान, ट्यूशन सेंटर्स, कॉलेज और ऑनलाइन एकेडेमी।',
    icon: 'ReadOutlined',
    pipelineStages: [
      { name: 'New Enquiry', probability: 15, color: '#1677ff' },
      { name: 'Campus Visit / Demo Class', probability: 45, color: '#fa8c16' },
      { name: 'Admission Form Submitted', probability: 75, color: '#13c2c2' },
      { name: 'Enrolled & Fee Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'studentName',
        label: 'Student Name',
        fieldType: 'text',
        isRequired: true,
      },
      {
        entityType: 'contact',
        key: 'targetGrade',
        label: 'Class / Target Exam',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'academicYear',
        label: 'Academic Batch/Year',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Demo Class Invite',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! We are pleased to invite {{studentName}} for a free demo class at {{companyName}} this Saturday. Please confirm attendance.',
      },
      {
        name: 'Fee Due Notice',
        channel: 'whatsapp',
        body: 'Dear {{name}}, the tuition installment for {{studentName}} at {{companyName}} is due on {{dueDate}}. Thank you.',
      },
    ],
  },

  clinic: {
    id: 'clinic',
    title: 'Clinic / Doctor / Healthcare',
    titleHi: 'क्लिनिक / डॉक्टर / स्वास्थ्य केंद्र',
    description: 'Doctors, dental clinics, diagnostic centers, physiotherapy & healthcare providers.',
    descriptionHi: 'डॉक्टर, डेंटल क्लिनिक, डायग्नोस्टिक सेंटर्स, फिजियोथेरेपी और स्वास्थ्य केंद्र।',
    icon: 'MedicineBoxOutlined',
    pipelineStages: [
      { name: 'Patient Inquired', probability: 25, color: '#1677ff' },
      { name: 'Consultation Scheduled', probability: 60, color: '#fa8c16' },
      { name: 'Treatment In Progress', probability: 85, color: '#722ed1' },
      { name: 'Follow-up Completed', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'patientAge',
        label: 'Patient Age',
        fieldType: 'number',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'bloodGroup',
        label: 'Blood Group',
        fieldType: 'dropdown',
        options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'allergiesOrHistory',
        label: 'Medical History / Allergies',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Appointment Reminder',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Your appointment with {{companyName}} is confirmed for {{time}}. Please reach 10 minutes before time.',
      },
      {
        name: 'Post-Visit Care',
        channel: 'whatsapp',
        body: 'Dear {{name}}, hope you are feeling better after your visit to {{companyName}}. Please take your prescribed medicine on time.',
      },
    ],
  },

  factory: {
    id: 'factory',
    title: 'Factory / Manufacturing / Industrial',
    titleHi: 'फैक्ट्री / मैन्युफैक्चरिंग / उद्योग',
    description: 'Manufacturers, industrial suppliers, packaging, machinery & production units.',
    descriptionHi: 'मैन्युफैक्चरर्स, इंडस्ट्रियल सप्लायर्स, पैकेजिंग, मशीनरी और प्रोडक्शन यूनिट्स।',
    icon: 'GoldOutlined',
    pipelineStages: [
      { name: 'RFQ Received', probability: 20, color: '#1677ff' },
      { name: 'Sample / Spec Approved', probability: 50, color: '#13c2c2' },
      { name: 'Purchase Order Issued', probability: 80, color: '#fa8c16' },
      { name: 'Production Dispatched & Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'gstin',
        label: 'Company GSTIN',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'annualVolume',
        label: 'Annual Requirement / Capacity',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'paymentTerms',
        label: 'Payment Terms',
        fieldType: 'dropdown',
        options: ['100% Advance', '50% Advance / 50% Dispatch', 'Net 30 Days', 'Net 60 Days'],
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Quotation Follow-up',
        channel: 'whatsapp',
        body: 'Respected {{name}}, following up on our commercial quotation sent by {{companyName}} for {{productName}}. Awaiting your feedback.',
      },
      {
        name: 'Dispatch Intimation',
        channel: 'whatsapp',
        body: 'Dear {{name}}, your order from {{companyName}} has been dispatched. LR / Tracking Details: {{trackingNo}}.',
      },
    ],
  },

  services: {
    id: 'services',
    title: 'Services / Agency / Consulting',
    titleHi: 'सर्विसेज / एजेंसी / कंसल्टिंग',
    description: 'Digital agencies, CA/Legal firms, consulting, event planners & service businesses.',
    descriptionHi: 'डिजिटल एजेंसी, सीए/लीगल फर्म्स, कंसल्टिंग, इवेंट्स और सर्विस व्यवसाय।',
    icon: 'CustomerServiceOutlined',
    pipelineStages: [
      { name: 'Discovery Call', probability: 25, color: '#1677ff' },
      { name: 'Scope & Proposal Sent', probability: 50, color: '#fa8c16' },
      { name: 'Agreement Signed', probability: 80, color: '#722ed1' },
      { name: 'Project Delivered & Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'serviceRequired',
        label: 'Service Required',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'budgetRange',
        label: 'Budget Range (₹)',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Proposal Shared',
        channel: 'whatsapp',
        body: 'Hi {{name}}! We have shared the service proposal from {{companyName}} on your email. Let us know when we can review it together.',
      },
    ],
  },

  other: {
    id: 'other',
    title: 'General Business',
    titleHi: 'अन्य सामान्य व्यवसाय',
    description: 'General sales, distribution, real estate & other commercial setups.',
    descriptionHi: 'सामान्य बिक्री, डिस्ट्रीब्यूशन, रियल एस्टेट और अन्य व्यवसाय।',
    icon: 'AppstoreOutlined',
    pipelineStages: [
      { name: 'New Lead', probability: 20, color: '#1677ff' },
      { name: 'Contacted', probability: 40, color: '#13c2c2' },
      { name: 'Proposal Sent', probability: 70, color: '#fa8c16' },
      { name: 'Deal Won', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'leadSource',
        label: 'Lead Source Details',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Welcome Greeting',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Welcome to {{companyName}}. Please let us know how we can assist you today.',
      },
    ],
  },
};
