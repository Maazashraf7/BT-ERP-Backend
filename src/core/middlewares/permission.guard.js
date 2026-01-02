export const requirePermission = (perm) => (req, res, next) => {
  if (!req.user.permissions.includes(perm))
    return res.status(403).json({ message: "Forbidden" });
  next();
};
