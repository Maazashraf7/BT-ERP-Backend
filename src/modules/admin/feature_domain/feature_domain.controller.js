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

    // 🔍 Case-insensitive and Space-insensitive Check
    const normalizedNewName = domain_name.replace(/\s+/g, '').toLowerCase();

    const existingDomains = await prisma.tenantFeatureDomain.findMany({
      select: { domain_name: true }
    });

    const isDuplicate = existingDomains.some(d =>
      d.domain_name.replace(/\s+/g, '').toLowerCase() === normalizedNewName
    );

    if (isDuplicate) {
      return res.status(409).json({ message: `Domain with name '${domain_name}' already exists (matches case and spaces insensitively)` });
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
    // 1. Fetch all domains with their assigned features
    const rawDomains = await prisma.tenantFeatureDomain.findMany({
      include: {
        features: {
          include: {
            feature: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Fetch all available features to allow assignments in the UI
    const allFeatures = await prisma.feature.findMany({
      orderBy: { feature_name: "asc" }
    });

    // 3. Transform data to be flatter and easier for the frontend
    const domains = rawDomains.map(domain => ({
      ...domain,
      features: domain.features.map(f => ({
        ...f.feature,
        assignmentId: f.id // include the join table ID if needed for removal
      }))
    }));

    res.json({
      success: true,
      domains: rawDomains
    });
  } catch (error) {
    console.error("GET ALL DOMAINS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch domains", error: error.message });
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

    // 🔍 Flatten features for the frontend
    const flattenedDomain = {
      ...domain,
      features: domain.features.map(f => ({
        ...f.feature,
        assignmentId: f.id
      }))
    };

    res.json({
      success: true,
      domain: flattenedDomain
    });
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

    res.json({
      success: true,
      message: "Domain updated successfully",
      domain
    });
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

    res.json({
      success: true,
      message: "Domain deleted successfully"
    });
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
    const checkFeatureDomain = await prisma.tenanFeaturedDomain_assign_features.findFirst({
      where: {
        featureId,
        domainId,
      },
    });
    if (checkFeatureDomain) {
      return res.status(409).json({
        success: false,
        message: "Feature already assigned to domain",
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

    // 🔍 Flatten results
    const features = featureDomain.map(fd => ({
      ...fd.feature,
      assignmentId: fd.id,
      domain_name: fd.domain_name
    }));

    res.json({
      success: true,
      features,
    });
  } catch (error) {
    console.error("GET FEATURE BY DOMAIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



