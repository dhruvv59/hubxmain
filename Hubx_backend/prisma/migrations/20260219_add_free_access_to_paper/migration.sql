-- AlterTable
ALTER TABLE `Paper` ADD COLUMN `isFreeAccess` BOOLEAN NOT NULL DEFAULT false;

-- Create index for isFreeAccess for faster queries
CREATE INDEX `Paper_isFreeAccess_idx` ON `Paper`(`isFreeAccess`);
