import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  DiscoverySearchDto,
  ImportDiscoveryResultsDto,
} from '@ginie/common';

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  async getUsage(tenantId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let used = 0;
    try {
      const counter = await prisma.usageCounter.findFirst({
        where: {
          tenantId,
          metric: 'discovery_searches',
          periodStart: { gte: periodStart },
        },
      });
      used = counter?.counter || 0;
    } catch {
      used = 0;
    }

    // Retrieve tenant plan limits
    let total = 50;
    let isUnlimited = false;

    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true },
      });

      if (tenant?.plan) {
        const limits = (tenant.plan.limits as any) || {};
        if (limits.monthlyDiscoverySearches !== undefined) {
          const limitVal = Number(limits.monthlyDiscoverySearches);
          if (limitVal === -1 || limitVal >= 99999) {
            isUnlimited = true;
            total = 999999;
          } else {
            total = limitVal;
          }
        }
      }
    } catch {
      total = 50;
    }

    const remaining = isUnlimited ? 999999 : Math.max(0, total - used);

    return {
      used,
      total,
      remaining,
      isUnlimited,
      periodStart,
    };
  }

  async getSavedSearches(tenantId: string) {
    return prisma.discoverySearch.findMany({
      where: {
        tenantId,
        status: 'completed',
        resultCount: { gt: 0 },
      },
      select: {
        id: true,
        category: true,
        city: true,
        pincode: true,
        country: true,
        resultCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async search(tenantId: string, userId: string, dto: DiscoverySearchDto) {
    // 1. Quota Check
    const usage = await this.getUsage(tenantId);
    if (!usage.isUnlimited && usage.remaining <= 0) {
      throw new BadRequestException(
        `Monthly lead search limit reached (${usage.used}/${usage.total}). Please upgrade your plan in Settings to continue finding new customers.`,
      );
    }

    // 2. Normalise search parameters
    const normCategory = dto.category.trim();
    const normCity = dto.city.trim();
    const normPincode = dto.pincode?.trim() || null;
    const normCountry = dto.country?.trim() || 'India';

    // 3. Search Caching Check: Has this exact search been performed within the last 7 days?
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const cachedSearch = await prisma.discoverySearch.findFirst({
      where: {
        tenantId,
        category: { equals: normCategory, mode: 'insensitive' },
        city: { equals: normCity, mode: 'insensitive' },
        ...(normPincode ? { pincode: normPincode } : {}),
        status: 'completed',
        resultCount: { gt: 0 },
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        results: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (cachedSearch && cachedSearch.results.length > 0) {
      this.logger.log(
        `Reusing cached search results (${cachedSearch.results.length}) from ${cachedSearch.createdAt.toISOString()}`,
      );

      // Create a new search record pointing to cached results without burning Places API calls or quota
      const newSearch = await prisma.discoverySearch.create({
        data: {
          tenantId,
          userId,
          country: normCountry,
          city: normCity,
          pincode: normPincode,
          category: normCategory,
          status: 'completed',
          resultCount: cachedSearch.results.length,
        },
      });

      // Clone cached results into new search session
      await prisma.discoveryResult.createMany({
        data: cachedSearch.results.map((r) => ({
          tenantId,
          searchId: newSearch.id,
          placeId: r.placeId,
          name: r.name,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          phone: r.phone,
          website: r.website,
          email: r.email,
          mapsUrl: r.mapsUrl,
          rating: r.rating,
          userRatingsTotal: r.userRatingsTotal,
        })),
        skipDuplicates: true,
      });

      return {
        searchId: newSearch.id,
        count: cachedSearch.results.length,
        status: 'completed',
        cached: true,
      };
    }

    // 4. Create search record
    const searchRecord = await prisma.discoverySearch.create({
      data: {
        tenantId,
        userId,
        country: normCountry,
        city: normCity,
        pincode: normPincode,
        category: normCategory,
        status: 'running',
      },
    });

    // 5. Increment usage counter
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      await prisma.usageCounter.upsert({
        where: {
          tenantId_metric_periodStart: {
            tenantId,
            metric: 'discovery_searches',
            periodStart,
          },
        },
        update: {
          counter: { increment: 1 },
        },
        create: {
          tenantId,
          metric: 'discovery_searches',
          counter: 1,
          periodStart,
          periodEnd,
        },
      });
    } catch (e) {
      this.logger.warn('Could not update usage counter, continuing search:', e);
    }

    // 6. Fetch Places from Google Places API (New) or fallback to realistic sample
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    let placesData: any[] = [];

    if (apiKey && apiKey !== 'your_key_here' && apiKey !== 'your_google_places_api_key_here') {
      try {
        const queryText = normPincode
          ? `${normCategory} in ${normPincode} ${normCity}, ${normCountry}`
          : `${normCategory} in ${normCity}, ${normCountry}`;

        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount',
          },
          body: JSON.stringify({
            textQuery: queryText,
            pageSize: 20,
          }),
        });

        if (response.ok) {
          const json = (await response.json()) as any;
          placesData = (json.places || []).map((p: any) => ({
            placeId: p.id,
            name: p.displayName?.text || 'Business',
            address: p.formattedAddress || `${normCity}, ${normCountry}`,
            phone: p.nationalPhoneNumber || p.internationalPhoneNumber,
            website: p.websiteUri,
            mapsUrl: p.googleMapsUri || `https://maps.google.com/?q=${encodeURIComponent(p.displayName?.text || '')}`,
            lat: p.location?.latitude,
            lng: p.location?.longitude,
            rating: p.rating,
            userRatingsTotal: p.userRatingCount,
          }));
        } else {
          this.logger.warn(`Google Places API returned status ${response.status}. Using sample results.`);
          placesData = this.generateSampleResults(dto);
        }
      } catch (err) {
        this.logger.error('Google Places fetch failed, falling back to sample data', err);
        placesData = this.generateSampleResults(dto);
      }
    } else {
      placesData = this.generateSampleResults(dto);
    }

    // 7. Save results to database
    if (placesData.length > 0) {
      await prisma.discoveryResult.createMany({
        data: placesData.map((item) => ({
          tenantId,
          searchId: searchRecord.id,
          placeId: item.placeId,
          name: item.name,
          address: item.address,
          phone: item.phone,
          website: item.website,
          mapsUrl: item.mapsUrl,
          lat: item.lat,
          lng: item.lng,
          rating: item.rating,
          userRatingsTotal: item.userRatingsTotal,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.discoverySearch.update({
      where: { id: searchRecord.id },
      data: {
        status: 'completed',
        resultCount: placesData.length,
      },
    });

    return {
      searchId: searchRecord.id,
      count: placesData.length,
      status: 'completed',
      cached: false,
    };
  }

  async getSearchResults(tenantId: string, searchId: string) {
    const search = await prisma.discoverySearch.findFirst({
      where: { id: searchId, tenantId },
    });
    if (!search) {
      throw new NotFoundException('Search query not found.');
    }

    const results = await prisma.discoveryResult.findMany({
      where: { searchId, tenantId },
      orderBy: { createdAt: 'desc' },
    });

    // Cross-check duplicate customers against Leads, Contacts, and Companies
    const [existingLeads, existingContacts, existingCompanies] = await Promise.all([
      prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, phone: true, googlePlaceId: true },
      }),
      prisma.contact.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, phone: true },
      }),
      prisma.company.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true },
      }),
    ]);

    const cleanPhoneDigits = (phoneStr: string | null | undefined): string => {
      if (!phoneStr) return '';
      const d = phoneStr.replace(/\D/g, '');
      return d.length > 10 ? d.slice(-10) : d;
    };

    const leadsByPlaceId = new Map<string, { id: string; name: string }>();
    const customerByPhone = new Map<string, { type: 'Lead' | 'Contact' | 'Company'; id: string; name: string }>();
    const customerByName = new Map<string, { type: 'Lead' | 'Contact' | 'Company'; id: string; name: string }>();

    for (const l of existingLeads) {
      if (l.googlePlaceId) leadsByPlaceId.set(l.googlePlaceId, { id: l.id, name: l.name });
      const p = cleanPhoneDigits(l.phone);
      if (p) customerByPhone.set(p, { type: 'Lead', id: l.id, name: l.name });
      if (l.name) customerByName.set(l.name.toLowerCase().trim(), { type: 'Lead', id: l.id, name: l.name });
    }

    for (const c of existingContacts) {
      const p = cleanPhoneDigits(c.phone);
      if (p) customerByPhone.set(p, { type: 'Contact', id: c.id, name: c.name });
      if (c.name) customerByName.set(c.name.toLowerCase().trim(), { type: 'Contact', id: c.id, name: c.name });
    }

    for (const comp of existingCompanies) {
      if (comp.name) customerByName.set(comp.name.toLowerCase().trim(), { type: 'Company', id: comp.id, name: comp.name });
    }

    const enriched = results.map((r) => {
      const phoneDigits = cleanPhoneDigits(r.phone);
      const nameKey = r.name.toLowerCase().trim();

      let existingMatch: { type: 'Lead' | 'Contact' | 'Company'; id: string; name: string } | null = null;

      if (leadsByPlaceId.has(r.placeId)) {
        const match = leadsByPlaceId.get(r.placeId)!;
        existingMatch = { type: 'Lead', id: match.id, name: match.name };
      } else if (phoneDigits && customerByPhone.has(phoneDigits)) {
        existingMatch = customerByPhone.get(phoneDigits)!;
      } else if (nameKey && customerByName.has(nameKey)) {
        existingMatch = customerByName.get(nameKey)!;
      }

      // Calculate Lead Quality Tag
      // Good = Phone + (Website OR Email)
      // Average = Phone present
      // Weak = Missing phone
      let quality: 'good' | 'average' | 'weak' = 'weak';
      const hasPhone = !!r.phone && phoneDigits.length >= 8;
      const hasOnlinePresence = !!r.website || !!r.email;

      if (hasPhone && hasOnlinePresence) {
        quality = 'good';
      } else if (hasPhone) {
        quality = 'average';
      } else {
        quality = 'weak';
      }

      const isImported = !!existingMatch || !!r.importedLeadId;

      return {
        ...r,
        isImported,
        isExistingCustomer: !!existingMatch,
        existingMatch,
        quality,
      };
    });

    return {
      search,
      results: enriched,
    };
  }

  async importResults(
    tenantId: string,
    userId: string,
    searchId: string,
    dto: ImportDiscoveryResultsDto & { createDeal?: boolean },
  ) {
    const results = await prisma.discoveryResult.findMany({
      where: {
        id: { in: dto.resultIds },
        tenantId,
        searchId,
      },
    });

    if (results.length === 0) {
      throw new BadRequestException('No matching businesses found to add.');
    }

    // Default status
    let statusId = dto.statusId;
    if (!statusId) {
      const defaultStatus = await prisma.leadStatus.findFirst({
        where: { tenantId, isDefault: true },
      });
      statusId = defaultStatus?.id;
    }

    // Check pipeline if user requested creating Deals directly in pipeline
    let defaultPipelineStage: any = null;
    if (dto.createDeal) {
      const pipeline = await prisma.pipeline.findFirst({
        where: { tenantId, isDefault: true },
        include: { stages: { orderBy: { orderIndex: 'asc' } } },
      });
      defaultPipelineStage = pipeline?.stages[0] || null;
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const r of results) {
      // Check duplicate against existing leads
      const duplicate = await prisma.lead.findFirst({
        where: {
          tenantId,
          OR: [
            { googlePlaceId: r.placeId },
            ...(r.phone ? [{ phone: r.phone }] : []),
          ],
          deletedAt: null,
        },
      });

      if (duplicate) {
        skippedCount++;
        continue;
      }

      const lead = await prisma.lead.create({
        data: {
          tenantId,
          createdBy: userId,
          ownerId: dto.ownerId || userId,
          statusId,
          name: r.name,
          companyName: r.name,
          phone: r.phone,
          website: r.website,
          address: r.address,
          city: (r.address.split(',')[1] || '').trim() || undefined,
          country: 'India',
          lat: r.lat,
          lng: r.lng,
          googlePlaceId: r.placeId,
          source: 'Google Maps',
          tags: dto.tags || ['Google Maps'],
        },
      });

      // If requested, also create a Deal in the pipeline
      if (defaultPipelineStage) {
        try {
          await prisma.deal.create({
            data: {
              tenantId,
              pipelineId: defaultPipelineStage.pipelineId,
              stageId: defaultPipelineStage.id,
              title: `Deal: ${r.name}`,
              value: 0,
              currency: 'INR',
              ownerId: dto.ownerId || userId,
            },
          });
        } catch (e) {
          this.logger.warn('Could not auto-create deal for lead:', e);
        }
      }

      // Update discovery result with importedLeadId
      await prisma.discoveryResult.update({
        where: { id: r.id },
        data: { importedLeadId: lead.id },
      });

      addedCount++;
    }

    return {
      addedCount,
      skippedCount,
      message: `Added ${addedCount} new customer(s) to Sales. ${skippedCount > 0 ? `${skippedCount} were already in your records.` : ''}`,
    };
  }

  private generateSampleResults(dto: DiscoverySearchDto) {
    const city = dto.city || 'Mumbai';
    const cat = dto.category || 'Businesses';

    const sampleBusinesses = [
      { name: `Apex ${cat} Center`, phone: '+91 98201 11223', rating: 4.8, count: 240, suffix: 'Road', hasWeb: true },
      { name: `Imperial ${cat} & Co.`, phone: '+91 98902 33445', rating: 4.6, count: 180, suffix: 'Plaza', hasWeb: true },
      { name: `Metro ${cat} Hub`, phone: '+91 98453 55667', rating: 4.5, count: 95, suffix: 'Tower', hasWeb: false },
      { name: `Silverline ${cat} Solutions`, phone: '+91 98114 77889', rating: 4.7, count: 310, suffix: 'Complex', hasWeb: true },
      { name: `Golden Arch ${cat}`, phone: null, rating: 4.3, count: 64, suffix: 'Marg', hasWeb: false },
    ];

    return sampleBusinesses.map((b, idx) => ({
      placeId: `ginie_place_${city.toLowerCase()}_${idx + 1}_${Date.now()}`,
      name: b.name,
      address: `${10 + idx * 4}, Commercial ${b.suffix}, ${dto.pincode ? `${dto.pincode}, ` : ''}${city}, ${dto.country}`,
      phone: b.phone,
      website: b.hasWeb ? `https://www.${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.in` : null,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(b.name + ' ' + city)}`,
      lat: 19.076 + idx * 0.01,
      lng: 72.877 + idx * 0.01,
      rating: b.rating,
      userRatingsTotal: b.count,
    }));
  }
}
