-- CreateTable
CREATE TABLE `StudentProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` LONGTEXT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
    INDEX `StudentProfile_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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

-- CreateTable
CREATE TABLE `Achievement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `threshold` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAchievement` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `achievementId` VARCHAR(191) NOT NULL,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserAchievement_userId_idx`(`userId`),
    INDEX `UserAchievement_achievementId_idx`(`achievementId`),
    UNIQUE INDEX `UserAchievement_userId_achievementId_key`(`userId`, `achievementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `category` ENUM('PAYMENT', 'TECHNICAL', 'CONTENT', 'ACCOUNT', 'OTHER') NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `assignedTo` VARCHAR(191) NULL,
    `resolution` LONGTEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportTicket_studentId_idx`(`studentId`),
    INDEX `SupportTicket_status_idx`(`status`),
    INDEX `SupportTicket_category_idx`(`category`),
    INDEX `SupportTicket_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
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

-- CreateTable
CREATE TABLE `SupportTicketAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NULL,
    `replyId` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportTicketAttachment_ticketId_idx`(`ticketId`),
    INDEX `SupportTicketAttachment_replyId_idx`(`replyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSettings` ADD CONSTRAINT `StudentSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievement` ADD CONSTRAINT `UserAchievement_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicketReply` ADD CONSTRAINT `SupportTicketReply_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicketReply` ADD CONSTRAINT `SupportTicketReply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicketAttachment` ADD CONSTRAINT `SupportTicketAttachment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicketAttachment` ADD CONSTRAINT `SupportTicketAttachment_replyId_fkey` FOREIGN KEY (`replyId`) REFERENCES `SupportTicketReply`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
