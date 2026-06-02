-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATING', 'SIMULATED', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollItemType" AS ENUM ('EARNING', 'DEDUCTION', 'EMPLOYER_COST');

-- CreateEnum
CREATE TYPE "PayrollComponentCategory" AS ENUM ('BASE_SALARY', 'ALLOWANCE_TAXABLE', 'ALLOWANCE_NON_TAXABLE', 'OVERTIME', 'BONUS', 'COMMISSION', 'INSURANCE_EMPLOYEE', 'INSURANCE_EMPLOYER', 'PIT', 'ADVANCE', 'LOAN', 'OTHER_DEDUCTION', 'OTHER_EARNING');

-- CreateEnum
CREATE TYPE "BankCode" AS ENUM ('VCB', 'TCB', 'ACB', 'BIDV', 'VTB', 'MB', 'VPB', 'TPB', 'STB', 'SHB', 'MSB', 'OCB', 'OTHER');

-- CreateTable
CREATE TABLE "payroll_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "bhxh_employee_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.08,
    "bhxh_employer_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.175,
    "bhyt_employee_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.015,
    "bhyt_employer_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.03,
    "bhtn_employee_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.01,
    "bhtn_employer_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.01,
    "insurance_salary_cap" DECIMAL(15,0) NOT NULL DEFAULT 46800000,
    "personal_deduction" DECIMAL(15,0) NOT NULL DEFAULT 11000000,
    "dependent_deduction" DECIMAL(15,0) NOT NULL DEFAULT 4400000,
    "pit_brackets" JSONB NOT NULL DEFAULT '[]',
    "ot_weekday_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.5,
    "ot_weekend_rate" DECIMAL(3,2) NOT NULL DEFAULT 2.0,
    "ot_holiday_rate" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "ot_night_bonus" DECIMAL(3,2) NOT NULL DEFAULT 0.3,
    "standard_work_days" INTEGER NOT NULL DEFAULT 22,
    "standard_work_hours" DECIMAL(4,2) NOT NULL DEFAULT 8,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "PayrollComponentCategory" NOT NULL,
    "item_type" "PayrollItemType" NOT NULL,
    "default_amount" DECIMAL(15,0),
    "is_percentage" BOOLEAN NOT NULL DEFAULT false,
    "percentage_base" TEXT,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_insuranceable" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "calculated_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "paid_at" TIMESTAMP(3),
    "total_employees" INTEGER NOT NULL DEFAULT 0,
    "total_gross" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "total_net" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "total_employer_cost" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "department_name" TEXT,
    "position_name" TEXT,
    "base_salary" DECIMAL(15,0) NOT NULL,
    "insurance_salary" DECIMAL(15,0) NOT NULL,
    "work_days" DECIMAL(5,2) NOT NULL,
    "standard_days" INTEGER NOT NULL,
    "ot_hours_weekday" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "ot_hours_weekend" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "ot_hours_holiday" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "ot_hours_night" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "gross_salary" DECIMAL(15,0) NOT NULL,
    "bhxh_employee" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bhyt_employee" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bhtn_employee" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "total_insurance_employee" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "taxable_income" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "personal_deduction" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "dependent_deduction" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "dependent_count" INTEGER NOT NULL DEFAULT 0,
    "assessable_income" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "pit" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,0) NOT NULL,
    "net_salary" DECIMAL(15,0) NOT NULL,
    "bhxh_employer" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bhyt_employer" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bhtn_employer" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "total_employer_cost" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "bank_account" TEXT,
    "bank_name" TEXT,
    "bank_code" "BankCode",
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" TEXT NOT NULL,
    "payroll_id" TEXT NOT NULL,
    "component_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "PayrollComponentCategory" NOT NULL,
    "item_type" "PayrollItemType" NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "quantity" DECIMAL(10,2),
    "rate" DECIMAL(15,0),
    "multiplier" DECIMAL(3,2),
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_insuranceable" BOOLEAN NOT NULL DEFAULT false,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "adjustment_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_adjustments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PayrollComponentCategory" NOT NULL,
    "item_type" "PayrollItemType" NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reason" TEXT NOT NULL,
    "attachment_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_payment_batches" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "bank_code" "BankCode" NOT NULL,
    "bank_name" TEXT NOT NULL,
    "total_records" INTEGER NOT NULL,
    "total_amount" DECIMAL(18,0) NOT NULL,
    "file_name" TEXT,
    "file_url" TEXT,
    "file_format" TEXT,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generated_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "processed_by" TEXT,
    "bank_reference" TEXT,
    "success_count" INTEGER,
    "failed_count" INTEGER,
    "bank_response_file" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_payment_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payroll_configs_tenant_id_effective_from_idx" ON "payroll_configs"("tenant_id", "effective_from");

-- CreateIndex
CREATE INDEX "payroll_configs_tenant_id_is_active_idx" ON "payroll_configs"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "salary_components_tenant_id_is_active_idx" ON "salary_components"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "salary_components_tenant_id_category_idx" ON "salary_components"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "salary_components_tenant_id_code_key" ON "salary_components"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "payroll_periods_tenant_id_status_idx" ON "payroll_periods"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payroll_periods_tenant_id_year_month_idx" ON "payroll_periods"("tenant_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_tenant_id_year_month_key" ON "payroll_periods"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "payrolls_tenant_id_period_id_idx" ON "payrolls"("tenant_id", "period_id");

-- CreateIndex
CREATE INDEX "payrolls_tenant_id_employee_id_idx" ON "payrolls"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payrolls_period_id_status_idx" ON "payrolls"("period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_period_id_employee_id_key" ON "payrolls"("period_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_items_payroll_id_idx" ON "payroll_items"("payroll_id");

-- CreateIndex
CREATE INDEX "payroll_items_payroll_id_item_type_idx" ON "payroll_items"("payroll_id", "item_type");

-- CreateIndex
CREATE INDEX "payroll_adjustments_tenant_id_year_month_idx" ON "payroll_adjustments"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "payroll_adjustments_tenant_id_employee_id_idx" ON "payroll_adjustments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_adjustments_tenant_id_status_idx" ON "payroll_adjustments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "bank_payment_batches_tenant_id_period_id_idx" ON "bank_payment_batches"("tenant_id", "period_id");

-- CreateIndex
CREATE INDEX "bank_payment_batches_tenant_id_status_idx" ON "bank_payment_batches"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "bank_payment_batches_tenant_id_batch_number_key" ON "bank_payment_batches"("tenant_id", "batch_number");

-- AddForeignKey
ALTER TABLE "payroll_configs" ADD CONSTRAINT "payroll_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "salary_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_payment_batches" ADD CONSTRAINT "bank_payment_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_payment_batches" ADD CONSTRAINT "bank_payment_batches_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_payment_batches" ADD CONSTRAINT "bank_payment_batches_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
