import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import JobCardsTable from '@/components/job-cards/job-cards-table';

export const dynamic = 'force-dynamic';

export default async function JobCardsPage() {
  const jobCards = await prisma.jobCard.findMany({
    include: {
      workOrder: { select: { woNo: true } },
      operation: { select: { name: true } },
      workstation: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize data
  const serializedJobCards = jobCards.map((jc) => ({
    id: jc.id,
    jobNo: jc.jobNo,
    workOrder: jc.workOrder,
    operation: jc.operation,
    workstation: jc.workstation,
    qtyCompleted: Number(jc.qtyCompleted),
    qtyToProduce: Number(jc.qtyToProduce || 0),
    workerName: jc.workerName,
    status: jc.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Phiếu công việc (Job Cards)" description={`${jobCards.length} phiếu`} />
      <JobCardsTable jobCards={serializedJobCards} />
    </div>
  );
}
