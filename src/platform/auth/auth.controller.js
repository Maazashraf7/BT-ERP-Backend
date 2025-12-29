import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";
import { signSuperAdminToken } from "../../core/utils/jwt.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find Super Admin
    const admin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    // Record login attempt helper
    const recordAttempt = async (success, reason) => {
      await prisma.loginAttempt.create({
        data: {
          actorType: "SUPER_ADMIN",
          superAdminId: admin?.id,
          email,
          success,
          reason,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
    };

    if (!admin || !admin.isActive) {
      await recordAttempt(false, "INVALID_EMAIL");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Check lock status
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      await recordAttempt(false, "ACCOUNT_LOCKED");
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked. Try again later.",
      });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      const failedCount = admin.failedLoginCount + 1;

      const updateData = {
        failedLoginCount: failedCount,
      };

      // Lock account if threshold exceeded
      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCK_TIME_MINUTES * 60 * 1000
        );
      }

      await prisma.superAdmin.update({
        where: { id: admin.id },
        data: updateData,
      });

      await recordAttempt(false, "INVALID_PASSWORD");

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Successful login → reset counters
    await prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    await recordAttempt(true, "LOGIN_SUCCESS");

    // 5️⃣ Generate token
    const token = signSuperAdminToken({
      superAdminId: admin.id,
      role: "SUPER_ADMIN",
    });

    res.json({
      success: true,
      message: "Welcome to the Platform Admin Panel 🚀",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
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
