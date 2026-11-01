import { z } from 'zod';

// ========================================================
// 1. Roles & Permissions
// ========================================================
export enum UserRoleEnum {
  OWNER = 'Owner',
  MANAGER = 'Manager',
  SALES = 'Sales Executive',
  VIEWER = 'Viewer',
}

export interface PermissionMatrix {
  leads: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean };
  deals: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean };
  contacts: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean };
  tasks: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean };
  discovery: { view: boolean; search: boolean; import: boolean };
  whatsapp: { view: boolean; send: boolean; manage: boolean };
  billing: { view: boolean; create: boolean; edit: boolean };
  settings: { view: boolean; edit: boolean };
}

// ========================================================
// 2. Authentication DTOs & Schemas
// ========================================================
export const RegisterSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  name: z.string().min(2, 'Your name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  permissions?: PermissionMatrix;
  companyName: string;
  companyBrandColor?: string;
  language: string;
  isSuperAdmin?: boolean;
}

// ========================================================
// 3. Potential Customers (Leads)
// ========================================================
export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default('India'),
  pincode: z.string().optional(),
  source: z.string().optional().default('Direct'),
  statusId: z.string().optional(),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  googlePlaceId: z.string().optional(),
  customFields: z.record(z.any()).optional().default({}),
});
export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial();
export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;

// ========================================================
// 4. Sales in Progress (Deals / Pipelines)
// ========================================================
export const CreateDealSchema = z.object({
  title: z.string().min(2, 'Sale title is required'),
  value: z.number().min(0, 'Amount must be greater than or equal to 0'),
  currency: z.string().default('INR'),
  stageId: z.string(),
  pipelineId: z.string(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  expectedClose: z.string().optional(),
});
export type CreateDealDto = z.infer<typeof CreateDealSchema>;

// ========================================================
// 5. Tasks & Activities
// ========================================================
export const CreateTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  dueAt: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeId: z.string().optional(),
  entityType: z.enum(['lead', 'contact', 'deal']).optional(),
  entityId: z.string().optional(),
});
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const CreateActivitySchema = z.object({
  entityType: z.enum(['lead', 'contact', 'deal']),
  entityId: z.string(),
  type: z.enum(['note', 'call', 'email', 'whatsapp', 'task', 'status']),
  content: z.string().min(1, 'Content is required'),
  meta: z.record(z.any()).optional().default({}),
});
export type CreateActivityDto = z.infer<typeof CreateActivitySchema>;

// ========================================================
// 6. Find New Customers (Google Places Lead Discovery)
// ========================================================
export const DiscoverySearchSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City or state is required'),
  pincode: z.string().optional(),
  category: z.string().min(1, 'Business category is required'),
});
export type DiscoverySearchDto = z.infer<typeof DiscoverySearchSchema>;

export interface DiscoveryResultItem {
  id: string;
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  userRatingsTotal?: number;
  isImported?: boolean;
}

export const ImportDiscoveryResultsSchema = z.object({
  resultIds: z.array(z.string()).min(1, 'Please select at least one business to add'),
  statusId: z.string().optional(),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional().default(['Google Maps']),
});
export type ImportDiscoveryResultsDto = z.infer<typeof ImportDiscoveryResultsSchema>;

// ========================================================
// 7. WhatsApp Subsystem & Bridge (Section 5.8.1)
// ========================================================
export interface WhatsAppProvider {
  sendText(to: string, text: string): Promise<{ messageId: string }>;
  sendMedia?(to: string, mediaUrl: string, caption?: string): Promise<{ messageId: string }>;
  setPresence(to: string, presence: 'composing' | 'paused'): Promise<void>;
  markRead(messageId: string): Promise<void>;
  getStatus(): Promise<{ status: 'connected' | 'disconnected' | 'qr_ready'; qrCode?: string }>;
}

export const SendWhatsAppMessageSchema = z.object({
  phone: z.string().min(8, 'Phone number is required'),
  message: z.string().min(1, 'Message text is required'),
  contactId: z.string().optional(),
});
export type SendWhatsAppMessageDto = z.infer<typeof SendWhatsAppMessageSchema>;

