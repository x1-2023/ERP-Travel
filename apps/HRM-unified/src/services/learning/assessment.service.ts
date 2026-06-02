import { db } from '@/lib/db';

export async function createAssessment(tenantId: string, userId: string, data: {
  courseId?: string;
  title: string;
  description?: string;
  instructions?: string;
  assessmentType: string;
  timeLimitMinutes?: number;
  passingScore: number;
  totalPoints: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  questions?: {
    questionText: string;
    questionType: string;
    options?: any;
    correctAnswer?: string;
    points: number;
    explanation?: string;
  }[];
}) {
  const assessment = await db.assessment.create({
    data: {
      tenantId,
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      assessmentType: data.assessmentType as any,
      timeLimitMinutes: data.timeLimitMinutes,
      passingScore: data.passingScore,
      totalPoints: data.totalPoints,
      maxAttempts: data.maxAttempts || 1,
      shuffleQuestions: data.shuffleQuestions || false,
      showCorrectAnswers: data.showCorrectAnswers ?? true,
      createdById: userId,
    },
  });

  if (data.questions) {
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      await db.assessmentQuestion.create({
        data: {
          assessmentId: assessment.id,
          questionText: q.questionText,
          questionType: q.questionType as any,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          explanation: q.explanation,
          order: i,
        },
      });
    }
  }

  return getAssessmentById(assessment.id, tenantId);
}

export async function getAssessments(tenantId: string, filters?: { courseId?: string }) {
  const where: any = { tenantId };
  if (filters?.courseId) where.courseId = filters.courseId;

  return db.assessment.findMany({
    where,
    include: { _count: { select: { attempts: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAssessmentById(id: string, tenantId: string) {
  return db.assessment.findFirst({
    where: { id, tenantId },
    include: { questions: { orderBy: { order: 'asc' } }, _count: { select: { attempts: true } } },
  });
}

export async function startAttempt(tenantId: string, assessmentId: string, employeeId: string, enrollmentId?: string) {
  const assessment = await db.assessment.findFirst({ where: { id: assessmentId, tenantId, isActive: true } });
  if (!assessment) throw new Error('Assessment not found');

  const existingAttempts = await db.assessmentAttempt.count({
    where: { assessmentId, employeeId },
  });
  if (existingAttempts >= assessment.maxAttempts) throw new Error('Max attempts reached');

  return db.assessmentAttempt.create({
    data: {
      tenantId,
      assessmentId,
      employeeId,
      enrollmentId,
      attemptNumber: existingAttempts + 1,
      startedAt: new Date(),
    },
    include: { assessment: { include: { questions: { orderBy: { order: 'asc' } } } } },
  });
}

export async function submitAttempt(attemptId: string, responses: { questionId: string; response?: string; selectedOptions?: string[] }[]) {
  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { assessment: { include: { questions: true } } },
  });
  if (!attempt) throw new Error('Attempt not found');

  let totalScore = 0;
  for (const r of responses) {
    const question = attempt.assessment.questions.find((q) => q.id === r.questionId);
    if (!question) continue;

    let isCorrect: boolean | null = null;
    let pointsEarned = 0;

    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(question.questionType)) {
      const correctAnswer = question.correctAnswer;
      isCorrect = r.response === correctAnswer || JSON.stringify(r.selectedOptions?.sort()) === JSON.stringify((JSON.parse(correctAnswer || '[]') as string[]).sort());
      pointsEarned = isCorrect ? Number(question.points) : 0;
    }

    totalScore += pointsEarned;

    await db.questionResponse.create({
      data: {
        attemptId,
        questionId: r.questionId,
        response: r.response,
        selectedOptions: r.selectedOptions,
        isCorrect,
        pointsEarned,
      },
    });
  }

  const percentageScore = (totalScore / Number(attempt.assessment.totalPoints)) * 100;
  const passed = percentageScore >= Number(attempt.assessment.passingScore);
  const timeSpentMinutes = Math.round((Date.now() - attempt.startedAt.getTime()) / 60000);

  return db.assessmentAttempt.update({
    where: { id: attemptId },
    data: { submittedAt: new Date(), score: totalScore, percentageScore, passed, timeSpentMinutes },
    include: { responses: { include: { question: true } } },
  });
}
