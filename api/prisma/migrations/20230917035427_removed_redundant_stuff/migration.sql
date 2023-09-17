/*
  Warnings:

  - You are about to alter the column `description` on the `Client` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1024)` to `VarChar(512)`.
  - You are about to alter the column `description` on the `Contract` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1024)` to `VarChar(512)`.
  - You are about to alter the column `expenseNumber` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(64)`.
  - You are about to alter the column `name` on the `ExpenseEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(128)`.
  - You are about to alter the column `description` on the `ExpenseEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(128)`.
  - You are about to alter the column `unit` on the `ExpenseEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(32)`.
  - You are about to alter the column `invoiceNumber` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(64)`.
  - You are about to alter the column `poNumber` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(128)`.
  - You are about to alter the column `description` on the `InvoiceEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(128)`.
  - You are about to drop the column `payout` on the `Job` table. All the data in the column will be lost.
  - The primary key for the `JobMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `JobMember` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `OrganizationMember` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(128)`.
  - You are about to alter the column `description` on the `Vendor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1024)` to `VarChar(512)`.
  - You are about to drop the `ContractMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,phoneCountry,phoneNumber]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `jobId` on table `JobMember` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationMemberId` on table `JobMember` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_organizationMemberId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_updatedByUserId_fkey";

-- DropIndex
DROP INDEX "JobMember_jobId_organizationMemberId_key";

-- DropIndex
DROP INDEX "organization_members__organization_id_phone";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "description" SET DATA TYPE VARCHAR(512);

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "description" SET DATA TYPE VARCHAR(512);

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "expenseNumber" SET DATA TYPE VARCHAR(64);

-- AlterTable
ALTER TABLE "ExpenseEntry" ALTER COLUMN "name" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "unit" DROP NOT NULL,
ALTER COLUMN "unit" DROP DEFAULT,
ALTER COLUMN "unit" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "poNumber" SET DATA TYPE VARCHAR(128);

-- AlterTable
ALTER TABLE "InvoiceEntry" ALTER COLUMN "description" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "unit" DROP NOT NULL,
ALTER COLUMN "unit" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "payout";

-- AlterTable
ALTER TABLE "JobMember" DROP CONSTRAINT "JobMember_pkey",
DROP COLUMN "id",
ALTER COLUMN "jobId" SET NOT NULL,
ALTER COLUMN "organizationMemberId" SET NOT NULL,
ADD CONSTRAINT "JobMember_pkey" PRIMARY KEY ("jobId", "organizationMemberId");

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "phone",
ADD COLUMN     "phoneCountry" VARCHAR(5),
ADD COLUMN     "phoneNumber" VARCHAR(20),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(128);

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "description" SET DATA TYPE VARCHAR(512);

-- DropTable
DROP TABLE "ContractMember";

-- CreateIndex
CREATE UNIQUE INDEX "organization_members__phone" ON "OrganizationMember"("organizationId", "phoneCountry", "phoneNumber");
