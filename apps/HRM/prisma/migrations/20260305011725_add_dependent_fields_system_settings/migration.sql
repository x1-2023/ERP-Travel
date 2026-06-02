/*
  Warnings:

  - Made the column `date_of_birth` on table `dependents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dependents" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registered_at" TIMESTAMP(3),
ADD COLUMN     "tax_dep_code" TEXT,
ALTER COLUMN "date_of_birth" SET NOT NULL;

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);
