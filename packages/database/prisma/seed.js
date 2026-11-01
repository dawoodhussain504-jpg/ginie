"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting GINIE database seeding...');
    // 1. Create or ensure Plans
    const freePlan = await prisma.plan.upsert({
        where: { name: 'Free' },
        update: {},
        create: {
            name: 'Free',
            monthlyPrice: 0,
            limits: {
                maxUsers: 2,
                maxLeads: 500,
                monthlyDiscoverySearches: 50,
            },
        },
    });
    const proPlan = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: {
            name: 'Pro',
            monthlyPrice: 2999,
            limits: {
                maxUsers: 10,
                maxLeads: 10000,
                monthlyDiscoverySearches: 500,
            },
        },
    });
    // 2. Create Demo Tenant (Company)
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'acme' },
        update: {},
        create: {
            name: 'Acme Enterprises',
            slug: 'acme',
            brandColor: '#1677ff',
            planId: proPlan.id,
            status: 'active',
            settings: {
                currency: 'INR',
                timezone: 'Asia/Kolkata',
            },
        },
    });
    console.log(`✓ Tenant created: ${tenant.name} (${tenant.id})`);
    // 3. Create Standard Roles
    const ownerRole = await prisma.role.upsert({
        where: {
            tenantId_name: {
                tenantId: tenant.id,
                name: 'Owner',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Owner',
            isSystem: true,
            permissions: {
                leads: { view: true, create: true, edit: true, delete: true, export: true },
                deals: { view: true, create: true, edit: true, delete: true, export: true },
                contacts: { view: true, create: true, edit: true, delete: true, export: true },
                tasks: { view: true, create: true, edit: true, delete: true, export: true },
                discovery: { view: true, search: true, import: true },
                settings: { view: true, edit: true },
            },
        },
    });
    await prisma.role.upsert({
        where: {
            tenantId_name: {
                tenantId: tenant.id,
                name: 'Sales Executive',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Sales Executive',
            isSystem: true,
            permissions: {
                leads: { view: true, create: true, edit: true, delete: false, export: false },
                deals: { view: true, create: true, edit: true, delete: false, export: false },
                contacts: { view: true, create: true, edit: true, delete: false, export: false },
                tasks: { view: true, create: true, edit: true, delete: false, export: false },
                discovery: { view: true, search: true, import: true },
                settings: { view: false, edit: false },
            },
        },
    });
    // 4. Create Owner User (Super Admin for the platform - Dawood Hussain)
    const passwordHash = await bcrypt.hash('Daw00d@3210', 10);
    const adminUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'dawoodhussain504@gmail.com',
            },
        },
        update: {
            isSuperAdmin: true,
            name: 'Dawood Hussain',
            phone: '+91 8797186001',
            passwordHash,
        },
        create: {
            tenantId: tenant.id,
            roleId: ownerRole.id,
            name: 'Dawood Hussain',
            email: 'dawoodhussain504@gmail.com',
            phone: '+91 8797186001',
            passwordHash,
            isSuperAdmin: true,
            status: 'active',
            language: 'en',
        },
    });
    console.log(`✓ Super Admin created: ${adminUser.email} / Daw00d@3210 / +91 8797186001 (Super Admin: true)`);
    // Explicitly ensure old demo admin does not have super admin rights
    await prisma.user.updateMany({
        where: { email: 'admin@ginie.space' },
        data: { isSuperAdmin: false },
    }).catch(() => {});
    // 5. Create Default Lead Statuses
    const statuses = [
        { name: 'New', color: '#1677ff', orderIndex: 0, isDefault: true },
        { name: 'Contacted', color: '#faad14', orderIndex: 1, isDefault: false },
        { name: 'Qualified', color: '#52c41a', orderIndex: 2, isDefault: false },
        { name: 'Proposal Sent', color: '#722ed1', orderIndex: 3, isDefault: false },
        { name: 'Won', color: '#52c41a', orderIndex: 4, isDefault: false },
        { name: 'Lost', color: '#ff4d4f', orderIndex: 5, isDefault: false },
    ];
    const createdStatuses = {};
    for (const s of statuses) {
        const statusRecord = await prisma.leadStatus.upsert({
            where: {
                tenantId_name: {
                    tenantId: tenant.id,
                    name: s.name,
                },
            },
            update: {},
            create: {
                tenantId: tenant.id,
                name: s.name,
                color: s.color,
                orderIndex: s.orderIndex,
                isDefault: s.isDefault,
            },
        });
        createdStatuses[s.name] = statusRecord.id;
    }
    // 6. Create Sales Pipeline & Stages
    const pipeline = await prisma.pipeline.create({
        data: {
            tenantId: tenant.id,
            name: 'Standard Sales Pipeline',
            isDefault: true,
            stages: {
                create: [
                    { tenantId: tenant.id, name: 'Prospect', probability: 10, orderIndex: 0, color: '#1677ff' },
                    { tenantId: tenant.id, name: 'Qualified', probability: 30, orderIndex: 1, color: '#faad14' },
                    { tenantId: tenant.id, name: 'Proposal Sent', probability: 60, orderIndex: 2, color: '#722ed1' },
                    { tenantId: tenant.id, name: 'Negotiation', probability: 80, orderIndex: 3, color: '#13c2c2' },
                    { tenantId: tenant.id, name: 'Closed Won', probability: 100, orderIndex: 4, color: '#52c41a' },
                    { tenantId: tenant.id, name: 'Closed Lost', probability: 0, orderIndex: 5, color: '#ff4d4f' },
                ],
            },
        },
        include: { stages: true },
    });
    // 7. Seed Sample Potential Customers (Leads)
    const sampleLeads = [
        {
            name: 'Dr. Vivek Mehra',
            companyName: 'Apex Healthcare Solutions',
            phone: '+91 9820011223',
            email: 'dr.vivek@apexhealth.in',
            website: 'https://apexhealth.in',
            address: 'Shop 4, Linking Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400050',
            source: 'Google Maps',
            statusId: createdStatuses['Proposal Sent'],
            ownerId: adminUser.id,
            score: 85,
            tags: ['Healthcare', 'High Value'],
        },
        {
            name: 'Ananya Deshmukh',
            companyName: 'Metro Infra Developers',
            phone: '+91 9890044556',
            email: 'sales@metroinfra.co.in',
            website: 'https://metroinfra.co.in',
            address: 'Tower B, FC Road, Shivajinagar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411005',
            source: 'Direct',
            statusId: createdStatuses['Qualified'],
            ownerId: adminUser.id,
            score: 70,
            tags: ['Real Estate', 'Commercial'],
        },
        {
            name: 'Rohan Nambiar',
            companyName: 'Craft Coffee Roasters',
            phone: '+91 9845077889',
            email: 'hello@craftcoffee.in',
            website: 'https://craftcoffee.in',
            address: '12th Main, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            country: 'India',
            pincode: '560038',
            source: 'Google Maps',
            statusId: createdStatuses['New'],
            ownerId: adminUser.id,
            score: 50,
            tags: ['F&B', 'Retail'],
        },
    ];
    for (const leadData of sampleLeads) {
        const lead = await prisma.lead.create({
            data: {
                tenantId: tenant.id,
                ...leadData,
                createdBy: adminUser.id,
            },
        });
        // Add activity timeline
        await prisma.activity.create({
            data: {
                tenantId: tenant.id,
                userId: adminUser.id,
                entityType: 'lead',
                entityId: lead.id,
                type: 'note',
                content: `Initial discovery and profile created for ${lead.companyName}.`,
            },
        });
    }
    // 8. Seed Sample Deals
    const proposalStage = pipeline.stages.find((s) => s.name === 'Proposal Sent') || pipeline.stages[2];
    const negotiationStage = pipeline.stages.find((s) => s.name === 'Negotiation') || pipeline.stages[3];
    await prisma.deal.create({
        data: {
            tenantId: tenant.id,
            pipelineId: pipeline.id,
            stageId: proposalStage.id,
            ownerId: adminUser.id,
            title: 'Apex Healthcare Equipment Supply',
            value: 450000,
            currency: 'INR',
            status: 'open',
        },
    });
    await prisma.deal.create({
        data: {
            tenantId: tenant.id,
            pipelineId: pipeline.id,
            stageId: negotiationStage.id,
            ownerId: adminUser.id,
            title: 'Metro Infra Commercial Office Setup',
            value: 1250000,
            currency: 'INR',
            status: 'open',
        },
    });
    // 9. Seed Sample Tasks
    await prisma.task.create({
        data: {
            tenantId: tenant.id,
            title: 'Follow up with Apex Healthcare on proposal',
            description: 'Discuss discount terms and delivery schedule for medical supplies.',
            priority: 'high',
            status: 'pending',
            assigneeId: adminUser.id,
            dueAt: new Date(),
        },
    });
    await prisma.task.create({
        data: {
            tenantId: tenant.id,
            title: 'Prepare revised quote for Metro Infra',
            description: 'Send revised tax breakdown including GST to finance team.',
            priority: 'medium',
            status: 'pending',
            assigneeId: adminUser.id,
            dueAt: new Date(Date.now() + 86400000), // Tomorrow
        },
    });
    // 10. Seed Sample Discovery Search & Results
    const sampleSearch = await prisma.discoverySearch.create({
        data: {
            tenantId: tenant.id,
            userId: adminUser.id,
            country: 'India',
            city: 'Mumbai',
            pincode: '400001',
            category: 'Diagnostic Clinics',
            status: 'completed',
            resultCount: 3,
        },
    });
    await prisma.discoveryResult.createMany({
        data: [
            {
                tenantId: tenant.id,
                searchId: sampleSearch.id,
                placeId: 'ChIJ_sample_place_01',
                name: 'Fortis Diagnostic Centre Fort',
                address: '15, Horniman Circle, Fort, Mumbai, Maharashtra 400001',
                phone: '+91 22 2266 1234',
                website: 'https://fortishealthcare.com',
                email: 'info@fortishealthcare.com',
                mapsUrl: 'https://maps.google.com/?q=Fortis+Diagnostic+Fort',
                rating: 4.6,
                userRatingsTotal: 340,
            },
            {
                tenantId: tenant.id,
                searchId: sampleSearch.id,
                placeId: 'ChIJ_sample_place_02',
                name: 'Metropolis Healthcare Lab',
                address: 'Ground Floor, Nariman Point, Mumbai, Maharashtra 400021',
                phone: '+91 22 2288 5678',
                website: 'https://metropolisindia.com',
                email: 'support@metropolisindia.com',
                mapsUrl: 'https://maps.google.com/?q=Metropolis+Healthcare',
                rating: 4.4,
                userRatingsTotal: 185,
            },
            {
                tenantId: tenant.id,
                searchId: sampleSearch.id,
                placeId: 'ChIJ_sample_place_03',
                name: 'Apollo Clinic & Diagnostics',
                address: 'Marine Drive, Churchgate, Mumbai, Maharashtra 400020',
                phone: '+91 22 2204 9090',
                website: 'https://apolloclinic.com',
                email: 'contact@apolloclinic.com',
                mapsUrl: 'https://maps.google.com/?q=Apollo+Clinic+Marine+Drive',
                rating: 4.7,
                userRatingsTotal: 520,
            },
        ],
    });
    console.log('✓ Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map