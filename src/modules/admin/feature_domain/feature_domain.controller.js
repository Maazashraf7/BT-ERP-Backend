import prisma from "../../../core/config/db.js";

/**
 * CREATE DOMAIN
 * POST /domains
 */
export const createDomain = async (req, res) => {
  try {
    const { domain_name, price, description } = req.body;

    if (!domain_name) {
      return res.status(400).json({ message: "domain_name is required" });
    }

    // 🔍 Case-insensitive check
    const existingDomain = await prisma.tenantFeatureDomain.findFirst({
      where: {
        domain_name: {
          equals: domain_name,
          mode: 'insensitive'
        }
      }
    });

    if (existingDomain) {
      return res.status(409).json({ message: `Domain with name '${domain_name}' already exists (case-insensitive)` });
    }

    const domain = await prisma.tenantFeatureDomain.create({
      data: { domain_name, price, description }
    });

    res.status(201).json(domain);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Domain already exists" });
    }
    res.status(500).json({ message: "Failed to create domain", error });
  }
};

/**
 * GET ALL DOMAINS
 * GET /domains
 */
export const getAllDomains = async (req, res) => {
  try {
    const domains = await prisma.tenantFeatureDomain.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(domains);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch domains", error });
  }
};

/**
 * GET DOMAIN BY ID
 * GET /domains/:id
 */
export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await prisma.tenantFeatureDomain.findUnique({
      where: { id },
      include: {
        features: {
          include: {
            feature: true
          }
        }
      }
    });

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    res.json(domain);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch domain", error });
  }
};

/**
 * UPDATE DOMAIN
 * PUT /domains/:id
 */
export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain_name } = req.body;

    if (domain_name) {
      // 🔍 Case-insensitive check (excluding current self)
      const existingDomain = await prisma.tenantFeatureDomain.findFirst({
        where: {
          domain_name: {
            equals: domain_name,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (existingDomain) {
        return res.status(409).json({ message: `Another domain with name '${domain_name}' already exists (case-insensitive)` });
      }
    }

    const domain = await prisma.tenantFeatureDomain.update({
      where: { id },
      data: { domain_name }
    });

    res.json(domain);
  } catch (error) {
    res.status(500).json({ message: "Failed to update domain", error });
  }
};

/**
 * DELETE DOMAIN
 * DELETE /domains/:id
 */
export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tenantFeatureDomain.delete({
      where: { id }
    });

    res.json({ message: "Domain deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete domain", error });
  }
};





export const assignFeatureToDomain = async (req, res) => {
  try {
    const { featureId, domainId } = req.body;

    if (!featureId || !domainId) {
      return res.status(400).json({
        success: false,
        message: "featureId and domainId are required",
      });
    }

    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    const domain = await prisma.tenantFeatureDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    const featureDomain = await prisma.tenanFeaturedDomain_assign_features.create({
      data: {
        featureId,
        domainId,
        domain_name: domain.domain_name,
        feature_name: feature.feature_name,
      },
    });

    res.status(201).json({
      success: true,
      message: "Feature assigned to domain successfully",
      featureDomain,
    });
  } catch (error) {
    console.error("ASSIGN FEATURE TO DOMAIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAssignedFeatureByDomain = async (req, res) => {
  try {
    const { domainId } = req.params;

    const featureDomain = await prisma.tenanFeaturedDomain_assign_features.findMany({
      where: { domainId },
      include: {
        feature: true
      }
    });

    res.json({
      success: true,
      featureDomain,
    });
  } catch (error) {
    console.error("GET FEATURE BY DOMAIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



