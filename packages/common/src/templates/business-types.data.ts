import type { BusinessTemplate } from '../index';

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  retail: {
    id: 'retail',
    title: 'Retail & Supermarket Store',
    titleHi: 'किराना, जनरल स्टोर व सुपरमार्केट',
    description: 'Grocery stores, supermarkets, FMCG, electronics, apparel & consumer retailers.',
    descriptionHi: 'किराना स्टोर्स, सुपरमार्केट्स, FMCG, इलेक्ट्रॉनिक्स और फुटकर व्यापार।',
    icon: 'ShopOutlined',
    superpowers: [
      'Camera & Laser Barcode POS Counter',
      'Real-Time Stock Deduction & Alerts',
      'Daybook Cash Register & UPI QR Split',
      '0% Commission WhatsApp Digital Storefront',
    ],
    pipelineStages: [
      { name: 'Product Enquiry / Walk-in', probability: 25, color: '#1677ff' },
      { name: 'Quotation / Cart Created', probability: 50, color: '#fa8c16' },
      { name: 'Order Confirmed', probability: 80, color: '#722ed1' },
      { name: 'Billed & Delivered', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'customerSegment',
        label: 'Customer Segment',
        fieldType: 'dropdown',
        options: ['Retail Walk-in', 'Regular Khata Account', 'VIP / Bulk Buyer'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'preferredCategory',
        label: 'Preferred Shopping Category',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'creditLimit',
        label: 'Customer Khata Credit Limit (INR)',
        fieldType: 'number',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Bill & Invoice Summary',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Thank you for shopping with {{companyName}}. Your invoice for INR {{amount}} has been generated. View order details: {{orderLink}}.',
      },
      {
        name: 'Khata Due Balance Reminder',
        channel: 'whatsapp',
        body: 'Hello {{name}}, friendly reminder from {{companyName}} regarding pending ledger balance of INR {{amount}}. Kindly clear at your earliest convenience.',
      },
    ],
  },

  wholesale: {
    id: 'wholesale',
    title: 'Wholesale & B2B Distribution',
    titleHi: 'थोक व्यापार व डिस्ट्रीब्यूशन',
    description: 'Bulk distributors, stockists, traders, commodity dealers & supply chain hubs.',
    descriptionHi: 'थोक वितरक, डिस्ट्रीब्यूटर, स्टॉकिस्ट, व्यापारी और बल्क सप्लायर्स।',
    icon: 'AppstoreOutlined',
    superpowers: [
      'Tiered Wholesale B2B Price Lists',
      'Customer Credit Ledger (Khata) & Limits',
      'Delivery Challan & Dispatch Management',
      'Box, Carton & Bulk Unit Conversions',
    ],
    pipelineStages: [
      { name: 'RFQ / Bulk Enquiry', probability: 20, color: '#1677ff' },
      { name: 'Formal Rate Quoted', probability: 45, color: '#fa8c16' },
      { name: 'Purchase Order Confirmed', probability: 75, color: '#13c2c2' },
      { name: 'Dispatched & Ledger Updated', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'gstin',
        label: 'Buyer Company GSTIN',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'paymentTerms',
        label: 'Credit Terms',
        fieldType: 'dropdown',
        options: ['100% Advance', 'Payment on Delivery', 'Net 15 Days', 'Net 30 Days', 'Net 45 Days'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'creditLimit',
        label: 'B2B Khata Limit (INR)',
        fieldType: 'number',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'transporter',
        label: 'Preferred Transporter / LR Carrier',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Dispatch & LR Intimation',
        channel: 'whatsapp',
        body: 'Dear {{name}}, your consignment from {{companyName}} has been dispatched via {{transporter}}. Bilty/LR Number: {{lrNo}}. Items: {{itemSummary}}.',
      },
      {
        name: 'Outstanding Statement Notice',
        channel: 'whatsapp',
        body: 'Namaste {{name}}, your ledger statement from {{companyName}} shows an outstanding balance of INR {{amount}}. Please review statement: {{statementLink}}.',
      },
    ],
  },

  automobile: {
    id: 'automobile',
    title: 'Automobile & Garage Workshop',
    titleHi: 'ऑटोमोबाइल, गैरेज व सर्विस सेंटर',
    description: 'Car & 2-wheeler workshops, multi-brand service centers, tyre shops & auto spare stores.',
    descriptionHi: 'कार व बाइक गैरेज, सर्विस वर्कशॉप, स्पेयर पार्ट्स और ऑटोमोबाइल केंद्र।',
    icon: 'CarOutlined',
    superpowers: [
      'Digital Vehicle Job Cards with Fuel/Dent Check',
      'Mechanic Labor vs Spare Parts Split Billing',
      'Barcode Fast Spare Parts Search',
      'Automated Next Service Due WhatsApp Reminders',
    ],
    pipelineStages: [
      { name: 'Vehicle Checked In / Inspection', probability: 25, color: '#1677ff' },
      { name: 'Estimate Approved by Customer', probability: 50, color: '#fa8c16' },
      { name: 'Work in Progress / Parts Fitted', probability: 75, color: '#722ed1' },
      { name: 'Serviced & Ready for Delivery', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'vehicleNumber',
        label: 'Vehicle Registration Number',
        fieldType: 'text',
        isRequired: true,
      },
      {
        entityType: 'contact',
        key: 'vehicleModel',
        label: 'Vehicle Make & Model',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'odometerReading',
        label: 'Odometer KM Reading',
        fieldType: 'number',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'assignedMechanic',
        label: 'Assigned Lead Mechanic',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Job Card Created Notification',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Vehicle {{vehicleNumber}} ({{vehicleModel}}) has been checked in at {{companyName}}. Job Card #{{jobCardNo}} created. Estimated total: INR {{estimate}}.',
      },
      {
        name: 'Vehicle Ready for Pickup',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Good news! Your vehicle {{vehicleNumber}} is serviced, washed, and ready for pickup at {{companyName}}. Final bill: INR {{amount}}.',
      },
    ],
  },

  pharmacy: {
    id: 'pharmacy',
    title: 'Pharmacy & Medical Chemist',
    titleHi: 'दवा दुकान, केमिस्ट व फार्मेसी',
    description: 'Retail chemist stores, pharmacies, surgical stores & medical distributors.',
    descriptionHi: 'दवा की दुकान, केमिस्ट, मेडिकल स्टोर्स और सर्जिकल सप्लायर्स।',
    icon: 'ExperimentOutlined',
    superpowers: [
      'Batch Number & Expiry Date Management',
      'Digital Prescription (Rx) Upload & Verification',
      'Tablet Strip & Bottle Cutting POS',
      'Monthly Chronic Patient Medication Refill Alerts',
    ],
    pipelineStages: [
      { name: 'Prescription Inward', probability: 25, color: '#1677ff' },
      { name: 'Batch & Expiry Verified', probability: 60, color: '#fa8c16' },
      { name: 'Billed & Medicines Dispensed', probability: 90, color: '#722ed1' },
      { name: 'Monthly Refill Scheduled', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'doctorName',
        label: 'Consulting Doctor Name',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'prescriptionNumber',
        label: 'Doctor Rx Number',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'chronicCondition',
        label: 'Chronic Health Condition',
        fieldType: 'dropdown',
        options: ['General Health', 'Diabetes', 'Hypertension / BP', 'Cardiology', 'Thyroid', 'Asthma'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'patientAge',
        label: 'Patient Age',
        fieldType: 'number',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Prescription Packed & Ready',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Your medicines prescribed by Dr. {{doctorName}} are batched, verified, and ready at {{companyName}}. Amount: INR {{amount}}.',
      },
      {
        name: 'Monthly Medicine Refill Due',
        channel: 'whatsapp',
        body: 'Dear {{name}}, your monthly medication from {{companyName}} is due for refill. Reply to this WhatsApp message to confirm delivery to your doorstep.',
      },
    ],
  },

  jewellery: {
    id: 'jewellery',
    title: 'Jewellery & Gold Ornaments',
    titleHi: 'सर्राफा, आभूषण व गोल्ड शोरूम',
    description: 'Gold, silver, diamond showrooms, bespoke jewellery designers & bullion merchants.',
    descriptionHi: 'सोने-चांदी के आभूषण, जेवर शोरूम, सर्राफा व्यापारी व बुलियन ट्रेडर्स।',
    icon: 'CrownOutlined',
    superpowers: [
      'Real-Time Gold & Silver Rate Bar (24K/22K/18K)',
      'BIS 916 Hallmark Purity & HUID Calculator',
      'Making Charges & Metal Wastage Split Breakdown',
      'Old Gold Exchange & Valuation Ledger',
    ],
    pipelineStages: [
      { name: 'Ornament Inquired / Selected', probability: 20, color: '#1677ff' },
      { name: 'Rate, Purity & Making Quoted', probability: 50, color: '#fa8c16' },
      { name: 'Booking Advance Received', probability: 80, color: '#722ed1' },
      { name: 'Hallmarked, Delivered & Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'metalPreference',
        label: 'Metal Preference',
        fieldType: 'dropdown',
        options: ['22K Hallmark Gold (916)', '18K Diamond Jewellery (750)', '24K Pure Bullion (999)', '925 Sterling Silver'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'hallmarkHuid',
        label: 'BIS Hallmark Unique HUID',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'grossWeightGrams',
        label: 'Ornament Weight (Grams)',
        fieldType: 'number',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Bespoke Ornament Ready',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Your bespoke jewellery order from {{companyName}} has been crafted, 916 hallmarked, and is ready for collection.',
      },
      {
        name: 'Today Live Gold Rate Broadcast',
        channel: 'whatsapp',
        body: 'Today Gold Rate at {{companyName}}: 24K Pure INR {{gold24k}}/10g, 22K Hallmark INR {{gold22k}}/10g. Visit us today for zero wastage offers.',
      },
    ],
  },

  restaurant: {
    id: 'restaurant',
    title: 'Restaurant, Cafe & Cloud Kitchen',
    titleHi: 'रेस्टोरेंट, कैफे व क्लाउड किचन',
    description: 'Dine-in restaurants, cafes, bakeries, cloud kitchens, food courts & caterers.',
    descriptionHi: 'रेस्टोरेंट, कैफे, बेकरी, क्लाउड किचन, फास्ट फूड और कैटरिंग व्यवसाय।',
    icon: 'CoffeeOutlined',
    superpowers: [
      'Live Dine-in Table Manager & Status',
      'Kitchen Order Ticket (KOT) Printing & Dispatch',
      'Zero-Commission Direct WhatsApp Food Orders',
      'Bilingual Digital Menu & Category Filter',
    ],
    pipelineStages: [
      { name: 'Table Reserved / Order Received', probability: 25, color: '#1677ff' },
      { name: 'KOT Sent to Kitchen', probability: 55, color: '#fa8c16' },
      { name: 'Food Prepared / Out for Delivery', probability: 85, color: '#722ed1' },
      { name: 'Billed & Settled', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'dietaryPreference',
        label: 'Dietary Preference',
        fieldType: 'dropdown',
        options: ['Pure Vegetarian', 'Non-Vegetarian', 'Jain / Vegan', 'Halal'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'favoriteDish',
        label: 'Favorite Signature Dish',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'anniversaryDate',
        label: 'Anniversary Date',
        fieldType: 'date',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Order Confirmation & Kitchen Update',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! Thank you for ordering from {{companyName}}. Your delicious meal is being prepared fresh in our kitchen! Order total: INR {{amount}}.',
      },
      {
        name: 'Table Reservation Confirmed',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Your table reservation for {{guests}} guests at {{companyName}} is confirmed for {{time}}. We look forward to serving you.',
      },
    ],
  },

  salon: {
    id: 'salon',
    title: 'Salon, Spa & Beauty Parlour',
    titleHi: 'सैलून, स्पा व ब्यूटी पार्लर',
    description: 'Hair salons, beauty parlours, nail spas, barbershops & bridal makeover studios.',
    descriptionHi: 'हेयर सैलून, ब्यूटी पार्लर, स्पा, ब्राइडल मेकअप और स्किन केयर सेंटर्स।',
    icon: 'ScissorOutlined',
    superpowers: [
      'Stylist Chair & Time Slot Booking',
      'Service Duration & Staff Commission Log',
      'Bridal & Groom Makeover Packages',
      '0% Commission Online Appointment Storefront',
    ],
    pipelineStages: [
      { name: 'Appointment Requested', probability: 25, color: '#1677ff' },
      { name: 'Stylist & Time Slot Confirmed', probability: 50, color: '#fa8c16' },
      { name: 'Service In-Progress', probability: 80, color: '#722ed1' },
      { name: 'Completed & Billed', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'preferredStylist',
        label: 'Preferred Stylist / Specialist',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'hairSkinType',
        label: 'Hair & Skin Profile',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'membershipTier',
        label: 'VIP Membership Level',
        fieldType: 'dropdown',
        options: ['Standard Guest', 'Silver Member', 'Gold VIP', 'Bridal Royal Client'],
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Appointment Slot Confirmed',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Your appointment at {{companyName}} with {{stylist}} is confirmed for {{time}}. Please arrive 5 minutes early for consultation.',
      },
      {
        name: 'Special Pamper Weekend Offer',
        channel: 'whatsapp',
        body: 'Hi {{name}}! Time to pamper yourself. Enjoy 20% off on all hair spa and facial treatments at {{companyName}} this weekend. Code: GLOW20.',
      },
    ],
  },

  education: {
    id: 'education',
    title: 'Coaching, School & Tuition Academy',
    titleHi: 'कोचिंग संस्थान, स्कूल व ट्यूशन',
    description: 'Coaching institutes, test prep academies, schools, tuition centers & skill training hubs.',
    descriptionHi: 'कोचिंग सेंटर्स, ट्यूशन, स्कूल, कॉलेज और प्रतियोगी परीक्षा संस्थान।',
    icon: 'ReadOutlined',
    superpowers: [
      'Student Batch & Admission Tracking',
      'Monthly Tuition Fee Installment Schedule',
      'Parent WhatsApp Fee Due Notices & Receipts',
      'Online Course & Study Material Storefront',
    ],
    pipelineStages: [
      { name: 'New Student Enquiry', probability: 20, color: '#1677ff' },
      { name: 'Campus Visit / Demo Class', probability: 45, color: '#fa8c16' },
      { name: 'Admission Form Submitted', probability: 75, color: '#13c2c2' },
      { name: 'Enrolled & Fee Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'studentName',
        label: 'Student Full Name',
        fieldType: 'text',
        isRequired: true,
      },
      {
        entityType: 'contact',
        key: 'targetExam',
        label: 'Class / Target Examination',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'parentWhatsApp',
        label: 'Parent / Guardian WhatsApp',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'academicBatch',
        label: 'Assigned Batch / Timing',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Free Demo Class Invitation',
        channel: 'whatsapp',
        body: 'Namaste {{name}}! We invite {{studentName}} for a free demo class at {{companyName}} this Saturday. Please confirm attendance to book seat.',
      },
      {
        name: 'Monthly Fee Reminder Notice',
        channel: 'whatsapp',
        body: 'Dear {{name}}, monthly tuition installment of INR {{amount}} for {{studentName}} at {{companyName}} is due on {{dueDate}}. Thank you.',
      },
    ],
  },

  clinic: {
    id: 'clinic',
    title: 'Clinic, Doctor & Healthcare Centre',
    titleHi: 'क्लिनिक, डॉक्टर व स्वास्थ्य केंद्र',
    description: 'Doctors, dental clinics, polyclinics, diagnostic labs, physiotherapists & nursing homes.',
    descriptionHi: 'डॉक्टर क्लिनिक, डेंटल, डायग्नोस्टिक लैब्स, फिजियोथेरेपी व स्वास्थ्य केंद्र।',
    icon: 'MedicineBoxOutlined',
    superpowers: [
      'Patient OPD Appointment Counter & Token',
      'Digital Doctor Prescription (Rx) Generator',
      'Diagnostic Health Packages Storefront',
      'Automated Appointment WhatsApp Reminders',
    ],
    pipelineStages: [
      { name: 'Patient Inquired / Booked', probability: 25, color: '#1677ff' },
      { name: 'Consultation & Examination Done', probability: 60, color: '#fa8c16' },
      { name: 'Treatment / Diagnostics Advised', probability: 85, color: '#722ed1' },
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
        label: 'Medical History / Known Allergies',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'referringDoctor',
        label: 'Referring Doctor / Clinic',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Doctor Appointment Confirmation',
        channel: 'whatsapp',
        body: 'Hello {{name}}! Your appointment at {{companyName}} is confirmed for {{time}}. Token Number: {{token}}. Please arrive 10 minutes early.',
      },
      {
        name: 'Post-Visit Care & Recovery',
        channel: 'whatsapp',
        body: 'Dear {{name}}, hope you are recovering well after your visit to {{companyName}}. Please take your prescribed medicines on time.',
      },
    ],
  },

  manufacturing: {
    id: 'manufacturing',
    title: 'Manufacturing & Industrial Unit',
    titleHi: 'फैक्ट्री, मैन्युफैक्चरिंग व उद्योग',
    description: 'Manufacturers, industrial fabricators, CNC job shops, packaging & production units.',
    descriptionHi: 'उत्पादन इकाइयां, मैन्युफैक्चरिंग प्लांट्स, मशीनरी और औद्योगिक कारखाने।',
    icon: 'BuildOutlined',
    superpowers: [
      'Bill of Materials (BOM) & Raw Material Math',
      'Production Work Orders & Stage Tracking',
      'Scrap & Yield Wastage Accounting',
      'Commercial B2B Tax Invoicing & E-Waybill Support',
    ],
    pipelineStages: [
      { name: 'RFQ & Drawing Received', probability: 20, color: '#1677ff' },
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
        label: 'Annual Requirement Capacity',
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
        name: 'Dispatch Intimation & LR',
        channel: 'whatsapp',
        body: 'Dear {{name}}, your order from {{companyName}} has been dispatched. LR / Tracking Details: {{trackingNo}}.',
      },
    ],
  },

  services: {
    id: 'services',
    title: 'Services, Agency & Consulting',
    titleHi: 'सर्विस, एजेंसी व कंसल्टिंग',
    description: 'Digital agencies, CA/Legal firms, IT companies, architects & consulting businesses.',
    descriptionHi: 'डिजिटल एजेंसी, सीए/लीगल फर्म्स, कंसल्टिंग, इवेंट्स और प्रोफेशनल सर्विसेज।',
    icon: 'RocketOutlined',
    superpowers: [
      'Project Milestone & Retainer Invoicing',
      'Client Timesheets & Deliverable Tracking',
      'Annual Maintenance Contract (AMC) Management',
      'Interactive Proposal to Contract Pipeline',
    ],
    pipelineStages: [
      { name: 'Discovery Call & Requirement', probability: 25, color: '#1677ff' },
      { name: 'Scope of Work & Proposal Sent', probability: 50, color: '#fa8c16' },
      { name: 'Agreement Signed & Retainer Paid', probability: 80, color: '#722ed1' },
      { name: 'Project Delivered & Paid', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'serviceRequired',
        label: 'Core Service Required',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'billingCycle',
        label: 'Billing Cycle',
        fieldType: 'dropdown',
        options: ['One-Time Project', 'Monthly Retainer', 'Quarterly Retainer', 'Milestone-Based'],
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'budgetRange',
        label: 'Budget Range (INR)',
        fieldType: 'text',
        isRequired: false,
      },
    ],
    messageTemplates: [
      {
        name: 'Service Proposal Shared',
        channel: 'whatsapp',
        body: 'Hi {{name}}! We have shared the service proposal from {{companyName}} on your email. Let us know when we can review it together.',
      },
      {
        name: 'Milestone Delivery Completed',
        channel: 'whatsapp',
        body: 'Namaste {{name}}, milestone deliverables from {{companyName}} have been completed. Please find invoice and timesheet attached.',
      },
    ],
  },

  other: {
    id: 'other',
    title: 'General Commercial Business',
    titleHi: 'अन्य सामान्य व्यापार व व्यवसाय',
    description: 'General sales, distribution, trading & multipurpose commercial establishments.',
    descriptionHi: 'सामान्य बिक्री, डिस्ट्रीब्यूशन, ट्रेडिंग और अन्य व्यावसायिक उद्यम।',
    icon: 'AppstoreOutlined',
    superpowers: [
      'Fast Billing POS Counter',
      'Customer Credit Ledger (Khata)',
      '0% Commission Digital Storefront',
      'Automated WhatsApp Invoicing',
    ],
    pipelineStages: [
      { name: 'New Lead Inquired', probability: 20, color: '#1677ff' },
      { name: 'Contacted & Scoped', probability: 40, color: '#13c2c2' },
      { name: 'Proposal Sent', probability: 70, color: '#fa8c16' },
      { name: 'Deal Won & Billed', probability: 100, color: '#52c41a' },
    ],
    customFields: [
      {
        entityType: 'contact',
        key: 'leadSource',
        label: 'Lead Source Details',
        fieldType: 'text',
        isRequired: false,
      },
      {
        entityType: 'contact',
        key: 'customerNotes',
        label: 'Customer Notes',
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

// Aliases for backward compatibility
BUSINESS_TEMPLATES.shop = BUSINESS_TEMPLATES.retail;
BUSINESS_TEMPLATES.school = BUSINESS_TEMPLATES.education;
BUSINESS_TEMPLATES.factory = BUSINESS_TEMPLATES.manufacturing;
