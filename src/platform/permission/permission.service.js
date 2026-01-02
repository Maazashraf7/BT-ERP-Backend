import prisma from "../../core/config/db.js";

/* ---------------- CREATE ---------------- */

export const createPermission = async (data) => {
  return prisma.permission.create({ data });
};

export const createPermissionsBulk = async (permissions) => {
  return prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });
};

/* ---------------- READ ---------------- */

export const listPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: [{ domain: "asc" }, { action: "asc" }],
  });
};

export const getPermissionById = async (id) => {
  return prisma.permission.findUnique({ where: { id } });
};

/* ---------------- UPDATE ---------------- */

export const updatePermission = async (id, data) => {
  return prisma.permission.update({
    where: { id },
    data,
  });
};

/* ---------------- DELETE ---------------- */

export const deletePermission = async (id) => {
  const used = await prisma.rolePermission.findFirst({
    where: { permissionId: id },
  });

  if (used) {
    throw new Error("Permission is assigned to roles");
  }

  return prisma.permission.delete({ where: { id } });
};

/* ---------------- GROUPED FOR UI ---------------- */

export const getGroupedPermissions = async () => {
  const permissions = await prisma.permission.findMany();

  const groups = {};
  for (const p of permissions) {
    const key = p.domain;
    if (!groups[key]) {
      groups[key] = {
        label: key,
        moduleKey: p.moduleKey,
        permissions: [],
      };
    }

    groups[key].permissions.push({
      id: p.id,
      key: p.key,
      action: p.action,
    });
  }

  return Object.values(groups);
};
