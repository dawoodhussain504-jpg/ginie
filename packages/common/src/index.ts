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
