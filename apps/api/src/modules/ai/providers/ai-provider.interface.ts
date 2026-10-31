import {
  CustomerScoreResult,
  DraftMessageResult,
  SummarizeCallResult,
  AiTone,
} from '@ginie/common';

export interface DraftMessageContext {
  customerName: string;
  companyName?: string;
  recentNotes?: string;
  channel: 'whatsapp' | 'email';
  tone: AiTone;
  goal?: string;
  additionalNotes?: string;
}

export interface AiProvider {
  scoreCustomer(customer: any, activities: any[]): Promise<CustomerScoreResult>;
  draftMessage(context: DraftMessageContext): Promise<DraftMessageResult>;
  summarizeCall(rawNotes: string, customerName?: string): Promise<SummarizeCallResult>;
}
