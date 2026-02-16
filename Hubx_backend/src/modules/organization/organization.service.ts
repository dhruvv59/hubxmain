import prisma from "@config/database"
import { AppError } from "@utils/errors"

export class OrganizationService {
    /**
     * Create a new organization
     */
    async createOrganization(data: {
        name: string
        type: string
        code: string
        description?: string
        parentId?: string
        email?: string
        phone?: string
        address?: string
    }) {
        // Check if code already exists
        const existing = await prisma.organization.findUnique({
            where: { code: data.code },
        })

        if (existing) {
            throw new AppError(400, "Organization code already exists")
        }

        // Validate parent if provided
        if (data.parentId) {
            const parent = await prisma.organization.findUnique({
                where: { id: data.parentId },
            })
            if (!parent) {
                throw new AppError(404, "Parent organization not found")
            }
        }

        const organization = await prisma.organization.create({
            data: {
                name: data.name,
                type: data.type as any,
                code: data.code,
                description: data.description,
                parentId: data.parentId,
                email: data.email,
                phone: data.phone,
                address: data.address,
            },
        })

        return organization
    }

    /**
     * Get all organizations
     */
    async getOrganizations(page = 1, limit = 10) {
        const skip = (page - 1) * limit

        const organizations = await prisma.organization.findMany({
            where: { isActive: true },
            include: {
                parent: true,
                _count: {
                    select: { memberships: true, children: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        })

        const total = await prisma.organization.count({
            where: { isActive: true },
        })

        return {
            organizations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Get organization by ID
     */
    async getOrganizationById(organizationId: string) {
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                parent: true,
                children: true,
                memberships: {
                    include: { user: true },
                },
            },
        })

        if (!organization) {
            throw new AppError(404, "Organization not found")
        }

        return organization
    }

    /**
     * Add member to organization
     */
    async addMember(
        organizationId: string,
        userId: string,
        role: string,
        metadata?: {
            employeeId?: string
            studentId?: string
            department?: string
        },
    ) {
        // Verify organization exists
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        })
        if (!organization) {
            throw new AppError(404, "Organization not found")
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })
        if (!user) {
            throw new AppError(404, "User not found")
        }

        // Check if already a member
        const existing = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        })

        if (existing) {
            throw new AppError(400, "User is already a member of this organization")
        }

        const member = await prisma.organizationMember.create({
            data: {
                userId,
                organizationId,
                role: role as any,
                employeeId: metadata?.employeeId,
                studentId: metadata?.studentId,
                department: metadata?.department,
            },
            include: {
                user: true,
                organization: true,
            },
        })

        return member
    }

    /**
     * Get organization members
     */
    async getOrganizationMembers(organizationId: string, role?: string) {
        const members = await prisma.organizationMember.findMany({
            where: {
                organizationId,
                isActive: true,
                ...(role && { role: role as any }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return members
    }

    /**
     * Get user's organizations
     */
    async getUserOrganizations(userId: string) {
        const memberships = await prisma.organizationMember.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                organization: true,
            },
        })

        return memberships
    }

    /**
     * Get students in organization by standard
     */
    async getOrganizationStudents(organizationId: string, standard?: number) {
        const members = await prisma.organizationMember.findMany({
            where: {
                organizationId,
                role: "STUDENT",
                isActive: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        })

        // If standard filter is provided, we would need additional logic
        // For now, returning all students
        return members
    }

    /**
     * Remove member from organization
     */
    async removeMember(organizationId: string, userId: string) {
        const member = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        })

        if (!member) {
            throw new AppError(404, "Member not found")
        }

        await prisma.organizationMember.update({
            where: { id: member.id },
            data: { isActive: false },
        })

        return { message: "Member removed successfully" }
    }

    /**
     * Check if users are in same organization
     */
    async areInSameOrganization(userId1: string, userId2: string) {
        const user1Orgs = await prisma.organizationMember.findMany({
            where: { userId: userId1, isActive: true },
            select: { organizationId: true },
        })

        const user2Orgs = await prisma.organizationMember.findMany({
            where: { userId: userId2, isActive: true },
            select: { organizationId: true },
        })

        const org1Ids = user1Orgs.map((o) => o.organizationId)
        const org2Ids = user2Orgs.map((o) => o.organizationId)

        return org1Ids.some((id) => org2Ids.includes(id))
    }
}

export const organizationService = new OrganizationService()
