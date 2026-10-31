export interface UpiPaymentParams {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  currency?: string;
}

export function buildUpiUri(params: UpiPaymentParams): string {
  const { vpa, payeeName, amount, transactionNote = 'Invoice Payment', currency = 'INR' } = params;
  const cleanVpa = vpa.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(transactionNote.trim());
  const cleanAmount = Number(amount || 0).toFixed(2);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&cu=${currency}&tn=${cleanNote}`;
}

export function buildUpiQrCodeUrl(upiUri: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(upiUri)}`;
}
