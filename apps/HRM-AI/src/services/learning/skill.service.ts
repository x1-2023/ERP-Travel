import { db } from '@/lib/db';

export async function getSkillCategories(tenantId: string) {
  return db.skillCategory.findMany({
    where: { tenantId, parentId: null },
    include: {
      children: {
        include: {
          skills: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
      skills: { where: { isActive: true }, orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function createSkill(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    categoryId?: string;
    levels?: Record<string, string>;
  }
) {
  const defaultLevels = {
    '1': 'Beginner - Kiến thức cơ bản',
    '2': 'Elementary - Có thể làm việc với hỗ trợ',
    '3': 'Intermediate - Thành thạo, tự chủ',
    '4': 'Advanced - Chuyên gia',
    '5': 'Expert - Thought leader',
  };

  return db.skill.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      levels: data.levels || defaultLevels,
      isActive: true,
    },
  });
}

export async function getEmployeeSkills(tenantId: string, employeeId: string) {
  return db.employeeSkill.findMany({
    where: { tenantId, employeeId },
    include: {
      skill: {
        include: { category: true },
      },
    },
    orderBy: { skill: { name: 'asc' } },
  });
}

export async function updateEmployeeSkill(
  tenantId: string,
  employeeId: string,
  skillId: string,
  data: {
    currentLevel?: number;
    targetLevel?: number;
    selfAssessment?: number;
    managerAssessment?: number;
    notes?: string;
  },
  assessedById?: string
) {
  const existing = await db.employeeSkill.findUnique({
    where: { employeeId_skillId: { employeeId, skillId } },
  });

  if (existing) {
    return db.employeeSkill.update({
      where: { id: existing.id },
      data: {
        ...data,
        assessedAt: new Date(),
        assessedById,
      },
    });
  }

  return db.employeeSkill.create({
    data: {
      tenantId,
      employeeId,
      skillId,
      currentLevel: data.currentLevel || 1,
      targetLevel: data.targetLevel,
      selfAssessment: data.selfAssessment,
      managerAssessment: data.managerAssessment,
      notes: data.notes,
      assessedAt: new Date(),
      assessedById,
    },
  });
}

export async function getSkillsMatrix(
  tenantId: string,
  filters?: {
    departmentId?: string;
    skillIds?: string[];
  }
) {
  const employeeWhere: any = { tenantId, status: 'ACTIVE' };
  if (filters?.departmentId) {
    employeeWhere.departmentId = filters.departmentId;
  }

  const employees = await db.employee.findMany({
    where: employeeWhere,
    select: {
      id: true,
      fullName: true,
      position: true,
      employeeSkills: {
        include: { skill: true },
        where: filters?.skillIds ? { skillId: { in: filters.skillIds } } : undefined,
      },
    },
    orderBy: { fullName: 'asc' },
  });

  const skillWhere: any = { tenantId, isActive: true };
  if (filters?.skillIds) {
    skillWhere.id = { in: filters.skillIds };
  }

  const skills = await db.skill.findMany({
    where: skillWhere,
    orderBy: { name: 'asc' },
  });

  const positionSkills = await db.positionSkill.findMany({
    where: { tenantId },
  });

  const matrix = employees.map((emp) => {
    const skillLevels: Record<string, { current: number; required: number; gap: number }> = {};

    skills.forEach((skill) => {
      const empSkill = emp.employeeSkills.find((es: any) => es.skillId === skill.id);
      const posSkill = positionSkills.find(
        (ps) => ps.skillId === skill.id && ps.position === (emp.position as any)?.name
      );

      const current = empSkill?.currentLevel || 0;
      const required = posSkill?.requiredLevel || 0;

      skillLevels[skill.id] = {
        current,
        required,
        gap: current - required,
      };
    });

    return {
      employee: {
        id: emp.id,
        fullName: emp.fullName,
        position: emp.position,
      },
      skills: skillLevels,
    };
  });

  const skillStats = skills.map((skill) => {
    const levels = matrix.map((m) => m.skills[skill.id]?.current || 0).filter((l) => l > 0);
    const avgLevel = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;
    const gaps = matrix.map((m) => m.skills[skill.id]?.gap || 0).filter((g) => g < 0);
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

    return {
      skill,
      avgLevel: Math.round(avgLevel * 10) / 10,
      avgGap: Math.round(avgGap * 10) / 10,
      employeesWithGap: gaps.length,
    };
  });

  return { skills, matrix, skillStats };
}
