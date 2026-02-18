-- AlterTable
ALTER TABLE `Standard` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Subject` ADD COLUMN `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Chapter` ADD COLUMN `description` VARCHAR(191) NULL,
ADD COLUMN `sequence` INTEGER NULL;
