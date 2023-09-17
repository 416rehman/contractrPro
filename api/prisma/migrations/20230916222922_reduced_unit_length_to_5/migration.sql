/*
  Warnings:

  - You are about to alter the column `unit` on the `InvoiceEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(5)`.

*/
-- AlterTable
ALTER TABLE "InvoiceEntry" ALTER COLUMN "unit" SET DATA TYPE VARCHAR(5);
