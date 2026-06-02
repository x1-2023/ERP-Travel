import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportList() {
  const reports = [
    { title: 'Weekly KPI', icon: TrendingUp, description: 'Weekly performance metrics' },
    { title: 'Budget Analysis', icon: PieChart, description: 'Fund utilization report' },
    { title: 'Claim Summary', icon: BarChart3, description: 'Claims by status and customer' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
