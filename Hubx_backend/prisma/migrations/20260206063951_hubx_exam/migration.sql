-- AlterTable
ALTER TABLE `doubt` ADD COLUMN `isResolved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `repliedAt` DATETIME(3) NULL,
    ADD COLUMN `repliedBy` VARCHAR(191) NULL,
    ADD COLUMN `teacherReply` LONGTEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `studentanswer` ADD COLUMN `markedTooHard` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Doubt_isResolved_idx` ON `Doubt`(`isResolved`);

-- AddForeignKey
ALTER TABLE `Doubt` ADD CONSTRAINT `Doubt_repliedBy_fkey` FOREIGN KEY (`repliedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `Doubt_questionId_idx` ON `Doubt`(`questionId`);
