import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export const tenantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find tenant user
    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
      include: {
        tenant: true,
        role: true,
      },
    });

    // helper to record login attempt
    const recordAttempt = async (success, reason) => {
      await prisma.loginAttempt.create({
        data: {
          actorType: "TENANT_USER",
          userId: user?.id,
          tenantId: user?.tenantId,
          email,
          success,
          reason,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
    };

    if (!user) {
      await recordAttempt(false, "INVALID_EMAIL");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await recordAttempt(false, "ACCOUNT_LOCKED");
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked. Try again later.",
      });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const failedCount = user.failedLoginCount + 1;

      const updateData = {
        failedLoginCount: failedCount,
      };

      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCK_TIME_MINUTES * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await recordAttempt(false, "INVALID_PASSWORD");

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Successful login → reset counters
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    await recordAttempt(true, "LOGIN_SUCCESS");

    // 5️⃣ Create TENANT JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        type: "TENANT_USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name,
        type: "TENANT_USER",
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        type: user.tenant.type,
      },
    });
  } catch (error) {
    console.error("Tenant login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const tenantRegister = async (req, res) => {
  try {
    const { tenantName, tenantType, email, password } = req.body;

    if (!tenantName || !tenantType || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 1️⃣ Check if email already exists globally
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 2️⃣ Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        type: tenantType,
      },
    });

    // 3️⃣ Create Admin Role
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        tenantId: tenant.id,
      },
    });

    // 4️⃣ Create Admin User
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id,
        roleId: adminRole.id,
      },
    });

    // 5️⃣ Assign TRIAL Subscription
    const trialPlan = await prisma.plan.findFirst({
      where: { name: "TRIAL", isActive: true },
    });

    if (!trialPlan) {
      throw new Error("TRIAL plan not configured");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + trialPlan.duration);

    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: trialPlan.id,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });

    // 6️⃣ Enable Plan Modules
    const planModules = await prisma.planModule.findMany({
      where: { planId: trialPlan.id },
    });

    for (const pm of planModules) {
      await prisma.tenantModule.create({
        data: {
          tenantId: tenant.id,
          moduleId: pm.moduleId,
          enabled: true,
          source: "PLAN",
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
      },
      admin: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Tenant register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

