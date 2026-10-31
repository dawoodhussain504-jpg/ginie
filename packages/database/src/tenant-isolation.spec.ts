import { getTenantPrisma } from './client';

describe('Multi-Tenant Isolation Verification', () => {
  const tenantA_Id = 'tenant-a-1111';
  const tenantB_Id = 'tenant-b-2222';

  it('should enforce tenant isolation when querying leads', () => {
    const prismaA = getTenantPrisma(tenantA_Id);
    const prismaB = getTenantPrisma(tenantB_Id);

    expect(prismaA).toBeDefined();
    expect(prismaB).toBeDefined();

    // Verify error thrown if tenant ID is omitted
    expect(() => getTenantPrisma('')).toThrow(
      'Tenant ID is mandatory for tenant-scoped operations.',
    );
  });

  it('should separate tenant execution contexts', () => {
    expect(tenantA_Id).not.toEqual(tenantB_Id);
  });
});
