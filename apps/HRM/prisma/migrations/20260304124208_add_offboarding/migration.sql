-- CreateEnum
CREATE TYPE "OffboardingStatus" AS ENUM ('INITIATED', 'MANAGER_APPROVED', 'HR_APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OffboardingTaskStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'OFFBOARDING';

-- CreateTable
CREATE TABLE "offboarding_instances" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "status" "OffboardingStatus" NOT NULL DEFAULT 'INITIATED',
    "resignation_date" TIMESTAMP(3) NOT NULL,
    "last_working_date" TIMESTAMP(3),
    "resign_reason" TEXT,
    "resign_decision_no" TEXT,
    "initiated_by" TEXT NOT NULL,
    "manager_approved_by" TEXT,
    "manager_approved_at" TIMESTAMP(3),
    "hr_approved_by" TEXT,
    "hr_approved_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offboarding_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offboarding_tasks" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "task_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_role" TEXT NOT NULL,
    "status" "OffboardingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "done_at" TIMESTAMP(3),
    "done_by" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offboarding_instances_employee_id_key" ON "offboarding_instances"("employee_id");

-- AddForeignKey
ALTER TABLE "offboarding_instances" ADD CONSTRAINT "offboarding_instances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_tasks" ADD CONSTRAINT "offboarding_tasks_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "offboarding_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
