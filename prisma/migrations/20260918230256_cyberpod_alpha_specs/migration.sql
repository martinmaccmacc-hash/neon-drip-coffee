/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CyberPod` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CyberPod" ADD COLUMN     "specsNote" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CyberPod_name_key" ON "CyberPod"("name");
