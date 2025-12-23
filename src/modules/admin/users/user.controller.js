import prisma from "../../../core/config/db.js";
import bcrypt from "bcryptjs";

/**
 * TENANT ADMIN
 * Create user
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, roleId } = req.body;
    const tenantId = req.user.tenantId;

    if (!email || !password || !roleId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        tenantId,
        roleId,
      },
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};
