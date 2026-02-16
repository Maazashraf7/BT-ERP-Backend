
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

    // Subscription_mangemnet
    {key:"CREATE_SUBSCRIPTION",description:"Allows creating new subscription"},
    {key:"UPDATE_SUBSCRIPTION",description:"Allows updating existing subscription"},
    {key:"VIEW_SUBSCRIPTIONS",description:"Allows viewing list of subscriptions"},
    {key:"DELETE_SUBSCRIPTION",description:"Allows deleting subscription"},
    {key:"ASSIGN_SUBSCRIPTION",description:"Allows assigning subscription to tenant"},
    {key:"UNASSIGN_SUBSCRIPTION",description:"Allows unassigning subscription from tenant"},
    {key:"VIEW_SUBSCRIPTION_HISTORY",description:"Allows viewing list of subscription history"},

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
    { key: "REMOVE_PERMISSION", description: "Allows removing permissions from roles" },


    // Permission Domain_mangemnet
    {key:"ASSIGN_PERMISSION_DOMAIN",description:"Allows assigning permissions to domain"},
    {key:"CREATE_PERMISSION_DOMAIN",description:"Allows creating new permission domain"},
    {key:"UPDATE_PERMISSION_DOMAIN",description:"Allows updating existing permission domain"},
    {key:"VIEW_PERMISSION_DOMAINS",description:"Allows viewing list of permission domains"},
    {key:"DELETE_PERMISSION_DOMAIN",description:"Allows deleting permission domain"},

    // Role_mangemnet
    {key:"CREATE_ROLE",description:"Allows creating new role"},
    {key:"UPDATE_ROLE",description:"Allows updating existing role"},
    {key:"VIEW_ROLES",description:"Allows viewing list of roles"},
    {key:"DELETE_ROLE",description:"Allows deleting role"},



    //  Sidebar_mangemnet
    {key:"CREATE_PLATFORM_SIDEBAR",description:"Allows creating new platform sidebar"},
    {key:"ASSIGN_PLATFORM_SIDEBAR",description:"Allows assigning platform sidebar to tenant"},
    {key:"VIEW_PLATFORM_SIDEBARS",description:"Allows viewing list of platform sidebars"},
    {key:"UNASSIGN_PLATFORM_SIDEBAR",description:"Allows unassigning platform sidebar from tenant"},





    // Audit_mangemnet
    {key:"VIEW_AUDIT_LOGS",description:"Allows viewing list of audit logs"},



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
