-- AlterTable
ALTER TABLE `organizationmember` MODIFY `role` ENUM('SUPER_ADMIN', 'TEACHER', 'STUDENT') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('SUPER_ADMIN', 'TEACHER', 'STUDENT') NOT NULL;
