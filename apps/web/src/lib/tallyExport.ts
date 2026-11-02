/**
 * Tally Prime XML and Daybook CSV Export Utility
 * Conforms to standard Tally XML DTD format for Sales Vouchers
 */

export interface InvoiceExportItem {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  dueDate?: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: string;
  paidAt?: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
  items?: Array<{
    name?: string;
    hsn?: string;
    price?: number;
    quantity?: number;
    taxRate?: number;
    isInterState?: boolean;
  }>;
}

/**
 * Clean XML characters to prevent parsing errors in Tally Prime
 */
function escapeXml(str: string | number | undefined | null): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format Date to Tally standard YYYYMMDD
 */
function formatTallyDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '20260401';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  } catch {
    return '20260401';
  }
}

/**
 * Generate Tally Prime XML for Sales Vouchers
 */
export function generateTallySalesXml(invoices: InvoiceExportItem[], companyName = 'GINIE ENTERPRISE'): string {
  let vouchersXml = '';

  for (const inv of invoices) {
    const dateFormatted = formatTallyDate(inv.createdAt);
    const voucherNumber = escapeXml(inv.invoiceNumber);
    const partyName = escapeXml(inv.contact?.name || 'Cash / Retail Customer');
    const totalAmount = Math.abs(Number(inv.total || 0)).toFixed(2);
    const taxableSubtotal = Math.abs(Number(inv.subtotal || 0)).toFixed(2);
    const taxTotal = Math.abs(Number(inv.taxTotal || 0)).toFixed(2);
    const halfTax = (Number(taxTotal) / 2).toFixed(2);

    const isInterState = inv.items?.some((i) => i.isInterState);

    vouchersXml += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
          <DATE>${dateFormatted}</DATE>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
          <REFERENCE>${voucherNumber}</REFERENCE>
          <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
          <PARTYNAME>${partyName}</PARTYNAME>
          <BASICBUYERNAME>${partyName}</BASICBUYERNAME>
          <NARRATION>Tax Invoice ${voucherNumber} generated via GINIE Space ERP</NARRATION>

          <!-- Party Debit Entry (Total Invoice Amount) -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${partyName}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${totalAmount}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>

          <!-- Sales Account Credit Entry -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales Account</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${taxableSubtotal}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
`;

    if (Number(taxTotal) > 0) {
      if (isInterState) {
        vouchersXml += `
          <!-- Output IGST Credit -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output IGST</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${taxTotal}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
`;
      } else {
        vouchersXml += `
          <!-- Output CGST Credit -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output CGST</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${halfTax}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>

          <!-- Output SGST Credit -->
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output SGST</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${halfTax}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
`;
      }
    }

    vouchersXml += `
        </VOUCHER>
      </TALLYMESSAGE>
`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Generate standard Daybook CSV for Accounting
 */
export function generateDaybookCsv(invoices: InvoiceExportItem[]): string {
  const headers = [
    'Date',
    'Invoice Number',
    'Party / Customer Name',
    'Phone',
    'Taxable Subtotal (INR)',
    'GST Tax Total (INR)',
    'Grand Total (INR)',
    'Status',
    'Due Date',
    'Items Summary',
  ];

  const rows = invoices.map((inv) => {
    const date = inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '';
    const invoiceNum = `"${(inv.invoiceNumber || '').replace(/"/g, '""')}"`;
    const party = `"${(inv.contact?.name || 'Walk-in Customer').replace(/"/g, '""')}"`;
    const phone = `"${(inv.contact?.phone || '').replace(/"/g, '""')}"`;
    const subtotal = Number(inv.subtotal || 0).toFixed(2);
    const tax = Number(inv.taxTotal || 0).toFixed(2);
    const total = Number(inv.total || 0).toFixed(2);
    const status = inv.status ? inv.status.toUpperCase() : 'UNPAID';
    const dueDate = inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '';
    const itemsSummary = `"${(inv.items?.map((i) => `${i.name || 'Item'} (x${i.quantity || 1})`).join('; ') || '').replace(/"/g, '""')}"`;

    return [date, invoiceNum, party, phone, subtotal, tax, total, status, dueDate, itemsSummary].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
