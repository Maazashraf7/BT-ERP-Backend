
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking PlatformPermissionDomain...');
    try {
        const platformDomains = await prisma.platformPermissionDomain.findMany();
        console.log('PlatformPermissionDomain found:', platformDomains.length);
    } catch (e) {
        console.error('Error finding PlatformPermissionDomain:', e.message);
    }

    console.log('Checking TenantPermissionDomain...');
    try {
        const tenantDomains = await prisma.tenantPermissionDomain.findMany();
        console.log('TenantPermissionDomain found:', tenantDomains.length);
    } catch (e) {
        console.error('Error finding TenantPermissionDomain:', e.message);
    }

    console.log('Checking PlatformManagement...');
    try {
        const platformManagement = await prisma.platformManagement.findMany();
        console.log('PlatformManagement found:', platformManagement.length);
    } catch (e) {
        console.error('Error finding PlatformManagement:', e.message);
    }
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
