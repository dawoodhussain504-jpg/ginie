import { Injectable } from '@nestjs/common';
import {
  AiProvider,
  DraftMessageContext,
} from './ai-provider.interface';
import {
  CustomerScoreResult,
  DraftMessageResult,
  SummarizeCallResult,
} from '@ginie/common';

@Injectable()
export class FallbackAiProvider implements AiProvider {
  async scoreCustomer(customer: any, activities: any[]): Promise<CustomerScoreResult> {
    let score = 30; // base score
    const positiveReasons: string[] = [];

    // 1. Phone available
    if (customer.phone && customer.phone.length >= 10) {
      score += 20;
      positiveReasons.push('Verified phone number available');
    }

    // 2. Email available
    if (customer.email && customer.email.includes('@')) {
      score += 15;
      positiveReasons.push('Direct email on file');
    }

    // 3. Company details
    if (customer.companyName && customer.companyName.trim().length > 2) {
      score += 10;
      positiveReasons.push('Registered company name present');
    }

    // 4. Source high-intent
    if (customer.source === 'Website Form' || customer.source === 'Referral') {
      score += 15;
      positiveReasons.push(`High direct interest from ${customer.source}`);
    }

    // 5. Activity count
    if (activities && activities.length > 0) {
      score += Math.min(activities.length * 5, 20);
      positiveReasons.push(`${activities.length} recorded interactions or follow-ups`);
    }

    // Cap at 100
    score = Math.min(score, 100);

    let category: 'Hot' | 'Warm' | 'Cold' = 'Warm';
    let suggestedAction = 'Schedule a discovery call or send an introduction over WhatsApp.';

    if (score >= 75) {
      category = 'Hot';
      suggestedAction = 'Send a price quote immediately and follow up within 2 hours.';
    } else if (score < 45) {
      category = 'Cold';
      suggestedAction = 'Send an introductory greeting and verify contact details.';
    }

    const reason = positiveReasons.length > 0
      ? `Interest evaluated based on: ${positiveReasons.join(', ')}.`
      : 'Basic contact information only. More follow-ups needed to gauge full interest.';

    return {
      score,
      category,
      reason,
      suggestedAction,
    };
  }

  async draftMessage(context: DraftMessageContext): Promise<DraftMessageResult> {
    const name = context.customerName.split(' ')[0] || 'there';
    const company = context.companyName ? ` at ${context.companyName}` : '';
    const goal = context.goal || 'following up on our previous discussion';

    let message = '';
    let subject = '';

    if (context.channel === 'whatsapp') {
      switch (context.tone) {
        case 'professional':
          message = `Hello ${name}, hope you are doing well.\n\nI am reaching out regarding ${goal}${company}. Please let us know a convenient time for a brief 5-minute conversation or if you would like us to share our proposal.\n\nBest regards,\nYour GINIE Team`;
          break;
        case 'urgent':
          message = `Hi ${name}, quick reminder regarding ${goal}. We have an active quote ready for you which is valid this week. Would you like us to confirm the booking today?\n\nLooking forward to your reply!`;
          break;
        case 'persuasive':
          message = `Hi ${name}! Businesses similar to yours have saved over 40% time after working with us. We'd love to show you how regarding ${goal}. Let us know if today or tomorrow works for a quick walkthrough!`;
          break;
        case 'friendly':
        default:
          message = `Hi ${name}, hope your week is going great!\n\nJust checking in with you regarding ${goal}. Feel free to message here whenever you get a free moment.\n\nCheers!`;
          break;
      }
    } else {
      // Email
      subject = `Quick follow-up for ${name}${company}`;
      message = `Dear ${name},\n\nI hope this email finds you well.\n\nI am writing to follow up regarding ${goal}. Based on your requirements, we have prepared our best options to support your business.\n\nCould we schedule a short 10-minute call this week at your convenience?\n\nWarm regards,\nGINIE Sales Team`;
    }

    if (context.additionalNotes) {
      message += `\n\nNote: ${context.additionalNotes}`;
    }

    return {
      subject: context.channel === 'email' ? subject : undefined,
      message,
      suggestedDelaySeconds: 15,
    };
  }

  async summarizeCall(rawNotes: string, customerName?: string): Promise<SummarizeCallResult> {
    const lower = rawNotes.toLowerCase();

    // Sentiment detection
    let sentiment: 'Positive' | 'Neutral' | 'Concerning' = 'Neutral';
    if (
      lower.includes('interested') ||
      lower.includes('ready') ||
      lower.includes('budget') ||
      lower.includes('agreed') ||
      lower.includes('good') ||
      lower.includes('happy')
    ) {
      sentiment = 'Positive';
    } else if (
      lower.includes('expensive') ||
      lower.includes('cancel') ||
      lower.includes('unhappy') ||
      lower.includes('not interested') ||
      lower.includes('complaint')
    ) {
      sentiment = 'Concerning';
    }

    // Split sentences or bullet points
    const lines = rawNotes
      .split(/[\n.;]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    const keyTakeaways = lines.slice(0, 3);
    if (keyTakeaways.length === 0) {
      keyTakeaways.push('Discussion held with customer regarding service requirements.');
    }

    const summary = `${customerName ? customerName + ': ' : ''}${keyTakeaways.join('. ')}.`;

    let nextRecommendedAction = 'Log follow-up task for next week.';
    if (sentiment === 'Positive') {
      nextRecommendedAction = 'Send official price quote and WhatsApp reminder.';
    } else if (sentiment === 'Concerning') {
      nextRecommendedAction = 'Call again to address pricing or service concerns directly.';
    }

    return {
      summary,
      sentiment,
      keyTakeaways,
      nextRecommendedAction,
    };
  }
}
