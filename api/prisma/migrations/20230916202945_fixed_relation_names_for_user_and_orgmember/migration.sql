/*
  Warnings:

  - You are about to drop the column `OrganizationId` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedByUserId` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `OrganizationMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationId,userId]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,email]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,phone]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_updatedByUserId_fkey";

-- DropIndex
DROP INDEX "OrganizationMember_OrganizationId_UserId_key";

-- DropIndex
DROP INDEX "organization_members__organization_id_email";

-- DropIndex
DROP INDEX "organization_members__organization_id_phone";

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "OrganizationId",
DROP COLUMN "updatedByUserId",
DROP COLUMN "UserId",
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "updatedByUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members__organization_id_email" ON "OrganizationMember"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members__organization_id_phone" ON "OrganizationMember"("organizationId", "phone");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;