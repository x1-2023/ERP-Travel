-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollItemType" AS ENUM ('BASE_SALARY', 'MEAL_ALLOWANCE', 'PHONE_ALLOWANCE', 'FUEL_ALLOWANCE', 'PERF_ALLOWANCE', 'KPI_CURRENT', 'KPI_PREV1', 'KPI_PREV2', 'OT_WEEKDAY', 'OT_WEEKEND', 'OT_HOLIDAY', 'NIGHT_SHIFT', 'BUSINESS_TRIP', 'HAZARD_ALLOWANCE', 'OTHER_ALLOWANCE', 'ADVANCE_DEDUCTION', 'BONUS');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PAYROLL';

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "submitted_by" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payrolls" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "actual_days" DECIMAL(5,2) NOT NULL,
    "standard_days" DECIMAL(5,2) NOT NULL,
    "base_salary" DECIMAL(15,2) NOT NULL,
    "meal_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "phone_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fuel_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "perf_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_contract_salary" DECIMAL(15,2) NOT NULL,
    "total_actual_salary" DECIMAL(15,2) NOT NULL,
    "personal_deduction" DECIMAL(15,2) NOT NULL DEFAULT 11000000,
    "dependent_count" INTEGER NOT NULL DEFAULT 0,
    "dependent_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_income" DECIMAL(15,2) NOT NULL,
    "taxable_income" DECIMAL(15,2) NOT NULL,
    "insurance_base" DECIMAL(15,2) NOT NULL,
    "bhxh_employee" DECIMAL(15,2) NOT NULL,
    "bhyt_employee" DECIMAL(15,2) NOT NULL,
    "bhtn_employee" DECIMAL(15,2) NOT NULL,
    "total_employee_ins" DECIMAL(15,2) NOT NULL,
    "pit_amount" DECIMAL(15,2) NOT NULL,
    "advance_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_salary" DECIMAL(15,2) NOT NULL,
    "bhxh_employer" DECIMAL(15,2) NOT NULL,
    "bhyt_employer" DECIMAL(15,2) NOT NULL,
    "bhtn_employer" DECIMAL(15,2) NOT NULL,
    "bhtnld_employer" DECIMAL(15,2) NOT NULL,
    "total_employer_ins" DECIMAL(15,2) NOT NULL,
    "remaining_leave" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "bank_account" TEXT,
    "bank_name" TEXT,
    "name_no_accent" TEXT,
    "notes" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" TEXT NOT NULL,
    "employee_payroll_id" TEXT NOT NULL,
    "type" "PayrollItemType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "source_id" TEXT,
    "source_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_month_year_key" ON "payroll_periods"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_payrolls_period_id_employee_id_key" ON "employee_payrolls"("period_id", "employee_id");

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_employee_payroll_id_fkey" FOREIGN KEY ("employee_payroll_id") REFERENCES "employee_payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