export const CreateAutoReplyRuleSchema = z.object({
  name: z.string().min(2, 'Rule name is required'),
  triggerType: z.enum(['keyword', 'first_message', 'outside_hours', 'ai']),
  triggerConfig: z.record(z.any()).default({}),
  replyVariants: z.array(z.string()).min(1, 'Please add at least one message variation'),
  delayMinSeconds: z.number().min(3).max(60).default(8),
  delayMaxSeconds: z.number().min(10).max(120).default(45),
  businessHours: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});
export type CreateAutoReplyRuleDto = z.infer<typeof CreateAutoReplyRuleSchema>;

// ========================================================
// 8. Products, Quotations & Invoices (Section 5.9)
// ========================================================
export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Product or service name is required'),
  code: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or more'),
  taxRate: z.number().min(0).max(100).default(18), // Default 18% GST
  unit: z.string().default('piece'),
  description: z.string().optional(),
});
export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const QuotationItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  price: z.number().min(0),
  quantity: z.number().min(1),
  taxRate: z.number().min(0).default(18),
  hsn: z.string().optional(),
  code: z.string().optional(),
  unit: z.string().optional(),
  isInterState: z.boolean().optional(),
});
export type QuotationItemDto = z.infer<typeof QuotationItemSchema>;

export const CreateQuotationSchema = z.object({
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  items: z.array(QuotationItemSchema).min(1, 'Add at least one item'),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>;

export const CreateInvoiceSchema = z.object({
  quotationId: z.string().optional(),
  contactId: z.string().optional(),
  customerName: z.string().optional(),
  customerGstin: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerState: z.string().optional(),
  items: z.array(QuotationItemSchema).min(1, 'Add at least one item'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  isInterState: z.boolean().optional(),
});
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

// ========================================================
// 9. Extra Details (Custom Fields) & Web Forms
// ========================================================
export const CreateCustomFieldSchema = z.object({
  entityType: z.enum(['lead', 'contact', 'company', 'deal']),
  key: z.string().min(2),
  label: z.string().min(2),
  fieldType: z.enum(['text', 'number', 'date', 'dropdown', 'boolean']),
  options: z.array(z.string()).optional().default([]),
  isRequired: z.boolean().default(false),
});
export type CreateCustomFieldDto = z.infer<typeof CreateCustomFieldSchema>;

export const SubmitWebFormSchema = z.object({
  name: z.string().min(2, 'Your name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
  customFields: z.record(z.any()).optional().default({}),
});
export type SubmitWebFormDto = z.infer<typeof SubmitWebFormSchema>;

// ========================================================
// 10. Auto Actions (Workflow Automation)
// ========================================================
export const WorkflowTriggerEvent = z.enum([
  'customer.created',
  'deal.stage_changed',
  'task.overdue',
  'form.submitted',
]);
export type WorkflowTriggerEventType = z.infer<typeof WorkflowTriggerEvent>;

export const WorkflowConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.any(),
});
export type WorkflowConditionDto = z.infer<typeof WorkflowConditionSchema>;

export const WorkflowActionSchema = z.object({
  type: z.enum(['send_whatsapp', 'create_task', 'assign_owner', 'webhook', 'update_status']),
  params: z.record(z.any()),
});
export type WorkflowActionDto = z.infer<typeof WorkflowActionSchema>;

export const CreateWorkflowSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  triggerEvent: WorkflowTriggerEvent,
  conditions: z.array(WorkflowConditionSchema).default([]),
  actions: z.array(WorkflowActionSchema).min(1, 'Please add at least one action'),
  isActive: z.boolean().default(true),
});
export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;

// ========================================================
// 11. AI Intelligence (Provider-Agnostic Layer)
// ========================================================
export type AiTone = 'professional' | 'friendly' | 'urgent' | 'persuasive';

export const ScoreCustomerSchema = z.object({
  customerId: z.string(),
});
export type ScoreCustomerDto = z.infer<typeof ScoreCustomerSchema>;

export interface CustomerScoreResult {
  score: number; // 0 to 100
  category: 'Hot' | 'Warm' | 'Cold';
  reason: string;
  suggestedAction: string;
}

