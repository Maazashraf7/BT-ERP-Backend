
import prisma from "../../../core/config/db.js";

/**
 * Platform Permissions Seeder
 */
const platformPermissions = [
    // Permission Management
    { key: "CREATE_PERMISSION", name: "Create Permissions", description: "Allows creating new platform permissions" },
    { key: "UPDATE_PERMISSION", name: "Update Permissions", description: "Allows updating existing platform permissions" },
    { key: "VIEW_PERMISSIONS", name: "View Permissions", description: "Allows viewing list of platform permissions" },
    { key: "ASSIGN_PERMISSIONS", name: "Assign Permissions", description: "Allows assigning permissions to roles" },

    // Permission Domain Management
    { key: "ASSIGN_DOMAIN", name: "Assign Domain", description: "Allows assigning domains to permissions" },
    { key: "CREATE_PERMISSION_DOMAIN", name: "Create Permission Domain", description: "Allows creating new permission domains" },
    { key: "VIEW_PERMISSION_DOMAINS", name: "View Permission Domains", description: "Allows viewing list of permission domains" },
    { key: "UPDATE_PERMISSION_DOMAIN", name: "Update Permission Domain", description: "Allows updating permission domains" },
    { key: "DELETE_PERMISSION_DOMAIN", name: "Delete Permission Domain", description: "Allows deleting permission domains" },

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
                        name: permission.name,
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
