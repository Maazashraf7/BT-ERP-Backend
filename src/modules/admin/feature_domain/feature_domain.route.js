import express from "express";
import {
    createDomain,
    getAllDomains,
    getDomainById,
    updateDomain,
    deleteDomain,
    assignFeatureToDomain,
    getAssignedFeatureByDomain,
    addDomainDependency,
    removeDomainDependency
} from "./feature_domain.controller.js";
import { authMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requirePermission } from "../../../core/middlewares/permission.middleware.js";
import { checkSubscription } from "../../../core/middlewares/subscription.middleware.js";
const router = express.Router();


router.use(authMiddleware);
router.use(checkSubscription)


router.post("/", requirePermission("CREATE_DOMAIN"), createDomain);
router.get("/", requirePermission("VIEW_DOMAINS"), getAllDomains);
router.get("/:id", requirePermission("VIEW_DOMAINS"), getDomainById);
router.put("/:id", requirePermission("UPDATE_DOMAIN"), updateDomain);
router.delete("/:id", requirePermission("DELETE_DOMAIN"), deleteDomain);
router.post("/assignfeature", requirePermission("ASSIGN_FEATURE"), assignFeatureToDomain);
router.get("/assignedfeatures/:domainId", requirePermission("GET_FEATURE_BY_DOMAIN"), getAssignedFeatureByDomain);

// Domain Dependency Management
router.post("/dependency", requirePermission("UPDATE_DOMAIN"), addDomainDependency);
router.delete("/dependency", requirePermission("UPDATE_DOMAIN"), removeDomainDependency);



export default router;
