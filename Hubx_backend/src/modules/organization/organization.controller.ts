import { Request, Response } from "express"
import { organizationService } from "./organization.service"
import prisma from "@config/database"

export class OrganizationController {
    async createOrganization(req: Request, res: Response) {
        try {
            const organization = await organizationService.createOrganization(req.body)
            res.status(201).json({
                success: true,
                data: organization,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getOrganizations(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10

            const result = await organizationService.getOrganizations(page, limit)
            res.json({
                success: true,
                data: result.organizations,
                pagination: result.pagination,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getOrganizationById(req: Request, res: Response) {
        try {
            const organization = await organizationService.getOrganizationById(req.params.id)
            res.json({
                success: true,
                data: organization,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async addMember(req: Request, res: Response) {
        try {
            const { email, userId, role, employeeId, studentId, department } = req.body

            // Validate that either email or userId is provided
            if (!email && !userId) {
                return res.status(400).json({
                    success: false,
                    message: "Either email or userId must be provided",
                })
            }

            let memberUserId = userId

            // If email is provided and userId is not, look up the user by email
            if (email && !userId) {
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase().trim() },
                })

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `User with email ${email} not found. Please ensure the user has an account.`,
                    })
                }

                memberUserId = user.id
            }

            const member = await organizationService.addMember(req.params.id, memberUserId, role, {
                employeeId,
                studentId,
                department,
            })
            res.status(201).json({
                success: true,
                data: member,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getMembers(req: Request, res: Response) {
        try {
            const role = req.query.role as string | undefined
            const members = await organizationService.getOrganizationMembers(req.params.id, role)
            res.json({
                success: true,
                data: members,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async removeMember(req: Request, res: Response) {
        try {
            const result = await organizationService.removeMember(req.params.id, req.params.userId)
            res.json({
                success: true,
                message: result.message,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getUserOrganizations(req: Request, res: Response) {
        try {
            const memberships = await organizationService.getUserOrganizations(req.params.userId)
            res.json({
                success: true,
                data: memberships,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }
}

export const organizationController = new OrganizationController()
