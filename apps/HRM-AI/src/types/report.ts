export interface ReportParams {
  reportType: string;
  title: string;
  parameters: {
    startDate: string;
    endDate: string;
    departmentId?: string;
    groupBy?: string;
  };
}

export interface ReportResult {
  title: string;
  summary: Record<string, string | number>;
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  generatedAt: Date;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string | null;
  reportType: string;
  parameters: Record<string, unknown>;
  isScheduled: boolean;
  cronExpression?: string | null;
  lastRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
