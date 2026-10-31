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

    return {
      used,
      total: 999999,
      remaining: 999999,
      isUnlimited: true,
      periodStart,
    };
  }

  async search(tenantId: string, userId: string, dto: DiscoverySearchDto) {
    // 1. Master Admin Mode: Unlimited Searches (no quota restriction)
    await this.getUsage(tenantId);

    // 2. Create search record
    const searchRecord = await prisma.discoverySearch.create({
      data: {
        tenantId,
        userId,
        country: dto.country,
        city: dto.city,
        pincode: dto.pincode,
        category: dto.category,
        status: 'running',
      },
    });

    // 3. Increment usage counter
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

    // 4. Fetch Places from Google Places API (New) or fallback to realistic mock
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    let placesData: any[] = [];

    if (apiKey && apiKey !== 'your_key_here' && apiKey !== 'your_google_places_api_key_here') {
      try {
        const queryText = dto.pincode
          ? `${dto.category} in ${dto.pincode} ${dto.city}, ${dto.country}`
          : `${dto.category} in ${dto.city}, ${dto.country}`;

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
            address: p.formattedAddress || `${dto.city}, ${dto.country}`,
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

    // 5. Save results to database
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

    // Check which ones are already imported in Leads
    const placeIds = results.map((r) => r.placeId);
    const existingLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        googlePlaceId: { in: placeIds },
        deletedAt: null,
      },
      select: { googlePlaceId: true },
    });

    const importedPlaceIds = new Set(existingLeads.map((l) => l.googlePlaceId));

    const enriched = results.map((r) => ({
      ...r,
      isImported: importedPlaceIds.has(r.placeId) || !!r.importedLeadId,
    }));

    return {
      search,
      results: enriched,
    };
  }

  async importResults(
    tenantId: string,
    userId: string,
    searchId: string,
    dto: ImportDiscoveryResultsDto,
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

    let addedCount = 0;
    let skippedCount = 0;

    for (const r of results) {
      // Check duplicate
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
      message: `Added ${addedCount} new customer(s). ${skippedCount > 0 ? `${skippedCount} were already in your list.` : ''}`,
    };
  }

  private generateSampleResults(dto: DiscoverySearchDto) {
    const city = dto.city || 'Mumbai';
    const cat = dto.category || 'Businesses';

    const sampleBusinesses = [
      { name: `Apex ${cat} Center`, phone: '+91 98201 11223', rating: 4.8, count: 240, suffix: 'Road' },
      { name: `Imperial ${cat} & Co.`, phone: '+91 98902 33445', rating: 4.6, count: 180, suffix: 'Plaza' },
      { name: `Metro ${cat} Hub`, phone: '+91 98453 55667', rating: 4.5, count: 95, suffix: 'Tower' },
      { name: `Silverline ${cat} Solutions`, phone: '+91 98114 77889', rating: 4.7, count: 310, suffix: 'Complex' },
      { name: `Golden Arch ${cat}`, phone: '+91 98335 99001', rating: 4.3, count: 64, suffix: 'Marg' },
    ];

    return sampleBusinesses.map((b, idx) => ({
      placeId: `ginie_place_${city.toLowerCase()}_${idx + 1}_${Date.now()}`,
      name: b.name,
      address: `${10 + idx * 4}, Commercial ${b.suffix}, ${dto.pincode ? `${dto.pincode}, ` : ''}${city}, ${dto.country}`,
      phone: b.phone,
      website: `https://www.${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(b.name + ' ' + city)}`,
      lat: 19.076 + idx * 0.01,
      lng: 72.877 + idx * 0.01,
      rating: b.rating,
      userRatingsTotal: b.count,
    }));
  }
}
