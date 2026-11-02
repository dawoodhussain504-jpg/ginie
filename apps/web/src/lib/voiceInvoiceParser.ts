/**
 * Smart Voice-to-Invoice Dictation Parser for Indian MSME / Retail & Services
 * Extracts: customerName, itemName, quantity, price, taxRate from spoken Hindi / English sentences.
 */

export interface ParsedVoiceInvoice {
  rawTranscript: string;
  customerName?: string;
  customerPhone?: string;
  itemName?: string;
  quantity?: number;
  price?: number;
  taxRate?: number;
  confidence: number;
}

export function parseVoiceInvoiceText(text: string): ParsedVoiceInvoice {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  let customerName: string | undefined;
  let customerPhone: string | undefined;
  let itemName: string | undefined;
  let quantity = 1;
  let price: number | undefined;
  let taxRate = 18;

  // 1. Phone number detection (10 digits)
  const phoneMatch = clean.match(/(?:phone|mobile|number|no)?\s*([6-9]\d{9})/i);
  if (phoneMatch) {
    customerPhone = phoneMatch[1];
  }

  // 2. Tax rate detection (e.g., 5%, 12%, 18%, 28% GST)
  const taxMatch = lower.match(/(\d{1,2})\s*(?:%|percent|pratishat)?\s*(?:gst|tax)/i);
  if (taxMatch) {
    const val = parseInt(taxMatch[1], 10);
    if ([0, 5, 12, 18, 28].includes(val)) {
      taxRate = val;
    }
  }

  // 3. Price detection (e.g., rate 500, price 1200, 500 rupaye, rs 500, 500 inr, ka 400)
  const pricePatterns = [
    /(?:rate|price|amount|bhav|daam|cost)\s*(?:is|hai|ke|pe|at|of)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees|rupaye|rs|inr|\/-)/i,
    /(?:total|kul)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  ];

  for (const pat of pricePatterns) {
    const m = clean.match(pat);
    if (m && m[1]) {
      price = parseFloat(m[1].replace(/,/g, ''));
      break;
    }
  }

  // 4. Quantity detection (e.g. 5 pieces, 2 kg, 10 box, 3 packet, or number before item)
  const qtyPatterns = [
    /(\d+)\s*(?:piece|pieces|pcs|qty|quantity|nag|bory|bori|bag|bags|box|boxes|kg|kilo|litre|ltr|meter|ghante|hour)/i,
    /(?:quantity|qty|nag|number)\s*(?:is|hai)?\s*(\d+)/i,
  ];

  for (const pat of qtyPatterns) {
    const m = clean.match(pat);
    if (m && m[1]) {
      quantity = parseInt(m[1], 10);
      break;
    }
  }

  // 5. Customer name detection
  // Patterns like: "bill for Rajesh Sharma", "to Ramesh", "Ramesh ko 2 packet...", "client Amit Patel"
  const customerPatterns = [
    /(?:bill\s+for|customer|client|naam|name|ko\s+dena\s+hai|to)\s+([a-zA-Z\u0900-\u097F]+(?:\s+[a-zA-Z\u0900-\u097F]+)?)/i,
    /^([a-zA-Z\u0900-\u097F]+(?:\s+[a-zA-Z\u0900-\u097F]+)?)\s+(?:ko|ke\s+liye|ka\s+bill)/i,
  ];

  for (const pat of customerPatterns) {
    const m = clean.match(pat);
    if (m && m[1]) {
      const candidate = m[1].trim();
      const forbidden = ['bill', 'invoice', 'gst', 'item', 'product', 'new', 'rate', 'price', 'rupaye'];
      if (!forbidden.includes(candidate.toLowerCase())) {
        customerName = candidate;
        break;
      }
    }
  }

  // If no customer name found yet, check if first word looks like a name
  if (!customerName) {
    const tokens = clean.split(/\s+/);
    if (tokens.length >= 3 && isNaN(Number(tokens[0]))) {
      const first = tokens[0];
      const second = tokens[1];
      const skipKeywords = ['create', 'make', 'generate', 'add', 'nayi', 'naya', 'ek', 'invoice', 'bill', 'item'];
      if (!skipKeywords.includes(first.toLowerCase())) {
        if (tokens.length > 3 && !isNaN(Number(tokens[2])) && !skipKeywords.includes(second.toLowerCase())) {
          customerName = `${first} ${second}`;
        } else {
          customerName = first;
        }
      }
    }
  }

  // 6. Item Name extraction
  // Remove known words from string to get item name
  let remainder = clean;
  if (customerName) {
    remainder = remainder.replace(new RegExp(`\\b${customerName}\\b`, 'i'), '');
  }
  if (customerPhone) {
    remainder = remainder.replace(customerPhone, '');
  }
  if (price !== undefined) {
    remainder = remainder.replace(new RegExp(`(?:rate|price|bhav|daam|rs|rupaye|rupees)?\\s*₹?\\s*${price}\\b`, 'i'), '');
  }
  // Remove common stop words
  remainder = remainder
    .replace(/(?:bill|invoice|for|to|ko|ka|ke|liye|rate|price|rupaye|rupees|rs|inr|gst|tax|percent|%)[\s:]*/gi, ' ')
    .replace(/\b\d+\s*(?:piece|pieces|pcs|qty|nag|bori|bag|bags|box|kg|ltr)?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (remainder.length > 2) {
    // Capitalize first letter
    itemName = remainder.charAt(0).toUpperCase() + remainder.slice(1);
  } else {
    itemName = 'General Goods / Services';
  }

  // If price wasn't found via keywords, find any isolated number that isn't phone or qty
  if (!price) {
    const numbers = clean.match(/\b\d+(\.\d+)?\b/g);
    if (numbers) {
      for (const numStr of numbers) {
        const val = parseFloat(numStr);
        if (val !== quantity && (!customerPhone || !customerPhone.includes(numStr)) && val > 10) {
          price = val;
          break;
        }
      }
    }
  }

  return {
    rawTranscript: clean,
    customerName: customerName || 'Walk-in Customer',
    customerPhone,
    itemName: itemName || 'General Merchandise',
    quantity: quantity || 1,
    price: price || 1000,
    taxRate,
    confidence: customerName && price ? 0.95 : 0.75,
  };
}
