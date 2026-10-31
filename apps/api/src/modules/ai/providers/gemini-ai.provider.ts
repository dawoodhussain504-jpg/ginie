import { Injectable, Logger } from '@nestjs/common';
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
export class GeminiAiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_key_here';
  }

  async scoreCustomer(customer: any, activities: any[]): Promise<CustomerScoreResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze this business lead and evaluate their purchasing interest score (0-100) and category (Hot, Warm, or Cold).
Customer Name: ${customer.name}
Company: ${customer.companyName || 'N/A'}
Phone: ${customer.phone || 'N/A'}
Email: ${customer.email || 'N/A'}
City: ${customer.city || 'N/A'}
Source: ${customer.source || 'N/A'}
Recent interactions count: ${activities.length}

Respond in strict JSON format:
{
  "score": number between 0 and 100,
  "category": "Hot" | "Warm" | "Cold",
  "reason": "1-2 short sentences explaining why",
  "suggestedAction": "recommended next step"
}`;

    const text = await this.callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from Gemini');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 60)),
      category: parsed.category === 'Hot' || parsed.category === 'Cold' ? parsed.category : 'Warm',
      reason: parsed.reason || 'Evaluated by Gemini AI based on lead profile.',
      suggestedAction: parsed.suggestedAction || 'Reach out on WhatsApp.',
    };
  }

  async draftMessage(context: DraftMessageContext): Promise<DraftMessageResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are an executive sales copilot. Draft a high-converting ${context.channel} message for a customer.
Recipient Name: ${context.customerName}
Company Name: ${context.companyName || 'their business'}
Tone: ${context.tone} (e.g. friendly, professional, urgent, persuasive)
Goal: ${context.goal || 'following up on partnership opportunities'}
Additional Context: ${context.additionalNotes || 'N/A'}

Rules:
- Write in clean, conversational Indian business English (or mixed natural Hinglish if casual).
- No emojis if strictly professional, or at most 1 subtle emoji if friendly.
- Keep it concise (under 75 words).
- End with a low-friction question or clear call to action.

Return only the drafted message text.`;

    const text = await this.callGemini(prompt);
    return {
      message: text.trim(),
      suggestedDelaySeconds: 45,
      tone: context.tone,
      channel: context.channel,
    };
  }

  async summarizeCall(rawNotes: string, customerName?: string): Promise<SummarizeCallResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Summarize these business call/meeting notes for customer "${customerName || 'Client'}".
Raw Notes:
"""
${rawNotes}
"""

Respond in strict JSON format:
{
  "summary": "2-3 sentences executive summary",
  "sentiment": "Positive" | "Neutral" | "Concerning",
  "keyTakeaways": ["point 1", "point 2"],
  "nextRecommendedAction": "clear actionable next step"
}`;

    const text = await this.callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from Gemini');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || rawNotes,
      sentiment: parsed.sentiment || 'Positive',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [rawNotes],
      nextRecommendedAction: parsed.nextRecommendedAction || 'Follow up within 48 hours.',
    };
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Gemini API call failed: ${err}`);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = (await res.json()) as any;
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('Empty response from Gemini');
    return candidate;
  }
}
