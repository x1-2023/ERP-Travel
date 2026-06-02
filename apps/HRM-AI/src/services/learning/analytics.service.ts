import { db } from '@/lib/db';

export async function getLearningAnalytics(tenantId: string, year?: number) {
  const currentYear = year || new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);

  const [totalCourses, totalEnrollments, completedEnrollments, budgets] = await Promise.all([
    db.course.count({ where: { tenantId, status: 'PUBLISHED' } }),
    db.enrollment.count({ where: { tenantId, createdAt: { gte: startDate, lte: endDate } } }),
    db.enrollment.count({ where: { tenantId, status: 'COMPLETED', completedAt: { gte: startDate, lte: endDate } } }),
    db.trainingBudget.findMany({ where: { tenantId, year: currentYear }, include: { department: true } }),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  const budgetUtilization = budgets.map((b) => ({
    department: b.department?.name || 'Chung',
    budget: Number(b.totalBudget),
    spent: Number(b.spentAmount),
  }));

  return {
    totalCourses,
    totalEnrollments,
    completionRate,
    averageScore: 0,
    totalTrainingHours: 0,
    topCourses: [],
    skillGaps: [],
    departmentStats: [],
    monthlyTrend: [],
    budgetUtilization,
  };
}