export const DraftMessageSchema = z.object({
  customerId: z.string(),
  channel: z.enum(['whatsapp', 'email']).default('whatsapp'),
  tone: z.enum(['professional', 'friendly', 'urgent', 'persuasive']).default('friendly'),
  goal: z.string().optional(), // e.g. "follow up after demo", "send quotation reminder"
  additionalNotes: z.string().optional(),
});
export type DraftMessageDto = z.infer<typeof DraftMessageSchema>;

export interface DraftMessageResult {
  subject?: string;
  message: string;
  suggestedDelaySeconds?: number;
  tone?: string;
  channel?: string;
}

export const SummarizeCallSchema = z.object({
  rawNotes: z.string().min(5, 'Please provide notes to summarize'),
  customerId: z.string().optional(),
});
export type SummarizeCallDto = z.infer<typeof SummarizeCallSchema>;

export interface SummarizeCallResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Concerning';
  keyTakeaways: string[];
  nextRecommendedAction: string;
}

// ========================================================
// 12. SaaS Subscription Billing & Quotas
// ========================================================
export interface PlanLimitConfig {
  maxUsers: number;
  maxLeads: number;
  monthlyDiscoverySearches: number;
  monthlyWhatsAppMessages?: number;
  hasAiFeatures?: boolean;
  hasAutomations?: boolean;
}

export const UpgradePlanSchema = z.object({
  planName: z.enum(['Free', 'Pro', 'Enterprise']),
  paymentGateway: z.enum(['razorpay', 'stripe', 'manual']).default('razorpay'),
});
export type UpgradePlanDto = z.infer<typeof UpgradePlanSchema>;

// ========================================================
// 13. Platform Owner (Super Admin)
// ========================================================
export const UpdateTenantStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'trial']),
  reason: z.string().optional(),
});
export type UpdateTenantStatusDto = z.infer<typeof UpdateTenantStatusSchema>;

export const UpdateTenantPlanSchema = z.object({
  planName: z.string(),
});
export type UpdateTenantPlanDto = z.infer<typeof UpdateTenantPlanSchema>;

// ========================================================
// 14. Activity History & Audit Logs
// ========================================================
export interface AuditLogDto {
  id: string;
  tenantId: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: any;
  after?: any;
  ipAddress?: string | null;
  createdAt: string;
}


// ========================================================
// 15. Business Types & Onboarding (Upgrade Spec Phase 1)
// ========================================================
export type BusinessTypeEnum = 'shop' | 'school' | 'clinic' | 'factory' | 'services' | 'other';

export const CompleteOnboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.enum(['shop', 'school', 'clinic', 'factory', 'services', 'other']),
  teamSize: z.string().optional().default('1-5'),
  language: z.enum(['en', 'hi']).default('en'),
});
export type CompleteOnboardingDto = z.infer<typeof CompleteOnboardingSchema>;

export interface BusinessTemplateStage {
  name: string;
  probability: number;
  color: string;
}

export interface BusinessTemplateCustomField {
  entityType: 'contact' | 'lead' | 'deal';
  key: string;
  label: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'boolean';
  options?: string[];
  isRequired?: boolean;
}

export interface BusinessTemplateMessage {
  name: string;
  channel: 'whatsapp';
  body: string;
}

export interface BusinessTemplate {
  id: BusinessTypeEnum;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  icon: string;
  pipelineStages: BusinessTemplateStage[];
  customFields: BusinessTemplateCustomField[];
  messageTemplates: BusinessTemplateMessage[];
}

// ========================================================
// 16. Customer CSV/Excel Import (Upgrade Spec Phase 1)
// ========================================================
export interface CustomerImportRow {
  name: string;
  phone?: string;
  email?: string;
  companyName?: string;
  city?: string;
  address?: string;
  pincode?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export const ImportCustomersSchema = z.object({
  duplicateStrategy: z.enum(['skip', 'merge', 'create']).default('skip'),
  rows: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      phone: z.string().optional(),
      email: z.string().optional(),
      companyName: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      pincode: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      customFields: z.record(z.any()).optional(),
    }),
  ),
});
export type ImportCustomersDto = z.infer<typeof ImportCustomersSchema>;

export interface ImportResultSummary {
  totalProcessed: number;
  addedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: Array<{ row: number; name: string; error: string }>;
}

export * from './templates/business-types.data';
