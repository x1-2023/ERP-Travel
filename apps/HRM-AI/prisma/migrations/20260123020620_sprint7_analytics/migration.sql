-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('HEADCOUNT', 'TURNOVER', 'ATTENDANCE', 'LABOR_COST', 'PRODUCTIVITY', 'LEAVE_USAGE', 'OVERTIME');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "period" "MetricPeriod" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT,
    "value" DECIMAL(18,4) NOT NULL,
    "previous_value" DECIMAL(18,4),
    "change_percent" DECIMAL(8,2),
    "breakdown" JSONB,
    "metadata" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnover_predictions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "risk_score" DECIMAL(5,2) NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "factors" JSONB NOT NULL,
    "recommendations" JSONB,
    "predicted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnover_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "widget_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "data_source" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_reports" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data_source" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "filters" JSONB,
    "sorting" JSONB,
    "grouping" JSONB,
    "aggregations" JSONB,
    "is_scheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_benchmarks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "department" TEXT,
    "market_min" DECIMAL(18,2) NOT NULL,
    "market_mid" DECIMAL(18,2) NOT NULL,
    "market_max" DECIMAL(18,2) NOT NULL,
    "internal_avg" DECIMAL(18,2),
    "internal_min" DECIMAL(18,2),
    "internal_max" DECIMAL(18,2),
    "employee_count" INTEGER,
    "source" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_metrics_tenant_id_metric_type_period_idx" ON "analytics_metrics"("tenant_id", "metric_type", "period");

-- CreateIndex
CREATE INDEX "analytics_metrics_tenant_id_period_start_idx" ON "analytics_metrics"("tenant_id", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_metrics_tenant_id_metric_type_period_period_start_key" ON "analytics_metrics"("tenant_id", "metric_type", "period", "period_start", "department_id");

-- CreateIndex
CREATE INDEX "turnover_predictions_tenant_id_risk_level_idx" ON "turnover_predictions"("tenant_id", "risk_level");

-- CreateIndex
CREATE INDEX "turnover_predictions_tenant_id_employee_id_idx" ON "turnover_predictions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "dashboards_tenant_id_user_id_idx" ON "dashboards"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "dashboard_widgets_dashboard_id_idx" ON "dashboard_widgets"("dashboard_id");

-- CreateIndex
CREATE INDEX "analytics_reports_tenant_id_user_id_idx" ON "analytics_reports"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "salary_benchmarks_tenant_id_position_idx" ON "salary_benchmarks"("tenant_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "salary_benchmarks_tenant_id_position_level_department_valid_key" ON "salary_benchmarks"("tenant_id", "position", "level", "department", "valid_from");

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnover_predictions" ADD CONSTRAINT "turnover_predictions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnover_predictions" ADD CONSTRAINT "turnover_predictions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_benchmarks" ADD CONSTRAINT "salary_benchmarks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
