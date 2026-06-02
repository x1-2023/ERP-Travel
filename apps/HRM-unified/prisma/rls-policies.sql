-- prisma/rls-policies.sql
-- PostgreSQL Row-Level Security (RLS) for multi-tenant isolation (P2-23)
-- Run this migration after schema is applied.
--
-- HOW IT WORKS:
-- 1. Application sets a session variable: SET app.current_tenant_id = 'xxx'
-- 2. RLS policies filter rows where tenant_id = current_setting('app.current_tenant_id')
-- 3. Even if app code has a bug, database won't leak cross-tenant data
--
-- IMPORTANT: The Prisma user must NOT be a superuser (superusers bypass RLS).
-- Create a separate app role if needed:
--   CREATE ROLE app_user LOGIN PASSWORD 'xxx';
--   GRANT USAGE ON SCHEMA public TO app_user;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- ═══════════════════════════════════════════════════════════════
-- Helper function: get current tenant ID from session variable
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════
-- Enable RLS on all tenant-scoped tables
-- ═══════════════════════════════════════════════════════════════

-- Core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Time & Attendance
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_anomalies ENABLE ROW LEVEL SECURITY;

-- Payroll
ALTER TABLE payroll_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_payment_batches ENABLE ROW LEVEL SECURITY;

-- ESS & Workflow
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_update_requests ENABLE ROW LEVEL SECURITY;

-- Compliance
ALTER TABLE employee_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settlements ENABLE ROW LEVEL SECURITY;

-- Phase 7 new tables
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE erasure_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- Create RLS policies (tenant isolation)
-- Pattern: tenant_id = current_tenant_id() for all CRUD operations
-- ═══════════════════════════════════════════════════════════════

-- Macro-like approach: create policies for each table
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'users', 'employees', 'departments', 'positions', 'branches',
    'contracts', 'audit_logs', 'shifts', 'shift_assignments',
    'work_schedules', 'holidays', 'attendances', 'overtime_requests',
    'attendance_summaries', 'attendance_anomalies',
    'payroll_configs', 'salary_components', 'payroll_periods',
    'payrolls', 'payroll_adjustments', 'bank_payment_batches',
    'leave_policies', 'leave_balances', 'leave_requests',
    'workflow_definitions', 'workflow_instances', 'delegations',
    'notifications', 'profile_update_requests',
    'employee_insurances', 'insurance_reports', 'tax_settlements',
    'custom_roles', 'erasure_requests', 'retention_policies'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Drop existing policy if any
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);

    -- Create SELECT policy
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
       FOR ALL
       USING (tenant_id = current_tenant_id())
       WITH CHECK (tenant_id = current_tenant_id())',
      tbl
    );
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Special policies for tables without tenant_id
-- (These are child tables linked through parent)
-- ═══════════════════════════════════════════════════════════════

-- dependents: linked through employees
DROP POLICY IF EXISTS tenant_isolation ON dependents;
CREATE POLICY tenant_isolation ON dependents
  FOR ALL
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE tenant_id = current_tenant_id()
    )
  );

-- employee_change_history: linked through employees
ALTER TABLE employee_change_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON employee_change_history;
CREATE POLICY tenant_isolation ON employee_change_history
  FOR ALL
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE tenant_id = current_tenant_id()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Bypass policy for admin/migration user
-- This allows the migration user to access all data
-- ═══════════════════════════════════════════════════════════════

-- Uncomment if you have a separate admin role:
-- ALTER TABLE users FORCE ROW LEVEL SECURITY;
-- CREATE POLICY admin_bypass ON users TO admin_role USING (true);

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Check which tables have RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;

-- Check policies:
-- SELECT tablename, policyname, permissive, cmd, qual FROM pg_policies WHERE schemaname = 'public';

-- Test:
-- SET app.current_tenant_id = 'your-tenant-id';
-- SELECT * FROM employees; -- Should only return rows for that tenant
