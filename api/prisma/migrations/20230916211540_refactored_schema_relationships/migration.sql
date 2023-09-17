/*
  Warnings:

  - You are about to drop the column `ClientId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `VendorId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `CommentId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `AuthorId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `ClientId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `ContractId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `ExpenseId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `InvoiceId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `JobId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `VendorId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `ClientId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `ContractId` on the `ContractMember` table. All the data in the column will be lost.
  - You are about to drop the column `organizationMemberId` on the `ContractMember` table. All the data in the column will be lost.
  - You are about to drop the column `ContractId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `JobId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `VendorId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `ExpenseId` on the `ExpenseEntry` table. All the data in the column will be lost.
  - You are about to drop the column `ForOrganizationMemberId` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `BillToClientId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `ContractId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `JobId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `InvoiceId` on the `InvoiceEntry` table. All the data in the column will be lost.
  - You are about to drop the column `ContractId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `JobId` on the `JobMember` table. All the data in the column will be lost.
  - You are about to drop the column `organizationMemberId` on the `JobMember` table. All the data in the column will be lost.
  - You are about to drop the column `OwnerId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `OrganizationConfig` table. All the data in the column will be lost.
  - You are about to drop the column `UserId` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `OrganizationId` on the `Vendor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,phone]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contractId,organizationMemberId]` on the table `ContractMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[expenseNumber,organizationId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,organizationMemberId]` on the table `JobMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId]` on the table `OrganizationConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,flags]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,email]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,phone]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commentId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `OrganizationConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_ClientId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_CommentId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_AuthorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ClientId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ContractId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ExpenseId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_InvoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_JobId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_ClientId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_ContractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_OrganizationMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_ContractId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_JobId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseEntry" DROP CONSTRAINT "ExpenseEntry_ExpenseId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_ForOrganizationMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_BillToClientId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_ContractId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_JobId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceEntry" DROP CONSTRAINT "InvoiceEntry_InvoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_ContractId_fkey";

-- DropForeignKey
ALTER TABLE "JobMember" DROP CONSTRAINT "JobMember_JobId_fkey";

-- DropForeignKey
ALTER TABLE "JobMember" DROP CONSTRAINT "JobMember_OrganizationMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_OwnerId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationConfig" DROP CONSTRAINT "OrganizationConfig_OrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_OrganizationId_fkey";

-- DropIndex
DROP INDEX "clients__organization_id_email";

-- DropIndex
DROP INDEX "clients__organization_id_phone";

-- DropIndex
DROP INDEX "ContractMember_ContractId_OrganizationMemberId_key";

-- DropIndex
DROP INDEX "expenses_expense_number__organization_id";

-- DropIndex
DROP INDEX "invoices__organization_id_invoice_number";

-- DropIndex
DROP INDEX "JobMember_JobId_OrganizationMemberId_key";

-- DropIndex
DROP INDEX "OrganizationConfig_OrganizationId_key";

-- DropIndex
DROP INDEX "tokens__user_id_flags";

-- DropIndex
DROP INDEX "vendors__organization_id_email";

-- DropIndex
DROP INDEX "vendors__organization_id_phone";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "ClientId",
DROP COLUMN "OrganizationId",
DROP COLUMN "UserId",
DROP COLUMN "VendorId",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "CommentId",
ADD COLUMN     "commentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "OrganizationId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "AuthorId",
DROP COLUMN "ClientId",
DROP COLUMN "ContractId",
DROP COLUMN "ExpenseId",
DROP COLUMN "InvoiceId",
DROP COLUMN "JobId",
DROP COLUMN "OrganizationId",
DROP COLUMN "VendorId",
ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "expenseId" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "ClientId",
DROP COLUMN "OrganizationId",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContractMember" DROP COLUMN "ContractId",
DROP COLUMN "organizationMemberId",
ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "organizationMemberId" TEXT;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "ContractId",
DROP COLUMN "JobId",
DROP COLUMN "OrganizationId",
DROP COLUMN "VendorId",
ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "ExpenseEntry" DROP COLUMN "ExpenseId",
ADD COLUMN     "expenseId" TEXT;

-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "ForOrganizationMemberId",
DROP COLUMN "OrganizationId",
ADD COLUMN     "forOrganizationMemberId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "BillToClientId",
DROP COLUMN "ContractId",
DROP COLUMN "JobId",
DROP COLUMN "OrganizationId",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceEntry" DROP COLUMN "InvoiceId",
ADD COLUMN     "invoiceId" TEXT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "ContractId",
ADD COLUMN     "contractId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobMember" DROP COLUMN "JobId",
DROP COLUMN "organizationMemberId",
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "organizationMemberId" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "OwnerId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrganizationConfig" DROP COLUMN "OrganizationId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "UserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "OrganizationId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_clientId_key" ON "Address"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_organizationId_key" ON "Address"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_vendorId_key" ON "Address"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "clients__organization_id_email" ON "Client"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "clients__organization_id_phone" ON "Client"("organizationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "ContractMember_contractId_organizationMemberId_key" ON "ContractMember"("contractId", "organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expense_number__organization_id" ON "Expense"("expenseNumber", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices__organization_id_invoice_number" ON "Invoice"("organizationId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JobMember_jobId_organizationMemberId_key" ON "JobMember"("jobId", "organizationMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationConfig_organizationId_key" ON "OrganizationConfig"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens__user_id_flags" ON "Token"("userId", "flags");

-- CreateIndex
CREATE UNIQUE INDEX "vendors__organization_id_email" ON "Vendor"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors__organization_id_phone" ON "Vendor"("organizationId", "phone");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMember" ADD CONSTRAINT "ContractMember_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMember" ADD CONSTRAINT "ContractMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseEntry" ADD CONSTRAINT "ExpenseEntry_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_forOrganizationMemberId_fkey" FOREIGN KEY ("forOrganizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceEntry" ADD CONSTRAINT "InvoiceEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMember" ADD CONSTRAINT "JobMember_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMember" ADD CONSTRAINT "JobMember_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationConfig" ADD CONSTRAINT "OrganizationConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;