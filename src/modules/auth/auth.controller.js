import prisma from "../../core/config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const tenantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find tenant user (must have tenantId)
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: { not: null },
        isActive: true,
      },
      include: {
        tenant: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Create TENANT JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        type: "TENANT",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4️⃣ Response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
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

    // -----------------------------
    // 1. Validate input
    // -----------------------------
    if (!tenantName || !tenantType || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // -----------------------------
    // 2. Check if user already exists
    // -----------------------------
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // -----------------------------
    // 3. Create Tenant
    // -----------------------------
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        type: tenantType,
      },
    });

    // -----------------------------
    // 4. Create Admin Role
    // -----------------------------
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        tenantId: tenant.id,
      },
    });

    // -----------------------------
    // 5. Create Admin User
    // -----------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id,
        roleId: adminRole.id,
      },
    });

    // -----------------------------
    // 6. Assign TRIAL Subscription
    // -----------------------------
    const trialPlan = await prisma.plan.findFirst({
      where: { name: "TRIAL", isActive: true },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + trialPlan.duration);

    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: trialPlan.id,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });

    // -----------------------------
    // 7. Enable Plan Modules
    // -----------------------------
    const planModules = await prisma.planModule.findMany({
      where: { planId: trialPlan.id },
    });

    for (const pm of planModules) {
      await prisma.tenantModule.create({
        data: {
          tenantId: tenant.id,
          moduleId: pm.moduleId,
          enabled: true,
        },
      });
    }

    // -----------------------------
    // RESPONSE
    // -----------------------------
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
