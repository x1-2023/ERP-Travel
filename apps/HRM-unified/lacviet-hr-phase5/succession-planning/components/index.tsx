// succession-planning/components/index.tsx

/**
 * LAC VIET HR - Succession Planning UI Components
 * React components for succession and talent management
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  CriticalPosition,
  PositionCriticality,
  TalentProfile,
  TalentCategory,
  NineBoxPosition,
  FlightRisk,
  RiskLevel,
  SuccessionPlan,
  SuccessorCandidate,
  SuccessorReadiness,
  DevelopmentPlan,
  DevelopmentActivity,
  SuccessionAnalytics,
  SuccessionDashboardData,
} from '../types/succession.types';

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSION DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface SuccessionDashboardProps {
  data: SuccessionDashboardData;
  onViewPosition: (id: string) => void;
  onViewTalent: (id: string) => void;
}

export const SuccessionDashboard: React.FC<SuccessionDashboardProps> = ({
  data,
  onViewPosition,
  onViewTalent,
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Critical Positions"
          value={data.summary.criticalPositionsCount.toString()}
          subtitle={`${data.summary.criticalPositionsWithSuccessors} with successors`}
          icon="🎯"
          color="blue"
        />
        <SummaryCard
          title="Ready Now Successors"
          value={data.summary.readyNowSuccessors.toString()}
          subtitle={`Avg bench: ${data.summary.avgBenchStrength}%`}
          icon="✅"
          color="green"
        />
        <SummaryCard
          title="High Potentials"
          value={data.summary.highPotentialsCount.toString()}
          subtitle="In talent pipeline"
          icon="⭐"
          color="purple"
        />
        <SummaryCard
          title="At Risk Positions"
          value={data.summary.atRiskPositions.toString()}
          subtitle="Need attention"
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Critical Positions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Critical Positions Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Incumbent
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Bench Strength
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Ready Now
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.criticalPositionsList.map(position => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => onViewPosition(position.id)}
                    >
                      {position.title}
                    </div>
                    <div className="text-xs text-gray-500">{position.department}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{position.incumbent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <BenchStrengthBar value={position.benchStrength} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      position.readyNow > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {position.readyNow}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RiskBadge level={position.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Reviews */}
      {data.upcomingReviews.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reviews</h2>
          <div className="space-y-3">
            {data.upcomingReviews.slice(0, 5).map(review => (
              <div key={review.planId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">{review.positionTitle}</div>
                  <div className="text-sm text-gray-500">Owner: {review.owner}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NINE BOX GRID - Key Component
// ═══════════════════════════════════════════════════════════════════════════════

interface NineBoxGridProps {
  data: {
    position: NineBoxPosition;
    count: number;
    employees: Array<{ id: string; name: string; position: string }>;
  }[];
  onEmployeeClick?: (employeeId: string) => void;
  onBoxClick?: (position: NineBoxPosition) => void;
  selectedBox?: NineBoxPosition;
}

export const NineBoxGrid: React.FC<NineBoxGridProps> = ({
  data,
  onEmployeeClick,
  onBoxClick,
  selectedBox,
}) => {
  // 9-Box configuration
  const boxConfig: Record<NineBoxPosition, { 
    name: string; 
    description: string; 
    color: string; 
    bgColor: string;
    row: number;
    col: number;
  }> = {
    [NineBoxPosition.HIGH_PERFORMER_HIGH_POTENTIAL]: {
      name: 'Stars',
      description: 'Future Leaders',
      color: 'text-green-800',
      bgColor: 'bg-green-100 hover:bg-green-200 border-green-300',
      row: 0,
      col: 2,
    },
    [NineBoxPosition.HIGH_PERFORMER_MODERATE_POTENTIAL]: {
      name: 'High Professionals',
      description: 'Key Contributors',
      color: 'text-green-700',
      bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
      row: 0,
      col: 1,
    },
    [NineBoxPosition.HIGH_PERFORMER_LIMITED_POTENTIAL]: {
      name: 'Trusted Professionals',
      description: 'Solid Contributors',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      row: 0,
      col: 0,
    },
    [NineBoxPosition.MODERATE_PERFORMER_HIGH_POTENTIAL]: {
      name: 'Growth Employees',
      description: 'Emerging Stars',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
      row: 1,
      col: 2,
    },
    [NineBoxPosition.MODERATE_PERFORMER_MODERATE_POTENTIAL]: {
      name: 'Core Players',
      description: 'Backbone of Org',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200 border-gray-300',
      row: 1,
      col: 1,
    },
    [NineBoxPosition.MODERATE_PERFORMER_LIMITED_POTENTIAL]: {
      name: 'Effective',
      description: 'Steady Performers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      row: 1,
      col: 0,
    },
    [NineBoxPosition.LOW_PERFORMER_HIGH_POTENTIAL]: {
      name: 'Inconsistent',
      description: 'Diamond in Rough',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
      row: 2,
      col: 2,
    },
    [NineBoxPosition.LOW_PERFORMER_MODERATE_POTENTIAL]: {
      name: 'Up or Out',
      description: 'Needs Improvement',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      row: 2,
      col: 1,
    },
    [NineBoxPosition.LOW_PERFORMER_LIMITED_POTENTIAL]: {
      name: 'Talent Risk',
      description: 'Consider Action',
      color: 'text-red-700',
      bgColor: 'bg-red-100 hover:bg-red-200 border-red-300',
      row: 2,
      col: 0,
    },
  };

  const getBoxData = (position: NineBoxPosition) => {
    return data.find(d => d.position === position) || { position, count: 0, employees: [] };
  };

  const renderBox = (position: NineBoxPosition) => {
    const config = boxConfig[position];
    const boxData = getBoxData(position);
    const isSelected = selectedBox === position;

    return (
      <div
        key={position}
        className={`
          ${config.bgColor} border-2 rounded-lg p-4 min-h-[140px] cursor-pointer
          transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
        onClick={() => onBoxClick?.(position)}
      >
        <div className={`text-sm font-semibold ${config.color}`}>{config.name}</div>
        <div className="text-xs text-gray-500 mb-2">{config.description}</div>
        <div className={`text-3xl font-bold ${config.color}`}>{boxData.count}</div>
        
        {/* Mini employee list */}
        {boxData.employees.length > 0 && (
          <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
            {boxData.employees.slice(0, 3).map(emp => (
              <div
                key={emp.id}
                className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer truncate"
                onClick={(e) => {
                  e.stopPropagation();
                  onEmployeeClick?.(emp.id);
                }}
              >
                {emp.name}
              </div>
            ))}
            {boxData.employees.length > 3 && (
              <div className="text-xs text-gray-400">+{boxData.employees.length - 3} more</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Build grid matrix
  const gridPositions: NineBoxPosition[][] = [
    [NineBoxPosition.HIGH_PERFORMER_LIMITED_POTENTIAL, NineBoxPosition.HIGH_PERFORMER_MODERATE_POTENTIAL, NineBoxPosition.HIGH_PERFORMER_HIGH_POTENTIAL],
    [NineBoxPosition.MODERATE_PERFORMER_LIMITED_POTENTIAL, NineBoxPosition.MODERATE_PERFORMER_MODERATE_POTENTIAL, NineBoxPosition.MODERATE_PERFORMER_HIGH_POTENTIAL],
    [NineBoxPosition.LOW_PERFORMER_LIMITED_POTENTIAL, NineBoxPosition.LOW_PERFORMER_MODERATE_POTENTIAL, NineBoxPosition.LOW_PERFORMER_HIGH_POTENTIAL],
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">9-Box Talent Grid</h2>
      
      <div className="flex">
        {/* Y-Axis Label */}
        <div className="flex flex-col justify-center items-center w-12 mr-2">
          <div className="text-sm font-medium text-gray-600 transform -rotate-90 whitespace-nowrap">
            Performance →
          </div>
        </div>

        <div className="flex-1">
          {/* Y-Axis Labels */}
          <div className="flex mb-2">
            <div className="w-20" />
            <div className="flex-1 text-center text-xs text-gray-500">Limited</div>
            <div className="flex-1 text-center text-xs text-gray-500">Moderate</div>
            <div className="flex-1 text-center text-xs text-gray-500">High</div>
          </div>

          <div className="flex">
            {/* Row Labels */}
            <div className="w-20 flex flex-col justify-around text-xs text-gray-500 pr-2">
              <span className="text-right">High</span>
              <span className="text-right">Moderate</span>
              <span className="text-right">Low</span>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-3 gap-2">
              {gridPositions.flat().map(position => renderBox(position))}
            </div>
          </div>

          {/* X-Axis Label */}
          <div className="text-center text-sm font-medium text-gray-600 mt-4">
            Potential →
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <div className="text-sm font-medium text-gray-700 mb-2">Actions by Box:</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            <span>Promote, Lead Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
            <span>Develop, Stretch Assignments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span>Coach or Transition</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TALENT PROFILE CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface TalentProfileCardProps {
  profile: TalentProfile;
  onEdit?: () => void;
  onViewDevelopment?: () => void;
  compact?: boolean;
}

export const TalentProfileCard: React.FC<TalentProfileCardProps> = ({
  profile,
  onEdit,
  onViewDevelopment,
  compact = false,
}) => {
  const nineBoxLabels: Record<NineBoxPosition, string> = {
    [NineBoxPosition.HIGH_PERFORMER_HIGH_POTENTIAL]: '⭐ Star',
    [NineBoxPosition.HIGH_PERFORMER_MODERATE_POTENTIAL]: '🌟 High Professional',
    [NineBoxPosition.HIGH_PERFORMER_LIMITED_POTENTIAL]: '💼 Trusted Professional',
    [NineBoxPosition.MODERATE_PERFORMER_HIGH_POTENTIAL]: '📈 Growth Employee',
    [NineBoxPosition.MODERATE_PERFORMER_MODERATE_POTENTIAL]: '⚙️ Core Player',
    [NineBoxPosition.MODERATE_PERFORMER_LIMITED_POTENTIAL]: '✓ Effective',
    [NineBoxPosition.LOW_PERFORMER_HIGH_POTENTIAL]: '💎 Inconsistent',
    [NineBoxPosition.LOW_PERFORMER_MODERATE_POTENTIAL]: '⚡ Up or Out',
    [NineBoxPosition.LOW_PERFORMER_LIMITED_POTENTIAL]: '⚠️ Talent Risk',
  };

  const flightRiskColors: Record<FlightRisk, string> = {
    [FlightRisk.VERY_HIGH]: 'bg-red-100 text-red-800',
    [FlightRisk.HIGH]: 'bg-orange-100 text-orange-800',
    [FlightRisk.MODERATE]: 'bg-yellow-100 text-yellow-800',
    [FlightRisk.LOW]: 'bg-green-100 text-green-800',
    [FlightRisk.VERY_LOW]: 'bg-gray-100 text-gray-800',
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
            {profile.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{profile.fullName}</div>
            <div className="text-sm text-gray-500 truncate">{profile.currentPositionTitle}</div>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${flightRiskColors[profile.flightRisk]}`}>
            {profile.flightRisk.replace('_', ' ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.fullName}</h3>
            <div className="text-blue-100">{profile.currentPositionTitle}</div>
            <div className="text-sm text-blue-200">{profile.departmentName}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-px bg-gray-200">
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{profile.performanceRating}</div>
          <div className="text-xs text-gray-500">Performance</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{profile.potentialRating}</div>
          <div className="text-xs text-gray-500">Potential</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{profile.yearsInCompany.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Years</div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="text-lg font-bold text-gray-900">
            {nineBoxLabels[profile.nineBoxPosition]}
          </div>
          <div className="text-xs text-gray-500">9-Box</div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        {/* Flight Risk */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Flight Risk</span>
          <span className={`px-2 py-1 rounded text-sm ${flightRiskColors[profile.flightRisk]}`}>
            {profile.flightRisk.replace('_', ' ')}
          </span>
        </div>

        {/* Promotion Readiness */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Promotion Readiness</span>
          <ReadinessBadge readiness={profile.promotionReadiness} />
        </div>

        {/* Mobility */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Geographic Mobility</span>
          <span className="text-sm text-gray-900">
            {(profile.mobilityPreference as any)?.geographicMobility || 'N/A'}
          </span>
        </div>

        {/* Successor For */}
        {profile.successorForPositions.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Successor For</div>
            <div className="flex flex-wrap gap-1">
              {profile.successorForPositions.slice(0, 3).map((pos, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {pos}
                </span>
              ))}
              {profile.successorForPositions.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{profile.successorForPositions.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Development Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Development Activities</span>
            <span className="text-gray-900">
              {profile.completedDevelopmentActivities}/{profile.activeDevelopmentActivities + profile.completedDevelopmentActivities}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${
                  profile.activeDevelopmentActivities + profile.completedDevelopmentActivities > 0
                    ? (profile.completedDevelopmentActivities /
                        (profile.activeDevelopmentActivities + profile.completedDevelopmentActivities)) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex space-x-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit Profile
          </button>
        )}
        {onViewDevelopment && (
          <button
            onClick={onViewDevelopment}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Development Plan
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSION PLAN VIEW
// ═══════════════════════════════════════════════════════════════════════════════

interface SuccessionPlanViewProps {
  plan: SuccessionPlan;
  onAddSuccessor: () => void;
  onEditSuccessor: (successor: SuccessorCandidate) => void;
  onRemoveSuccessor: (successor: SuccessorCandidate) => void;
}

export const SuccessionPlanView: React.FC<SuccessionPlanViewProps> = ({
  plan,
  onAddSuccessor,
  onEditSuccessor,
  onRemoveSuccessor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <p className="text-gray-500 mt-1">
              {plan.criticalPosition.jobTitle} • {plan.criticalPosition.departmentName}
            </p>
          </div>
          <button
            onClick={onAddSuccessor}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Successor
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{plan.successors.length}</div>
            <div className="text-sm text-gray-500">Total Successors</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{plan.currentReadyNowCount}</div>
            <div className="text-sm text-green-600">Ready Now</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{plan.currentBenchStrength}%</div>
            <div className="text-sm text-blue-600">Bench Strength</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {plan.targetReadyNowCount - plan.currentReadyNowCount}
            </div>
            <div className="text-sm text-purple-600">Gap to Target</div>
          </div>
        </div>
      </div>

      {/* Successors Pipeline */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Succession Pipeline</h3>

        {plan.successors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">👤</div>
            <div>No successors identified yet</div>
            <button
              onClick={onAddSuccessor}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Add first successor
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plan.successors.map((successor, index) => (
              <SuccessorCard
                key={successor.id}
                successor={successor}
                rank={index + 1}
                onEdit={() => onEditSuccessor(successor)}
                onRemove={() => onRemoveSuccessor(successor)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSOR CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface SuccessorCardProps {
  successor: SuccessorCandidate;
  rank: number;
  onEdit: () => void;
  onRemove: () => void;
}

const SuccessorCard: React.FC<SuccessorCardProps> = ({ successor, rank, onEdit, onRemove }) => {
  const readinessColors: Record<SuccessorReadiness, string> = {
    [SuccessorReadiness.READY_NOW]: 'bg-green-100 text-green-800 border-green-300',
    [SuccessorReadiness.READY_1_YEAR]: 'bg-blue-100 text-blue-800 border-blue-300',
    [SuccessorReadiness.READY_2_YEARS]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [SuccessorReadiness.READY_3_PLUS]: 'bg-orange-100 text-orange-800 border-orange-300',
    [SuccessorReadiness.NOT_READY]: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600">
          #{rank}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{successor.talentProfile.fullName}</span>
            {successor.isEmergencySuccessor && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Emergency</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {successor.talentProfile.currentPositionTitle} • {successor.talentProfile.departmentName}
          </div>
        </div>

        {/* Readiness */}
        <div className={`px-3 py-1 rounded-full border text-sm ${readinessColors[successor.readiness]}`}>
          {successor.readiness.replace(/_/g, ' ')}
        </div>

        {/* Fit Score */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{successor.overallFitScore}%</div>
          <div className="text-xs text-gray-500">Fit Score</div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-600"
            title="Remove"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Competency Fit</div>
          <div className="font-medium">{successor.competencyFitScore}%</div>
        </div>
        <div>
          <div className="text-gray-500">Experience Fit</div>
          <div className="font-medium">{successor.experienceFitScore}%</div>
        </div>
        <div>
          <div className="text-gray-500">Flight Risk</div>
          <div className={`font-medium ${
            successor.flightRisk === FlightRisk.VERY_HIGH || successor.flightRisk === FlightRisk.HIGH
              ? 'text-red-600'
              : 'text-gray-900'
          }`}>
            {successor.flightRisk.replace('_', ' ')}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Development</div>
          <div className="font-medium">{successor.developmentProgress}% complete</div>
        </div>
      </div>

      {/* Gaps */}
      {(successor.competencyGaps.length > 0 || successor.experienceGaps.length > 0) && (
        <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
          <div className="font-medium text-yellow-800 mb-1">Development Gaps:</div>
          <div className="flex flex-wrap gap-1">
            {successor.competencyGaps.slice(0, 3).map((gap, i) => (
              <span key={i} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                {gap.competencyName}
              </span>
            ))}
            {successor.experienceGaps.slice(0, 2).map((gap, i) => (
              <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPMENT PLAN TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

interface DevelopmentPlanTrackerProps {
  plan: DevelopmentPlan;
  onUpdateActivity: (activityId: string, progress: number) => void;
  onAddActivity: () => void;
}

export const DevelopmentPlanTracker: React.FC<DevelopmentPlanTrackerProps> = ({
  plan,
  onUpdateActivity,
  onAddActivity,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <p className="text-gray-500 mt-1">
              Target: {plan.targetPositionTitle || 'General Development'}
            </p>
          </div>
          <button
            onClick={onAddActivity}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Activity
          </button>
        </div>

        {/* Overall Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{plan.overallProgress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${plan.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-xl font-bold text-gray-900">{plan.totalActivities}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-xl font-bold text-blue-700">{plan.inProgressActivities}</div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-xl font-bold text-green-700">{plan.completedActivities}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
        <div className="space-y-4">
          {plan.activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onUpdateProgress={(progress) => onUpdateActivity(activity.id, progress)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ActivityCardProps {
  activity: DevelopmentActivity;
  onUpdateProgress: (progress: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onUpdateProgress }) => {
  const statusColors: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DEFERRED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const typeIcons: Record<string, string> = {
    TRAINING: '📚',
    STRETCH_ASSIGNMENT: '🎯',
    JOB_ROTATION: '🔄',
    MENTORING: '👥',
    COACHING: '💬',
    SHADOWING: '👁️',
    PROJECT_LEAD: '📋',
    ACTING_ROLE: '🎭',
    EXTERNAL_COURSE: '🎓',
    CERTIFICATION: '📜',
    CONFERENCE: '🎤',
    NETWORKING: '🤝',
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{typeIcons[activity.type] || '📌'}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{activity.name}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${statusColors[activity.status]}`}>
              {activity.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
          
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-900">{activity.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${activity.progress}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>
              {new Date(activity.plannedStartDate).toLocaleDateString('vi-VN')} -{' '}
              {new Date(activity.plannedEndDate).toLocaleDateString('vi-VN')}
            </span>
            {activity.status === 'IN_PROGRESS' && (
              <button
                onClick={() => onUpdateProgress(100)}
                className="text-blue-600 hover:text-blue-800"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
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
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

interface BenchStrengthBarProps {
  value: number;
}

const BenchStrengthBar: React.FC<BenchStrengthBarProps> = ({ value }) => {
  const getColor = (v: number) => {
    if (v >= 70) return 'bg-green-500';
    if (v >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-24">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-xs text-center text-gray-500 mt-1">{value}%</div>
    </div>
  );
};

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const colors: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: 'bg-red-100 text-red-800',
    [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800',
    [RiskLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [RiskLevel.LOW]: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[level]}`}>
      {level}
    </span>
  );
};

interface ReadinessBadgeProps {
  readiness: SuccessorReadiness;
}

const ReadinessBadge: React.FC<ReadinessBadgeProps> = ({ readiness }) => {
  const config: Record<SuccessorReadiness, { label: string; color: string }> = {
    [SuccessorReadiness.READY_NOW]: { label: 'Ready Now', color: 'bg-green-100 text-green-800' },
    [SuccessorReadiness.READY_1_YEAR]: { label: '1 Year', color: 'bg-blue-100 text-blue-800' },
    [SuccessorReadiness.READY_2_YEARS]: { label: '2 Years', color: 'bg-yellow-100 text-yellow-800' },
    [SuccessorReadiness.READY_3_PLUS]: { label: '3+ Years', color: 'bg-orange-100 text-orange-800' },
    [SuccessorReadiness.NOT_READY]: { label: 'Not Ready', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[readiness];

  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
};

export { BenchStrengthBar, RiskBadge, ReadinessBadge };
