import prisma from "../../core/config/db.js";

import {
  VALID_ACTIONS,
  VALID_DOMAINS,
  VALID_MODULE_KEYS,
} from "./permission.constants.js";

import * as service from "./permission.service.js";

/* CREATE */

export const createPermission = async (req, res) => {
  const permission = await service.createPermission(req.body);
  res.json({ success: true, permission });
};

export const bulkCreatePermissions = async (req, res) => {
  const result = await service.createPermissionsBulk(req.body.permissions);
  res.json({ success: true, result });
};

/* READ */

export const listPermissions = async (req, res) => {
  const permissions = await service.listPermissions();
  res.json({ success: true, permissions });
};

export const groupedPermissions = async (req, res) => {
  const groups = await service.getGroupedPermissions();
  res.json({ success: true, groups });
};

/* UPDATE */

export const updatePermission = async (req, res) => {
  const permission = await service.updatePermission(
    req.params.id,
    req.body
  );
  res.json({ success: true, permission });
};

/* DELETE */

export const deletePermission = async (req, res) => {
  try {
    await service.deletePermission(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};
