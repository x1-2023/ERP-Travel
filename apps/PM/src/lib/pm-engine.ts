// ============================================================
// PM Engine — Project Management Core Business Logic
// Gantt scheduling, resource allocation, sprint management,
// critical path analysis, earned value management
// ============================================================

// ==================== Types ====================

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  budget: number;
  actualCost: number;
  managerId: string;
  tenantId: string;
  tags: string[];
  milestones: Milestone[];
  phases: Phase[];
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export interface Task {
  id: string;
  projectId: string;
  phaseId?: string;
  sprintId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;          // 0-100%
  dependencies: string[];    // Task IDs this task depends on
  tags: string[];
  tenantId: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  deliverables: string[];
}

export interface Phase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  order: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'review' | 'completed';
  velocity?: number;
  taskIds: string[];
}

export interface Resource {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  capacity: number;        // Hours per day
  allocations: ResourceAllocation[];
}

export interface ResourceAllocation {
  projectId: string;
  taskId?: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
  percentage: number;       // 0-100%
}

// ==================== Gantt Scheduling ====================

export interface GanttBar {
  taskId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  assignee?: string;
  color?: string;           // Based on status/priority
  isCritical: boolean;
  isMilestone: boolean;
}

/**
 * Generate Gantt chart data from tasks
 */
