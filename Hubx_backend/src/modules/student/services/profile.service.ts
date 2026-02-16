import { prisma } from "@/config/database";
import { Prisma } from "@prisma/client";

export class ProfileService {
  /**
   * Get student profile with extended details
   * Combines User and StudentProfile data
   */
  async getProfile(studentId: string) {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        profile: {
          select: {
            phone: true,
            address: true,
            dateOfBirth: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw {
        status: 404,
        message: "Student not found",
      };
    }

    return {
      id: user.id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.profile?.phone,
      address: user.profile?.address,
      dateOfBirth: user.profile?.dateOfBirth,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update student profile
   * Handles both User and StudentProfile updates in a transaction
   */
  async updateProfile(
    studentId: string,
    data: {
      fullName?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: Date;
    }
  ) {
    // Start transaction to ensure consistency
    return await prisma.$transaction(async (tx) => {
      // Parse full name if provided
      let firstName = "";
      let lastName = "";

      if (data.fullName) {
        const nameParts = data.fullName.trim().split(" ");
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }

      // Update User (firstName, lastName)
      const user = await tx.user.update({
        where: { id: studentId },
        data: {
          ...(data.fullName && { firstName, lastName }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      // Update or create StudentProfile
      const profile = await tx.studentProfile.upsert({
        where: { userId: studentId },
        update: {
          ...(data.phone && { phone: data.phone }),
          ...(data.address && { address: data.address }),
          ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        },
        create: {
          userId: studentId,
          ...(data.phone && { phone: data.phone }),
          ...(data.address && { address: data.address }),
          ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        },
      });

      // Return combined response
      return {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        updatedAt: new Date(),
      };
    });
  }

  /**
   * Validate that student owns the profile being updated
   * (Authorization check)
   */
  async validateOwnership(studentId: string, requestingUserId: string) {
    if (studentId !== requestingUserId) {
      throw {
        status: 403,
        message: "You can only update your own profile",
      };
    }
  }
}

export const profileService = new ProfileService();
