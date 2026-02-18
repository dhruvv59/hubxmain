-- DropIndex
DROP INDEX `ExamAttempt_paperId_studentId_key` ON `examattempt`;

-- AlterTable
ALTER TABLE `examattempt` ADD COLUMN `attemptNumber` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastActiveAt` DATETIME(3) NULL,
    ADD COLUMN `streak` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `actionUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionBank` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'MCQ', 'FILL_IN_THE_BLANKS') NOT NULL,
    `difficulty` ENUM('EASY', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    `questionText` LONGTEXT NOT NULL,
    `questionImage` VARCHAR(191) NULL,
    `options` JSON NULL,
    `correctOption` INTEGER NULL,
    `caseSensitive` BOOLEAN NOT NULL DEFAULT false,
    `correctAnswers` JSON NULL,
    `solutionText` LONGTEXT NULL,
    `solutionImage` VARCHAR(191) NULL,
    `marks` DOUBLE NOT NULL DEFAULT 1,
    `subjectId` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QuestionBank_teacherId_idx`(`teacherId`),
    INDEX `QuestionBank_subjectId_idx`(`subjectId`),
    INDEX `QuestionBank_type_idx`(`type`),
    INDEX `QuestionBank_difficulty_idx`(`difficulty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionBankChapter` (
    `id` VARCHAR(191) NOT NULL,
    `questionBankId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QuestionBankChapter_chapterId_idx`(`chapterId`),
    INDEX `QuestionBankChapter_questionBankId_idx`(`questionBankId`),
    UNIQUE INDEX `QuestionBankChapter_questionBankId_chapterId_key`(`questionBankId`, `chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionBankPaperLink` (
    `id` VARCHAR(191) NOT NULL,
    `questionBankId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `QuestionBankPaperLink_questionId_key`(`questionId`),
    INDEX `QuestionBankPaperLink_questionId_idx`(`questionId`),
    INDEX `QuestionBankPaperLink_questionBankId_idx`(`questionBankId`),
    UNIQUE INDEX `QuestionBankPaperLink_questionBankId_questionId_key`(`questionBankId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `paperId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `assignedBy` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `note` LONGTEXT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PaperAssignment_studentId_idx`(`studentId`),
    INDEX `PaperAssignment_paperId_idx`(`paperId`),
    INDEX `PaperAssignment_assignedBy_idx`(`assignedBy`),
    INDEX `PaperAssignment_isCompleted_idx`(`isCompleted`),
    UNIQUE INDEX `PaperAssignment_paperId_studentId_key`(`paperId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperBookmark` (
    `id` VARCHAR(191) NOT NULL,
    `paperId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaperBookmark_studentId_idx`(`studentId`),
    INDEX `PaperBookmark_paperId_idx`(`paperId`),
    UNIQUE INDEX `PaperBookmark_paperId_studentId_key`(`paperId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ExamAttempt_paperId_studentId_idx` ON `ExamAttempt`(`paperId`, `studentId`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBank` ADD CONSTRAINT `QuestionBank_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBank` ADD CONSTRAINT `QuestionBank_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBankChapter` ADD CONSTRAINT `QuestionBankChapter_questionBankId_fkey` FOREIGN KEY (`questionBankId`) REFERENCES `QuestionBank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBankChapter` ADD CONSTRAINT `QuestionBankChapter_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBankPaperLink` ADD CONSTRAINT `QuestionBankPaperLink_questionBankId_fkey` FOREIGN KEY (`questionBankId`) REFERENCES `QuestionBank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBankPaperLink` ADD CONSTRAINT `QuestionBankPaperLink_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaperAssignment` ADD CONSTRAINT `PaperAssignment_paperId_fkey` FOREIGN KEY (`paperId`) REFERENCES `Paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaperAssignment` ADD CONSTRAINT `PaperAssignment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaperAssignment` ADD CONSTRAINT `PaperAssignment_assignedBy_fkey` FOREIGN KEY (`assignedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaperBookmark` ADD CONSTRAINT `PaperBookmark_paperId_fkey` FOREIGN KEY (`paperId`) REFERENCES `Paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaperBookmark` ADD CONSTRAINT `PaperBookmark_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