export function generateGanttData(tasks: Task[], milestones: Milestone[]): GanttBar[] {
  const criticalPath = calculateCriticalPath(tasks);
  const criticalTaskIds = new Set(criticalPath.map(t => t.id));

  const bars: GanttBar[] = tasks
    .filter(t => t.startDate && t.dueDate)
    .map(task => ({
      taskId: task.id,
      title: task.title,
      startDate: task.startDate!,
      endDate: task.dueDate!,
      progress: task.progress,
      dependencies: task.dependencies,
      assignee: task.assigneeId,
      color: getStatusColor(task.status, task.priority),
      isCritical: criticalTaskIds.has(task.id),
      isMilestone: false,
    }));

  // Add milestones
  for (const ms of milestones) {
    bars.push({
      taskId: `ms_${ms.id}`,
      title: `◆ ${ms.name}`,
      startDate: ms.date,
      endDate: ms.date,
      progress: ms.status === 'completed' ? 100 : 0,
      dependencies: [],
      color: ms.status === 'completed' ? '#10B981' : ms.status === 'overdue' ? '#EF4444' : '#6B7280',
      isCritical: false,
      isMilestone: true,
    });
  }

  return bars.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

function getStatusColor(status: TaskStatus, priority: Priority): string {
  if (status === 'blocked') return '#EF4444';
  if (status === 'done') return '#10B981';
  if (priority === 'critical') return '#DC2626';
  if (priority === 'high') return '#F59E0B';
  if (status === 'in_progress') return '#3B82F6';
  return '#6B7280';
}

// ==================== Critical Path Analysis ====================

/**
 * Calculate critical path using forward/backward pass
 * Returns the sequence of tasks that determines project duration
 */
export function calculateCriticalPath(tasks: Task[]): Task[] {
  if (tasks.length === 0) return [];

  const taskMap = new Map(tasks.map(t => [t.id, t]));

  // Forward pass — calculate earliest start/finish
  const es = new Map<string, number>(); // Earliest start (days from project start)
  const ef = new Map<string, number>(); // Earliest finish

  const projectStart = Math.min(
    ...tasks.filter(t => t.startDate).map(t => t.startDate!.getTime())
  );

  function getEarliestStart(taskId: string): number {
    if (es.has(taskId)) return es.get(taskId)!;

    const task = taskMap.get(taskId);
    if (!task) return 0;

    if (task.dependencies.length === 0) {
      const start = task.startDate
        ? Math.floor((task.startDate.getTime() - projectStart) / (1000 * 60 * 60 * 24))
        : 0;
      es.set(taskId, start);
      return start;
    }

    const maxDep = Math.max(...task.dependencies.map(depId => {
      const depFinish = getEarliestStart(depId) + getDuration(depId);
      return depFinish;
    }));

    es.set(taskId, maxDep);
    return maxDep;
  }

  function getDuration(taskId: string): number {
    const task = taskMap.get(taskId);
    if (!task || !task.startDate || !task.dueDate) return 1;
    return Math.max(1, Math.ceil((task.dueDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Calculate EF for all tasks
  for (const task of tasks) {
    const start = getEarliestStart(task.id);
    ef.set(task.id, start + getDuration(task.id));
  }

  // Find project duration
  const projectDuration = Math.max(...Array.from(ef.values()));

  // Backward pass — calculate latest start/finish
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  // Find tasks that nothing depends on (end tasks)
  const dependedOn = new Set<string>();
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      dependedOn.add(dep);
    }
  }

  function getLatestFinish(taskId: string): number {
    if (lf.has(taskId)) return lf.get(taskId)!;

    // Find tasks that depend on this one
    const successors = tasks.filter(t => t.dependencies.includes(taskId));

    if (successors.length === 0) {
      lf.set(taskId, projectDuration);
      return projectDuration;
    }

    const minSucc = Math.min(...successors.map(s => {
      const succLF = getLatestFinish(s.id);
      return succLF - getDuration(s.id);
    }));

    lf.set(taskId, minSucc);
    return minSucc;
  }

  for (const task of tasks) {
    const latestFinish = getLatestFinish(task.id);
    ls.set(task.id, latestFinish - getDuration(task.id));
  }

  // Critical path = tasks where ES === LS (zero float)
  const criticalTasks = tasks.filter(task => {
    const earlyStart = es.get(task.id) || 0;
    const lateStart = ls.get(task.id) || 0;
    return Math.abs(earlyStart - lateStart) < 0.001;
  });

  return criticalTasks;
}

// ==================== Resource Allocation ====================

/**
 * Calculate resource utilization for a period
 */
export function calculateResourceUtilization(
  resources: Resource[],
  startDate: Date,
  endDate: Date
): Array<{
  resourceId: string;
  name: string;
  totalCapacity: number;
  allocatedHours: number;
  utilizationPercent: number;
  overallocated: boolean;
  dailyUtilization: Array<{ date: string; allocated: number; capacity: number }>;
}> {
  const workDays = getWorkDays(startDate, endDate);

  return resources.map(resource => {
    let allocatedHours = 0;
    const dailyMap = new Map<string, number>();

    for (const alloc of resource.allocations) {
      const allocStart = new Date(Math.max(alloc.startDate.getTime(), startDate.getTime()));
      const allocEnd = new Date(Math.min(alloc.endDate.getTime(), endDate.getTime()));

      if (allocStart > allocEnd) continue;

      const days = getWorkDays(allocStart, allocEnd);
      for (const day of days) {
        const key = day.toISOString().split('T')[0];
        dailyMap.set(key, (dailyMap.get(key) || 0) + alloc.hoursPerDay);
        allocatedHours += alloc.hoursPerDay;
      }
    }

    const totalCapacity = workDays.length * resource.capacity;
    const utilizationPercent = totalCapacity > 0 ? (allocatedHours / totalCapacity) * 100 : 0;

    const dailyUtilization = workDays.map(day => {
      const key = day.toISOString().split('T')[0];
      return {
        date: key,
        allocated: dailyMap.get(key) || 0,
        capacity: resource.capacity,
      };
    });

    return {
      resourceId: resource.id,
      name: resource.name,
      totalCapacity,
      allocatedHours,
      utilizationPercent: Math.round(utilizationPercent),
      overallocated: utilizationPercent > 100,
      dailyUtilization,
    };
  });
}

// ==================== Sprint Management ====================

export interface SprintMetrics {
  sprintId: string;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
  velocity: number;
  burndownData: Array<{ date: string; remaining: number; ideal: number }>;
  completion: number;
}

/**
 * Calculate sprint metrics and burndown
 */
export function calculateSprintMetrics(
  sprint: Sprint,
  tasks: Task[]
): SprintMetrics {
  const sprintTasks = tasks.filter(t => sprint.taskIds.includes(t.id));
  const completed = sprintTasks.filter(t => t.status === 'done');

  const totalPoints = sprintTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedPoints = completed.reduce((sum, t) => sum + t.estimatedHours, 0);

  // Generate burndown
  const sprintDays = getWorkDays(sprint.startDate, sprint.endDate);
  const dailyBurn = totalPoints / Math.max(1, sprintDays.length);

  const burndownData = sprintDays.map((day, idx) => ({
    date: day.toISOString().split('T')[0],
    remaining: Math.max(0, totalPoints - completedPoints * ((idx + 1) / sprintDays.length)),
    ideal: Math.max(0, totalPoints - dailyBurn * (idx + 1)),
  }));

  return {
    sprintId: sprint.id,
    totalTasks: sprintTasks.length,
    completedTasks: completed.length,
    totalPoints,
    completedPoints,
    velocity: completedPoints,
    burndownData,
    completion: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
  };
}

// ==================== Earned Value Management (EVM) ====================

export interface EVMMetrics {
  pv: number;   // Planned Value
  ev: number;   // Earned Value
  ac: number;   // Actual Cost
  sv: number;   // Schedule Variance (EV - PV)
  cv: number;   // Cost Variance (EV - AC)
  spi: number;  // Schedule Performance Index (EV / PV)
  cpi: number;  // Cost Performance Index (EV / AC)
  eac: number;  // Estimate At Completion
  etc: number;  // Estimate To Complete
  vac: number;  // Variance At Completion
}

/**
 * Calculate EVM metrics for project health assessment
 */
export function calculateEVM(
  budget: number,
  plannedProgress: number,    // 0-1 (planned % complete as of today)
  actualProgress: number,     // 0-1 (actual % complete)
  actualCost: number
): EVMMetrics {
  const pv = budget * plannedProgress;
  const ev = budget * actualProgress;
  const ac = actualCost;

  const sv = ev - pv;
  const cv = ev - ac;
  const spi = pv > 0 ? ev / pv : 0;
  const cpi = ac > 0 ? ev / ac : 0;
  const eac = cpi > 0 ? budget / cpi : budget * 2;
  const etc = eac - ac;
  const vac = budget - eac;

  return { pv, ev, ac, sv, cv, spi, cpi, eac, etc, vac };
}

// ==================== Helpers ====================

function getWorkDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) { // Skip weekends
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}
