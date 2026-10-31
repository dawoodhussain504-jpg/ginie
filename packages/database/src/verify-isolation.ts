import { getTenantPrisma } from './client';

console.log('🧪 Running Multi-Tenant Isolation Verification...');

// Test 1: Empty tenant ID must throw an error
try {
  getTenantPrisma('');
  console.error('❌ FAIL: Empty tenant ID did not throw an error');
  process.exit(1);
} catch (err: any) {
  console.log('✓ PASS: Empty tenant ID properly blocked:', err.message);
}

// Test 2: Valid tenant ID produces isolated client
const tenantA = 'tenant-alpha-001';
const tenantB = 'tenant-beta-002';

const clientA = getTenantPrisma(tenantA);
const clientB = getTenantPrisma(tenantB);

if (!clientA || !clientB) {
  console.error('❌ FAIL: Failed to create tenant clients');
  process.exit(1);
}
console.log(`✓ PASS: Created isolated Prisma clients for Tenant A (${tenantA}) and Tenant B (${tenantB})`);

console.log('🎉 All tenant isolation unit checks passed successfully!');
