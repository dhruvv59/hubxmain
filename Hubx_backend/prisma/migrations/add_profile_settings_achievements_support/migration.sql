-- Create enum types for new models
CREATE TYPE `NotificationType` ENUM('EMAIL', 'PUSH', 'IN_APP');
CREATE TYPE `TicketStatus` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED');
CREATE TYPE `TicketPriority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE `TicketCategory` ENUM('PAYMENT', 'TECHNICAL', 'CONTENT', 'ACCOUNT', 'OTHER');

-- Create StudentProfile table
CREATE TABLE `StudentProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191),
  `address` LONGTEXT,
  `dateOfBirth` DATETIME(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
  INDEX `StudentProfile_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create StudentSettings table
CREATE TABLE `StudentSettings` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
  `pushNotifications` BOOLEAN NOT NULL DEFAULT false,
  `assignmentNotifications` BOOLEAN NOT NULL DEFAULT true,
  `assessmentNotifications` BOOLEAN NOT NULL DEFAULT true,
  `announcementNotifications` BOOLEAN NOT NULL DEFAULT false,
  `profileVisibility` VARCHAR(191) NOT NULL DEFAULT 'public',
  `showPerformance` BOOLEAN NOT NULL DEFAULT true,
  `language` VARCHAR(191) NOT NULL DEFAULT 'en',
  `theme` VARCHAR(191) NOT NULL DEFAULT 'light',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `StudentSettings_userId_key`(`userId`),
  INDEX `StudentSettings_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Achievement table
CREATE TABLE `Achievement` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `icon` VARCHAR(191) NOT NULL,
  `color` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `threshold` INT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create UserAchievement table
CREATE TABLE `UserAchievement` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `achievementId` VARCHAR(191) NOT NULL,
  `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `UserAchievement_userId_achievementId_key`(`userId`, `achievementId`),
  INDEX `UserAchievement_userId_idx`(`userId`),
  INDEX `UserAchievement_achievementId_idx`(`achievementId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SupportTicket table
CREATE TABLE `SupportTicket` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `category` `TicketCategory` NOT NULL,
  `status` `TicketStatus` NOT NULL DEFAULT 'OPEN',
  `priority` `TicketPriority` NOT NULL DEFAULT 'MEDIUM',
  `assignedTo` VARCHAR(191),
  `resolution` LONGTEXT,
  `resolvedAt` DATETIME(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `SupportTicket_studentId_idx`(`studentId`),
  INDEX `SupportTicket_status_idx`(`status`),
  INDEX `SupportTicket_category_idx`(`category`),
  INDEX `SupportTicket_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SupportTicketReply table
CREATE TABLE `SupportTicketReply` (
  `id` VARCHAR(191) NOT NULL,
  `ticketId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `SupportTicketReply_ticketId_idx`(`ticketId`),
  INDEX `SupportTicketReply_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SupportTicketAttachment table
CREATE TABLE `SupportTicketAttachment` (
  `id` VARCHAR(191) NOT NULL,
  `ticketId` VARCHAR(191),
  `replyId` VARCHAR(191),
  `fileUrl` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `fileSize` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `SupportTicketAttachment_ticketId_idx`(`ticketId`),
  INDEX `SupportTicketAttachment_replyId_idx`(`replyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `StudentSettings` ADD CONSTRAINT `StudentSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SupportTicketReply` ADD CONSTRAINT `SupportTicketReply_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SupportTicketReply` ADD CONSTRAINT `SupportTicketReply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SupportTicketAttachment` ADD CONSTRAINT `SupportTicketAttachment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SupportTicketAttachment` ADD CONSTRAINT `SupportTicketAttachment_replyId_fkey` FOREIGN KEY (`replyId`) REFERENCES `SupportTicketReply`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
