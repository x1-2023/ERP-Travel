// hooks/useCompensation.ts

/**
 * LAC VIET HR - Compensation Planning Hooks
 * React hooks for compensation management
 */

import { useState, useCallback, useEffect } from 'react';
import {
  CompensationCycle,
  CompensationCycleStatus,
  CompensationAdjustment,
  AdjustmentType,
  ApprovalStatus,
  MeritMatrix,
  CompensationAnalytics,
  SalaryGrade,
  CreateCompensationCycleDto,
  CreateAdjustmentDto,
  ApproveAdjustmentDto,
  AdjustmentFilters,
} from '../compensation/types/compensation.types';

const API_BASE = '/api/compensation';

// ═══════════════════════════════════════════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════════════════════════════════════════

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  const data = await response.json();
  return data.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPENSATION CYCLES HOOK
// ═══════════════════════════════════════════════════════════════════════════════

interface UseCompensationCyclesOptions {
  fiscalYear?: number;
  status?: CompensationCycleStatus;
  autoFetch?: boolean;
}

export function useCompensationCycles(options: UseCompensationCyclesOptions = {}) {
  const [cycles, setCycles] = useState<CompensationCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchCycles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.fiscalYear) params.append('fiscalYear', options.fiscalYear.toString());
      if (options.status) params.append('status', options.status);
      params.append('page', page.toString());

      const response = await fetch(`${API_BASE}/cycles?${params}`);
      const data = await response.json();

      setCycles(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.fiscalYear, options.status]);

  const createCycle = useCallback(async (data: CreateCompensationCycleDto) => {
    const cycle = await apiCall<CompensationCycle>('/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setCycles(prev => [cycle, ...prev]);
    return cycle;
  }, []);

  const updateCycleStatus = useCallback(async (cycleId: string, status: CompensationCycleStatus) => {
    const updated = await apiCall<CompensationCycle>(`/cycles/${cycleId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setCycles(prev => prev.map(c => (c.id === cycleId ? updated : c)));
    return updated;
  }, []);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchCycles();
    }
  }, [fetchCycles, options.autoFetch]);

  return {
    cycles,
    loading,
    error,
    pagination,
    fetchCycles,
    createCycle,
    updateCycleStatus,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE CYCLE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useCompensationCycle(cycleId: string | undefined) {
  const [cycle, setCycle] = useState<CompensationCycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCycle = useCallback(async () => {
    if (!cycleId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiCall<CompensationCycle>(`/cycles/${cycleId}`);
      setCycle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchCycle();
  }, [fetchCycle]);

  return { cycle, loading, error, refetch: fetchCycle };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADJUSTMENTS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useAdjustments(filters: AdjustmentFilters) {
  const [adjustments, setAdjustments] = useState<CompensationAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchAdjustments = useCallback(async (page = 1) => {
    if (!filters.cycleId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('cycleId', filters.cycleId);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.managerId) params.append('managerId', filters.managerId);
      if (filters.status) params.append('status', filters.status);
      if (filters.adjustmentType) params.append('adjustmentType', filters.adjustmentType);
      if (filters.employeeSearch) params.append('employeeSearch', filters.employeeSearch);
      params.append('page', page.toString());

      const response = await fetch(`${API_BASE}/adjustments?${params}`);
      const data = await response.json();

      setAdjustments(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createAdjustment = useCallback(async (data: CreateAdjustmentDto) => {
    const adjustment = await apiCall<CompensationAdjustment>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAdjustments(prev => [adjustment, ...prev]);
    return adjustment;
  }, []);

  const approveAdjustment = useCallback(async (data: ApproveAdjustmentDto) => {
    const updated = await apiCall<CompensationAdjustment>(`/adjustments/${data.adjustmentId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAdjustments(prev => prev.map(a => (a.id === data.adjustmentId ? updated : a)));
    return updated;
  }, []);

  const bulkApprove = useCallback(async (adjustmentIds: string[], comments?: string) => {
    const result = await apiCall<{ approvedCount: number }>('/adjustments/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ adjustmentIds, comments }),
    });
    await fetchAdjustments(pagination.page);
    return result.approvedCount;
  }, [fetchAdjustments, pagination.page]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  return {
    adjustments,
    loading,
    error,
    pagination,
    fetchAdjustments,
    createAdjustment,
    approveAdjustment,
    bulkApprove,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERIT MATRIX HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useMeritMatrix(cycleId: string | undefined) {
  const [matrix, setMatrix] = useState<MeritMatrix | null>(null);
  const [loading, setLoading] = useState(false);

  const createMatrix = useCallback(async (data: Partial<MeritMatrix>) => {
    if (!cycleId) return null;

    const created = await apiCall<MeritMatrix>(`/cycles/${cycleId}/merit-matrix`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setMatrix(created);
    return created;
  }, [cycleId]);

  const getRecommendation = useCallback(async (
    matrixId: string,
    performanceRating: string,
    compaRatio: number
  ) => {
    const params = new URLSearchParams({
      performanceRating,
      compaRatio: compaRatio.toString(),
    });
    return apiCall<{ targetIncreasePercentage: number }>(`/merit-matrix/${matrixId}/recommend?${params}`);
  }, []);

  return { matrix, loading, createMatrix, getRecommendation };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useBudget(cycleId: string | undefined) {
  const [budget, setBudget] = useState<{
    totalBudget: number;
    allocatedBudget: number;
    usedBudget: number;
    remainingBudget: number;
    byDepartment: Array<{
      departmentId: string;
      departmentName: string;
      allocated: number;
      used: number;
      remaining: number;
      utilization: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBudget = useCallback(async () => {
    if (!cycleId) return;

    setLoading(true);
    try {
      const data = await apiCall<typeof budget>(`/cycles/${cycleId}/budget`);
      setBudget(data);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  const updateAllocation = useCallback(async (departmentId: string, data: Partial<any>) => {
    if (!cycleId) return;

    await apiCall(`/cycles/${cycleId}/budget/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await fetchBudget();
  }, [cycleId, fetchBudget]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return { budget, loading, fetchBudget, updateAllocation };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useCompensationAnalytics(cycleId?: string) {
  const [analytics, setAnalytics] = useState<CompensationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = cycleId ? `?cycleId=${cycleId}` : '';
      const data = await apiCall<CompensationAnalytics>(`/analytics${params}`);
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, refetch: fetchAnalytics };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALARY GRADES HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSalaryGrades() {
  const [grades, setGrades] = useState<SalaryGrade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGrades = useCallback(async (includeInactive = false) => {
    setLoading(true);
    try {
      const params = includeInactive ? '?includeInactive=true' : '';
      const data = await apiCall<SalaryGrade[]>(`/salary-grades${params}`);
      setGrades(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGrade = useCallback(async (data: Partial<SalaryGrade>) => {
    const grade = await apiCall<SalaryGrade>('/salary-grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setGrades(prev => [...prev, grade].sort((a, b) => a.level - b.level));
    return grade;
  }, []);

  const updateGrade = useCallback(async (id: string, data: Partial<SalaryGrade>) => {
    const updated = await apiCall<SalaryGrade>(`/salary-grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setGrades(prev => prev.map(g => (g.id === id ? updated : g)));
    return updated;
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return { grades, loading, fetchGrades, createGrade, updateGrade };
}


// ═══════════════════════════════════════════════════════════════════════════════
// hooks/useSuccession.ts
// ═══════════════════════════════════════════════════════════════════════════════

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
  SuccessionAnalytics,
  SuccessionDashboardData,
  CreateCriticalPositionDto,
  CreateSuccessionPlanDto,
  AddSuccessorDto,
  UpdateTalentProfileDto,
  CreateDevelopmentPlanDto,
  TalentSearchFilters,
} from '../succession/types/succession.types';

const SUCCESSION_API_BASE = '/api/succession';

async function successionApiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${SUCCESSION_API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  const data = await response.json();
  return data.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL POSITIONS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

interface UseCriticalPositionsOptions {
  criticality?: PositionCriticality;
  departmentId?: string;
  hasSuccessors?: boolean;
  riskLevel?: RiskLevel;
}

export function useCriticalPositions(options: UseCriticalPositionsOptions = {}) {
  const [positions, setPositions] = useState<CriticalPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchPositions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.criticality) params.append('criticality', options.criticality);
      if (options.departmentId) params.append('departmentId', options.departmentId);
      if (options.hasSuccessors !== undefined) params.append('hasSuccessors', String(options.hasSuccessors));
      if (options.riskLevel) params.append('riskLevel', options.riskLevel);
      params.append('page', page.toString());

      const response = await fetch(`${SUCCESSION_API_BASE}/critical-positions?${params}`);
      const data = await response.json();

      setPositions(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const createPosition = useCallback(async (data: CreateCriticalPositionDto) => {
    const position = await successionApiCall<CriticalPosition>('/critical-positions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setPositions(prev => [position, ...prev]);
    return position;
  }, []);

  const assessRisk = useCallback(async (positionId: string) => {
    return successionApiCall<{ vacancyRisk: RiskLevel; benchStrength: number; riskFactors: string[] }>(
      `/critical-positions/${positionId}/assess-risk`,
      { method: 'POST' }
    );
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return { positions, loading, error, pagination, fetchPositions, createPosition, assessRisk };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TALENT PROFILES HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useTalentProfiles(filters: TalentSearchFilters = {}) {
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchProfiles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.departmentIds?.length) params.append('departmentIds', filters.departmentIds.join(','));
      if (filters.nineBoxPositions?.length) params.append('nineBoxPositions', filters.nineBoxPositions.join(','));
      if (filters.talentCategories?.length) params.append('talentCategories', filters.talentCategories.join(','));
      if (filters.minPerformanceRating) params.append('minPerformanceRating', filters.minPerformanceRating.toString());
      if (filters.flightRiskLevels?.length) params.append('flightRiskLevels', filters.flightRiskLevels.join(','));
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      params.append('page', page.toString());

      const response = await fetch(`${SUCCESSION_API_BASE}/talent-profiles?${params}`);
      const data = await response.json();

      setProfiles(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateProfile = useCallback(async (profileId: string, data: UpdateTalentProfileDto) => {
    const updated = await successionApiCall<TalentProfile>(`/talent-profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setProfiles(prev => prev.map(p => (p.id === profileId ? updated : p)));
    return updated;
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, pagination, fetchProfiles, updateProfile };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE TALENT PROFILE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useTalentProfile(employeeId: string | undefined) {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await successionApiCall<TalentProfile>(`/talent-profiles/${employeeId}`);
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const update = useCallback(async (data: UpdateTalentProfileDto) => {
    if (!profile) return null;
    const updated = await successionApiCall<TalentProfile>(`/talent-profiles/${profile.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setProfile(updated);
    return updated;
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile, update };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSION PLAN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSuccessionPlan(planId: string | undefined) {
  const [plan, setPlan] = useState<SuccessionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await successionApiCall<SuccessionPlan>(`/plans/${planId}`);
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const addSuccessor = useCallback(async (data: Omit<AddSuccessorDto, 'successionPlanId'>) => {
    if (!planId) return null;
    const successor = await successionApiCall<SuccessorCandidate>(`/plans/${planId}/successors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchPlan();
    return successor;
  }, [planId, fetchPlan]);

  const updateSuccessorReadiness = useCallback(async (
    successorId: string,
    readiness: SuccessorReadiness,
    notes?: string
  ) => {
    const updated = await successionApiCall<SuccessorCandidate>(`/successors/${successorId}/readiness`, {
      method: 'PUT',
      body: JSON.stringify({ readiness, notes }),
    });
    await fetchPlan();
    return updated;
  }, [fetchPlan]);

  const removeSuccessor = useCallback(async (successorId: string, reason: string) => {
    await successionApiCall(`/successors/${successorId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
    await fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    loading,
    error,
    refetch: fetchPlan,
    addSuccessor,
    updateSuccessorReadiness,
    removeSuccessor,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NINE BOX HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useNineBox(departmentId?: string) {
  const [distribution, setDistribution] = useState<Array<{
    position: NineBoxPosition;
    count: number;
    employees: Array<{ id: string; name: string; position: string }>;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchDistribution = useCallback(async () => {
    setLoading(true);
    try {
      const params = departmentId ? `?departmentId=${departmentId}` : '';
      const data = await successionApiCall<typeof distribution>(`/nine-box/distribution${params}`);
      setDistribution(data);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  const assessEmployee = useCallback(async (
    employeeId: string,
    performanceScore: number,
    potentialScore: number,
    notes?: string
  ) => {
    const profile = await successionApiCall<TalentProfile>('/nine-box/assess', {
      method: 'POST',
      body: JSON.stringify({ employeeId, performanceScore, potentialScore, notes }),
    });
    await fetchDistribution();
    return profile;
  }, [fetchDistribution]);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return { distribution, loading, fetchDistribution, assessEmployee };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPMENT PLAN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useDevelopmentPlan(planId: string | undefined) {
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const createPlan = useCallback(async (data: CreateDevelopmentPlanDto) => {
    const created = await successionApiCall<DevelopmentPlan>('/development-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setPlan(created);
    return created;
  }, []);

  const addActivity = useCallback(async (data: Omit<any, 'developmentPlanId'>) => {
    if (!planId) return null;
    const activity = await successionApiCall(`/development-plans/${planId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Refetch plan to get updated activities
    const updated = await successionApiCall<DevelopmentPlan>(`/development-plans/${planId}`);
    setPlan(updated);
    return activity;
  }, [planId]);

  const updateActivityProgress = useCallback(async (
    activityId: string,
    status: string,
    progress: number,
    notes?: string
  ) => {
    await successionApiCall(`/activities/${activityId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ status, progress, notes }),
    });
    // Refetch plan
    if (planId) {
      const updated = await successionApiCall<DevelopmentPlan>(`/development-plans/${planId}`);
      setPlan(updated);
    }
  }, [planId]);

  return { plan, loading, createPlan, addActivity, updateActivityProgress };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSION DASHBOARD HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSuccessionDashboard() {
  const [dashboard, setDashboard] = useState<SuccessionDashboardData | null>(null);
  const [analytics, setAnalytics] = useState<SuccessionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardData, analyticsData] = await Promise.all([
        successionApiCall<SuccessionDashboardData>('/dashboard'),
        successionApiCall<SuccessionAnalytics>('/analytics'),
      ]);
      setDashboard(dashboardData);
      setAnalytics(analyticsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, analytics, loading, refetch: fetchDashboard };
}

// Re-exports removed (functions already exported inline above)
