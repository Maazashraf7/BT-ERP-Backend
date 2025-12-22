import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";
import { signSuperAdminToken } from "../../core/utils/jwt.js";

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Super Admin = platform-level user (no tenant)
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: null,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signSuperAdminToken({
      userId: user.id,
      role: "SUPER_ADMIN",
    });

    res.json({
      success: true,
      message: "Welcome to the School-Management API 🚀",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Super admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
