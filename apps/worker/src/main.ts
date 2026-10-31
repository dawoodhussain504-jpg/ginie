import PgBoss from 'pg-boss';
import * as dotenv from 'dotenv';
import { processWebsiteCrawl, WebsiteCrawlJobData } from './jobs/website-crawler.job';
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function bootstrapWorker() {
  console.log('⚙️ Starting GINIE Background Worker (pg-boss)...');

  if (!connectionString) {
    console.warn('⚠️ No DIRECT_URL or DATABASE_URL provided. Worker running in idle standby mode.');
    return;
  }

  try {
    const boss = new PgBoss(connectionString);

    boss.on('error', (error) => {
      console.error('pg-boss error:', error);
    });

    await boss.start();
    console.log('✓ pg-boss queue initialized successfully.');

    // 1. Google Places Discovery search handler
    await boss.work('discovery.search', async (job) => {
      console.log(`[Worker] Processing discovery search job: ${job.id}`, job.data);
    });

    // 2. Website Crawler email extraction handler (Section 7.3)
    await boss.work('website.crawl', async (job) => {
      await processWebsiteCrawl(job.data as WebsiteCrawlJobData);
    });

    console.log('🚀 Worker listening for background jobs (discovery, website.crawl, whatsapp)...');

    const shutdown = async () => {
      console.log('Shutting down worker...');
      await boss.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start pg-boss worker:', err);
  }
}

bootstrapWorker();
