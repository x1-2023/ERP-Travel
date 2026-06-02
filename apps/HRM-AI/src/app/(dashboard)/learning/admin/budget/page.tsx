'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, PieChart, Download, Calendar } from 'lucide-react';

interface BudgetData {
  totalBudget: number;
  spent: number;
  committed: number;
  remaining: number;
  byDepartment: { department: string; allocated: number; spent: number }[];
  byCategory: { category: string; amount: number; percentage: number }[];
}

export default function AdminBudgetPage() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBudget() {
      try {
        const res = await fetch('/api/learning/admin/budget');
        if (res.ok) {
          const data = await res.json();
          setBudget(data.data || null);
        }
      } catch (err) {
        setError('Khong the tai thong tin ngan sach');
      } finally {
        setLoading(false);
      }
    }
    fetchBudget();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p>Dang tai...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ngan sach dao tao</h1>
          <p className="text-muted-foreground">Theo doi va quan ly ngan sach dao tao</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Xuat bao cao</Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg"><DollarSign className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Tong ngan sach</p><p className="text-xl font-bold">{budget ? formatCurrency(budget.totalBudget) : '0'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-red-500/10 rounded-lg"><TrendingUp className="h-5 w-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Da chi</p><p className="text-xl font-bold">{budget ? formatCurrency(budget.spent) : '0'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-lg"><Calendar className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Cam ket</p><p className="text-xl font-bold">{budget ? formatCurrency(budget.committed) : '0'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-lg"><PieChart className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Con lai</p><p className="text-xl font-bold">{budget ? formatCurrency(budget.remaining) : '0'}</p></div></div></CardContent></Card>
      </div>

      {budget && (
        <>
          <Card>
            <CardHeader><CardTitle>Ngan sach theo phong ban</CardTitle></CardHeader>
            <CardContent>
              {(budget.byDepartment || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Chua co du lieu</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Phong ban</th>
                      <th className="text-right p-3">Phan bo</th>
                      <th className="text-right p-3">Da su dung</th>
                      <th className="text-right p-3">Ty le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.byDepartment.map((dept, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{dept.department}</td>
                        <td className="p-3 text-right">{formatCurrency(dept.allocated)}</td>
                        <td className="p-3 text-right">{formatCurrency(dept.spent)}</td>
                        <td className="p-3 text-right">
                          <Badge variant={dept.spent / dept.allocated > 0.9 ? 'destructive' : 'secondary'}>
                            {Math.round((dept.spent / dept.allocated) * 100)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Chi phi theo danh muc</CardTitle></CardHeader>
            <CardContent>
              {(budget.byCategory || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Chua co du lieu</p>
              ) : (
                <div className="space-y-3">
                  {budget.byCategory.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium w-32">{cat.category}</span>
                        <div className="flex-1 bg-muted rounded-full h-3">
                          <div className="bg-primary rounded-full h-3" style={{ width: `${cat.percentage}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium ml-4">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
