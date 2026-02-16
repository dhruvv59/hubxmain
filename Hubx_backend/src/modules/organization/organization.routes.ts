import { Router } from "express"
import { authenticate } from "@middlewares/auth"
import { requireSuperAdmin } from "@middlewares/roleAuth"
import { organizationController } from "./organization.controller"

const router = Router()

// Organization CRUD - Super Admin only
router.post("/", authenticate, requireSuperAdmin, organizationController.createOrganization)
router.get("/", authenticate, organizationController.getOrganizations)
router.get("/:id", authenticate, organizationController.getOrganizationById)

// Member management - Super Admin only
router.post("/:id/members", authenticate, requireSuperAdmin, organizationController.addMember)
router.get("/:id/members", authenticate, organizationController.getMembers)
router.delete("/:id/members/:userId", authenticate, requireSuperAdmin, organizationController.removeMember)

// User's organizations - Any authenticated user
router.get("/user/:userId", authenticate, organizationController.getUserOrganizations)

export default router
