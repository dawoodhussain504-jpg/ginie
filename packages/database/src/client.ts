import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Creates a tenant-scoped Prisma client extension that automatically:
 * 1. Appends `where: { tenantId }` to all findMany, findFirst, update, delete, and count operations.
 * 2. Injects `data: { tenantId }` into all create operations.
 */
export function getTenantPrisma(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is mandatory for tenant-scoped operations.');
  }

  return prisma.$extends({
    query: {
      lead: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId, deletedAt: null } as any;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId, deletedAt: null } as any;
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId, deletedAt: null } as any;
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId } as any;
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId } as any;
          return query(args);
        },
      },
      deal: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId, deletedAt: null } as any;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId, deletedAt: null } as any;
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId } as any;
          return query(args);
        },
      },
      task: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId } as any;
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId } as any;
          return query(args);
        },
      },
      activity: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId } as any;
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId } as any;
          return query(args);
        },
      },
      discoverySearch: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId } as any;
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId } as any;
          return query(args);
        },
      },
      discoveryResult: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId } as any;
          return query(args);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>;
export default prisma;
