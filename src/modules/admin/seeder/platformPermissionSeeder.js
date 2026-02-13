
import prisma from "../../../core/config/db.js";

/**
 * Platform Permissions Seeder
 */
const platformPermissions = [
    //  Tenant_mangemnet
    {key:"CREATE_TENANT",description:"Allows creating new tenant"},
    {key:"UPDATE_TENANT",description:"Allows updating existing tenant"},
    {key:"VIEW_TENANTS",description:"Allows viewing list of tenants"},
    {key:"DELETE_TENANT",description:"Allows deleting tenant"},

    //  Staff_mangemnet
    {key:"CREATE_STAFF",description:"Allows creating new staff"},
    {key:"UPDATE_STAFF",description:"Allows updating existing staff"},
    {key:"VIEW_STAFF",description:"Allows viewing list of staff"},
    {key:"DELETE_STAFF",description:"Allows deleting staff"},



    // Permission Management
    { key: "CREATE_PERMISSION", description: "Allows creating new platform permissions" },
    { key: "UPDATE_PERMISSION", description: "Allows updating existing platform permissions" },
    { key: "VIEW_PERMISSIONS", description: "Allows viewing list of platform permissions" },
    { key: "ASSIGN_PERMISSIONS", description: "Allows assigning permissions to roles" },

    // Permission Domain Management
    { key: "ASSIGN_DOMAIN", description: "Allows assigning domains to permissions" },
    { key: "CREATE_PERMISSION_DOMAIN", description: "Allows creating new permission domains" },
    { key: "VIEW_PERMISSION_DOMAINS", description: "Allows viewing list of permission domains" },
    { key: "UPDATE_PERMISSION_DOMAIN", description: "Allows updating permission domains" },
    { key: "DELETE_PERMISSION_DOMAIN", description: "Allows deleting permission domains" },

    // Add other permissions here as needed...
];

export const seedPlatformPermissions = async () => {
    console.log("🌱 Seeding Platform Permissions...");

    try {
        for (const permission of platformPermissions) {
            const existing = await prisma.platformPermission.findUnique({
                where: { key: permission.key },
            });

            if (!existing) {
                await prisma.platformPermission.create({
                    data: {
                        key: permission.key,
                        description: permission.description,
                    },
                });
                console.log(`✅ Created permission: ${permission.key}`);
            } else {
                console.log(`⏩ Permission already exists: ${permission.key}`);
            }
        }
        console.log("✨ Platform Permissions seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error seeding Platform Permissions:", error);
    }
};

// If run directly
if (process.argv[1] === import.meta.url.replace("file://", "")) { // check if executed directly (ESM way is tricky, usually handled by separate script)
    // seedPlatformPermissions(); 
}

export default seedPlatformPermissions;
