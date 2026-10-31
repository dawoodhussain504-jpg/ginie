import { prisma } from '@ginie/database';

export interface WebsiteCrawlJobData {
  tenantId: string;
  leadId: string;
  websiteUrl: string;
}

export async function processWebsiteCrawl(jobData: WebsiteCrawlJobData) {
  const { tenantId, leadId, websiteUrl } = jobData;
  console.log(`[Crawler] Starting email extraction for: ${websiteUrl} (Lead ID: ${leadId})`);

  let normalizedUrl = websiteUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const targetPages = [
    normalizedUrl,
    `${normalizedUrl.replace(/\/$/, '')}/contact`,
    `${normalizedUrl.replace(/\/$/, '')}/contact-us`,
    `${normalizedUrl.replace(/\/$/, '')}/about`,
  ];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const discoveredEmails = new Set<string>();

  for (const pageUrl of targetPages.slice(0, 4)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(pageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GinieBot/1.0 (+https://ginie.space; bot@ginie.space)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        const matches = html.match(emailRegex);
        if (matches) {
          for (const email of matches) {
            const clean = email.toLowerCase().trim();
            // Filter out common image extensions or junk matches
            if (!clean.endsWith('.png') && !clean.endsWith('.jpg') && !clean.endsWith('.svg') && !clean.includes('example.com')) {
              discoveredEmails.add(clean);
            }
          }
        }
      }
    } catch {
      // Continue to next page gracefully
    }
  }

  const foundList = Array.from(discoveredEmails);
  if (foundList.length > 0) {
    const primaryEmail = foundList[0];
    console.log(`✓ [Crawler] Discovered public email for ${websiteUrl}: ${primaryEmail}`);

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        email: primaryEmail,
        source: 'Website Crawl',
      },
    });

    await prisma.activity.create({
      data: {
        tenantId,
        entityType: 'lead',
        entityId: leadId,
        type: 'note',
        content: `Discovered public email (${primaryEmail}) from business website ${websiteUrl}.`,
      },
    });
  } else {
    console.log(`ℹ️ [Crawler] No public emails found on ${websiteUrl}.`);
  }
}
