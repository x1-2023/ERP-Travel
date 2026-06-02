// compensation-planning/components/index.tsx

/**
 * LAC VIET HR - Compensation Planning UI Components
 * React components for compensation management
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  CompensationCycle,
  CompensationCycleStatus,
  CompensationAdjustment,
  AdjustmentType,
  ApprovalStatus,
  MeritMatrix,
  MeritMatrixCell,
  BudgetPoolAllocation,
  CompensationAnalytics,
  SalaryGrade,
  CompaRatioCategory,
} from '../types/compensation.types';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPENSATION DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface CompensationDashboardProps {
  cycle: CompensationCycle;
  analytics: CompensationAnalytics;
  onViewDetails: (section: string) => void;
}

export const CompensationDashboard: React.FC<CompensationDashboardProps> = ({
  cycle,
  analytics,
  onViewDetails,
}) => {
  const statusColors: Record<CompensationCycleStatus, string> = {
    [CompensationCycleStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [CompensationCycleStatus.PLANNING]: 'bg-blue-100 text-blue-800',
    [CompensationCycleStatus.REVIEW]: 'bg-yellow-100 text-yellow-800',
    [CompensationCycleStatus.APPROVAL]: 'bg-orange-100 text-orange-800',
    [CompensationCycleStatus.APPROVED]: 'bg-green-100 text-green-800',
    [CompensationCycleStatus.IMPLEMENTED]: 'bg-purple-100 text-purple-800',
    [CompensationCycleStatus.CLOSED]: 'bg-gray-200 text-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cycle.name}</h1>
            <p className="text-gray-500 mt-1">
              FY {cycle.fiscalYear} • {cycle.cycleType} • Effective: {new Date(cycle.effectiveDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[cycle.status]}`}>
            {cycle.status.replace('_', ' ')}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-6">
          <CycleTimeline cycle={cycle} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Budget"
          value={formatCurrency(analytics.budgetSummary.totalBudget)}
          subtitle={`${analytics.budgetSummary.utilizationPercentage.toFixed(1)}% utilized`}
          icon="💰"
          onClick={() => onViewDetails('budget')}
        />
        <SummaryCard
          title="Eligible Employees"
          value={cycle.participantCount.toString()}
          subtitle={`${analytics.adjustmentSummary.employeesWithAdjustments} with adjustments`}
          icon="👥"
          onClick={() => onViewDetails('employees')}
        />
        <SummaryCard
          title="Avg Increase"
          value={`${analytics.adjustmentSummary.averageIncreasePercentage.toFixed(1)}%`}
          subtitle={`Median: ${analytics.adjustmentSummary.medianIncreasePercentage.toFixed(1)}%`}
          icon="📈"
          onClick={() => onViewDetails('increases')}
        />
        <SummaryCard
          title="Pending Approvals"
          value={analytics.adjustmentSummary.byType.reduce((sum, t) => sum + t.count, 0).toString()}
          subtitle="Awaiting review"
          icon="⏳"
          onClick={() => onViewDetails('approvals')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetUtilizationChart analytics={analytics} />
        <CompaRatioDistributionChart analytics={analytics} />
      </div>

      {/* Adjustment Types Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjustments by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.adjustmentSummary.byType
            .filter(t => t.count > 0)
            .map(type => (
              <div key={type.type} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">{formatAdjustmentType(type.type)}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{type.count}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(type.totalAmount)} total
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLE TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

interface CycleTimelineProps {
  cycle: CompensationCycle;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({ cycle }) => {
  const phases = [
    { name: 'Planning', start: cycle.planningStartDate, end: cycle.planningEndDate, status: 'PLANNING' },
    { name: 'Manager Review', start: cycle.managerReviewStartDate, end: cycle.managerReviewEndDate, status: 'REVIEW' },
    { name: 'Approval', start: cycle.approvalStartDate, end: cycle.approvalEndDate, status: 'APPROVAL' },
  ];

  const today = new Date();

  return (
    <div className="flex items-center space-x-2">
      {phases.map((phase, index) => {
        const startDate = new Date(phase.start);
        const endDate = new Date(phase.end);
        const isActive = today >= startDate && today <= endDate;
        const isComplete = today > endDate;
        const isFuture = today < startDate;

        return (
          <React.Fragment key={phase.name}>
            <div className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  isComplete ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
              <div className="mt-2 text-xs text-center">
                <div className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {phase.name}
                </div>
                <div className="text-gray-400">
                  {startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} -{' '}
                  {endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            </div>
            {index < phases.length - 1 && (
              <div className="w-4 h-0.5 bg-gray-200" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MERIT MATRIX
// ═══════════════════════════════════════════════════════════════════════════════

interface MeritMatrixGridProps {
  matrix: MeritMatrix;
  onCellClick?: (cell: MeritMatrixCell) => void;
  editable?: boolean;
  onCellChange?: (cellId: string, value: number) => void;
}

export const MeritMatrixGrid: React.FC<MeritMatrixGridProps> = ({
  matrix,
  onCellClick,
  editable = false,
  onCellChange,
}) => {
  const performanceLabels: Record<string, string> = {
    '1': 'Vượt trội',
    '2': 'Đạt+',
    '3': 'Đạt',
    '4': 'Cần cải thiện',
    '5': 'Không đạt',
  };

  const compaRatioRanges = matrix.compaRatioRanges as Array<{
    id: string;
    label: string;
    min: number;
    max: number;
  }>;

  const getCellValue = (perfRating: string, rangeId: string): MeritMatrixCell | undefined => {
    return matrix.cells.find(
      c => c.performanceRating === perfRating && c.compaRatioRangeId === rangeId
    );
  };

  const getCellColor = (percentage: number): string => {
    if (percentage >= 7) return 'bg-green-100 border-green-300';
    if (percentage >= 5) return 'bg-blue-100 border-blue-300';
    if (percentage >= 3) return 'bg-yellow-100 border-yellow-300';
    if (percentage > 0) return 'bg-orange-100 border-orange-300';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Merit Increase Matrix</h3>
        <p className="text-sm text-gray-500 mt-1">
          Recommended increase percentages based on performance and compa-ratio
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance / Compa-Ratio
              </th>
              {compaRatioRanges.map(range => (
                <th
                  key={range.id}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {range.label}
                  <div className="font-normal text-gray-400">
                    {range.min}% - {range.max}%
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {matrix.performanceRatings.map(rating => (
              <tr key={rating}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {performanceLabels[rating] || rating}
                </td>
                {compaRatioRanges.map(range => {
                  const cell = getCellValue(rating, range.id);
                  const value = cell?.targetIncreasePercentage || 0;

                  return (
                    <td key={range.id} className="px-4 py-3">
                      <div
                        className={`${getCellColor(value)} border rounded-lg p-3 text-center cursor-pointer
                          hover:shadow-md transition-shadow`}
                        onClick={() => cell && onCellClick?.(cell)}
                      >
                        {editable ? (
                          <input
                            type="number"
                            value={value}
                            onChange={e =>
                              cell && onCellChange?.(cell.id, parseFloat(e.target.value))
                            }
                            className="w-16 text-center bg-transparent border-none text-lg font-bold"
                            step="0.5"
                            min="0"
                            max="20"
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-800">{value}%</span>
                        )}
                        {cell && (
                          <div className="text-xs text-gray-500 mt-1">
                            {cell.minIncreasePercentage}% - {cell.maxIncreasePercentage}%
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500">Legend:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span>7%+</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
            <span>5-7%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
            <span>3-5%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
            <span>0-3%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADJUSTMENT FORM
// ═══════════════════════════════════════════════════════════════════════════════

interface AdjustmentFormProps {
  cycleId: string;
  employee: {
    id: string;
    name: string;
    currentSalary: number;
    currentGrade: SalaryGrade;
    compaRatio: number;
    performanceRating: string;
  };
  matrixRecommendation?: number;
  onSubmit: (adjustment: Partial<CompensationAdjustment>) => void;
  onCancel: () => void;
}

export const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
  cycleId,
  employee,
  matrixRecommendation,
  onSubmit,
  onCancel,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(AdjustmentType.MERIT_INCREASE);
  const [increasePercentage, setIncreasePercentage] = useState(matrixRecommendation || 0);
  const [increaseAmount, setIncreaseAmount] = useState(0);
  const [justification, setJustification] = useState('');
  const [bonusAmount, setBonusAmount] = useState<number | undefined>();

  const newSalary = employee.currentSalary + (employee.currentSalary * increasePercentage) / 100;
  const newCompaRatio = employee.currentGrade.midpointSalary
    ? (newSalary / employee.currentGrade.midpointSalary) * 100
    : 0;

  const handlePercentageChange = (value: number) => {
    setIncreasePercentage(value);
    setIncreaseAmount(Math.round((employee.currentSalary * value) / 100));
  };

  const handleAmountChange = (value: number) => {
    setIncreaseAmount(value);
    setIncreasePercentage(
      employee.currentSalary > 0 ? (value / employee.currentSalary) * 100 : 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cycleId,
      employeeId: employee.id,
      adjustmentType,
      proposedIncreasePercentage: increasePercentage,
      proposedIncreaseAmount: increaseAmount,
      bonusAmount,
      justification,
      effectiveDate: new Date(),
    });
  };

  const varianceFromMatrix = matrixRecommendation
    ? increasePercentage - matrixRecommendation
    : 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Propose Adjustment</h3>
        <p className="text-sm text-gray-500">{employee.name}</p>
      </div>

      {/* Current Compensation */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-500">Current Salary</div>
          <div className="text-lg font-semibold">{formatCurrency(employee.currentSalary)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Current Compa-Ratio</div>
          <div className="text-lg font-semibold">{employee.compaRatio.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Grade Range</div>
          <div className="text-sm">
            {formatCurrency(employee.currentGrade.minimumSalary)} -{' '}
            {formatCurrency(employee.currentGrade.maximumSalary)}
          </div>
        </div>
      </div>

      {/* Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
        <select
          value={adjustmentType}
          onChange={e => setAdjustmentType(e.target.value as AdjustmentType)}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value={AdjustmentType.MERIT_INCREASE}>Merit Increase</option>
          <option value={AdjustmentType.PROMOTION}>Promotion</option>
          <option value={AdjustmentType.MARKET_ADJUSTMENT}>Market Adjustment</option>
          <option value={AdjustmentType.EQUITY_ADJUSTMENT}>Equity Adjustment</option>
          <option value={AdjustmentType.ONE_TIME_BONUS}>One-Time Bonus</option>
          <option value={AdjustmentType.RETENTION_BONUS}>Retention Bonus</option>
        </select>
      </div>

      {/* Matrix Recommendation */}
      {matrixRecommendation !== undefined && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700">Matrix Recommendation</div>
              <div className="text-xl font-bold text-blue-900">{matrixRecommendation}%</div>
            </div>
            <button
              type="button"
              onClick={() => handlePercentageChange(matrixRecommendation)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Increase Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Increase Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              value={increasePercentage}
              onChange={e => handlePercentageChange(parseFloat(e.target.value) || 0)}
              step="0.5"
              min="0"
              max="50"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 pr-8"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Increase Amount</label>
          <input
            type="number"
            value={increaseAmount}
            onChange={e => handleAmountChange(parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      {/* Variance Warning */}
      {Math.abs(varianceFromMatrix) > 2 && (
        <div
          className={`p-3 rounded-lg ${
            varianceFromMatrix > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-orange-50 text-orange-800'
          }`}
        >
          <div className="font-medium">
            {varianceFromMatrix > 0 ? '⚠️ Above' : '⚠️ Below'} Matrix Guideline
          </div>
          <div className="text-sm">
            Variance: {varianceFromMatrix > 0 ? '+' : ''}
            {varianceFromMatrix.toFixed(1)}% from recommendation. Justification required.
          </div>
        </div>
      )}

      {/* New Values Preview */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
        <div>
          <div className="text-sm text-green-700">New Salary</div>
          <div className="text-xl font-bold text-green-900">{formatCurrency(newSalary)}</div>
        </div>
        <div>
          <div className="text-sm text-green-700">New Compa-Ratio</div>
          <div className="text-xl font-bold text-green-900">{newCompaRatio.toFixed(1)}%</div>
        </div>
      </div>

      {/* Bonus (for bonus types) */}
      {[AdjustmentType.ONE_TIME_BONUS, AdjustmentType.RETENTION_BONUS, AdjustmentType.SPOT_BONUS].includes(
        adjustmentType
      ) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Amount</label>
          <input
            type="number"
            value={bonusAmount || ''}
            onChange={e => setBonusAmount(parseInt(e.target.value) || undefined)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      )}

      {/* Justification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Justification {Math.abs(varianceFromMatrix) > 2 && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={justification}
          onChange={e => setJustification(e.target.value)}
          rows={4}
          required={Math.abs(varianceFromMatrix) > 2}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Provide justification for this adjustment..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit Adjustment
        </button>
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADJUSTMENT LIST
// ═══════════════════════════════════════════════════════════════════════════════

interface AdjustmentListProps {
  adjustments: CompensationAdjustment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (adjustment: CompensationAdjustment) => void;
  showActions?: boolean;
}

export const AdjustmentList: React.FC<AdjustmentListProps> = ({
  adjustments,
  onApprove,
  onReject,
  onView,
  showActions = true,
}) => {
  const statusColors: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ApprovalStatus.APPROVED]: 'bg-green-100 text-green-800',
    [ApprovalStatus.REJECTED]: 'bg-red-100 text-red-800',
    [ApprovalStatus.REVISION_REQUIRED]: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Current
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Proposed
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Change
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {adjustments.map(adjustment => (
            <tr key={adjustment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div
                  className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => onView(adjustment)}
                >
                  {(adjustment as any).employee?.firstName} {(adjustment as any).employee?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {(adjustment as any).employee?.department?.name}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatAdjustmentType(adjustment.adjustmentType)}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">
                {formatCurrency(adjustment.currentBaseSalary)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                {formatCurrency(adjustment.newBaseSalary)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-sm font-medium text-green-600">
                  +{adjustment.proposedIncreasePercentage?.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  +{formatCurrency(adjustment.proposedIncreaseAmount || 0)}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${statusColors[adjustment.status]}`}
                >
                  {adjustment.status}
                </span>
              </td>
              {showActions && adjustment.status === ApprovalStatus.PENDING && (
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onApprove(adjustment.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(adjustment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Reject
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET CHART
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetUtilizationChartProps {
  analytics: CompensationAnalytics;
}

const BudgetUtilizationChart: React.FC<BudgetUtilizationChartProps> = ({ analytics }) => {
  const { budgetSummary } = analytics;
  const usedPercentage = budgetSummary.utilizationPercentage;
  const remainingPercentage = 100 - usedPercentage;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h3>

      {/* Progress Bar */}
      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${usedPercentage > 90 ? 'bg-red-500' : usedPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(usedPercentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-600">
          Used: {formatCurrency(budgetSummary.usedBudget)} ({usedPercentage.toFixed(1)}%)
        </span>
        <span className="text-gray-600">
          Remaining: {formatCurrency(budgetSummary.remainingBudget)}
        </span>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(budgetSummary.totalBudget)}
          </div>
          <div className="text-sm text-gray-500">Total Budget</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(budgetSummary.allocatedBudget)}
          </div>
          <div className="text-sm text-gray-500">Allocated</div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPA-RATIO DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════════

interface CompaRatioDistributionChartProps {
  analytics: CompensationAnalytics;
}

const CompaRatioDistributionChart: React.FC<CompaRatioDistributionChartProps> = ({ analytics }) => {
  const { compaRatioAnalysis } = analytics;

  const categoryLabels: Record<CompaRatioCategory, string> = {
    [CompaRatioCategory.BELOW_RANGE]: 'Below Range (<80%)',
    [CompaRatioCategory.LOWER_QUARTILE]: 'Lower Quartile (80-90%)',
    [CompaRatioCategory.MID_RANGE]: 'Mid Range (90-110%)',
    [CompaRatioCategory.UPPER_QUARTILE]: 'Upper Quartile (110-120%)',
    [CompaRatioCategory.ABOVE_RANGE]: 'Above Range (>120%)',
  };

  const categoryColors: Record<CompaRatioCategory, string> = {
    [CompaRatioCategory.BELOW_RANGE]: 'bg-red-500',
    [CompaRatioCategory.LOWER_QUARTILE]: 'bg-orange-500',
    [CompaRatioCategory.MID_RANGE]: 'bg-green-500',
    [CompaRatioCategory.UPPER_QUARTILE]: 'bg-blue-500',
    [CompaRatioCategory.ABOVE_RANGE]: 'bg-purple-500',
  };

  const maxCount = Math.max(...compaRatioAnalysis.compaRatioDistribution.map(d => d.count));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compa-Ratio Distribution</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-900">
            {compaRatioAnalysis.averageCompaRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-700">Average</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-900">
            {compaRatioAnalysis.medianCompaRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-green-700">Median</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {compaRatioAnalysis.compaRatioDistribution.map(item => (
          <div key={item.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{categoryLabels[item.category]}</span>
              <span className="font-medium">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${categoryColors[item.category]}`}
                style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, onClick }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatAdjustmentType(type: AdjustmentType): string {
  const labels: Record<AdjustmentType, string> = {
    [AdjustmentType.MERIT_INCREASE]: 'Merit Increase',
    [AdjustmentType.PROMOTION]: 'Promotion',
    [AdjustmentType.MARKET_ADJUSTMENT]: 'Market Adjustment',
    [AdjustmentType.EQUITY_ADJUSTMENT]: 'Equity Adjustment',
    [AdjustmentType.COST_OF_LIVING]: 'Cost of Living',
    [AdjustmentType.ONE_TIME_BONUS]: 'One-Time Bonus',
    [AdjustmentType.ANNUAL_BONUS]: 'Annual Bonus',
    [AdjustmentType.RETENTION_BONUS]: 'Retention Bonus',
    [AdjustmentType.SIGN_ON_BONUS]: 'Sign-On Bonus',
    [AdjustmentType.SPOT_BONUS]: 'Spot Bonus',
    [AdjustmentType.STOCK_GRANT]: 'Stock Grant',
    [AdjustmentType.STOCK_OPTION]: 'Stock Option',
  };
  return labels[type] || type;
}

export { formatCurrency, formatAdjustmentType };
