/**
 * Delivery Calendar Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  List,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { DeliveryCalendar } from '@/components/operations';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDeliveryCalendar } from '@/hooks/operations/useDelivery';
import { useCustomers } from '@/hooks/useCustomers';

export default function DeliveryCalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [customerId, setCustomerId] = useState<string>('');

  const { data, isLoading, error } = useDeliveryCalendar(
    month,
    year,
    customerId || undefined
  );
  const { data: customersData } = useCustomers({ limit: 100 });

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-6 text-destructive">Error loading calendar</div>;

  const calendarData = data?.data;
  const summary = data?.summary;
  const customers = customersData?.customers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/operations/delivery">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Delivery Calendar</h1>
            <p className="text-muted-foreground">
              View scheduled deliveries by date
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/operations/delivery">
              <List className="h-4 w-4 mr-2" />
              List View
            </Link>
          </Button>
          <Button asChild>
            <Link to="/operations/delivery/new">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters & Summary */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filter by Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={customerId || '__all__'}
              onValueChange={(v) => setCustomerId(v === '__all__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Customers</SelectItem>
                {customers.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{summary.totalOrders}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{summary.delivered}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{summary.pending}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Busiest Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {summary.busiestDay?.date || '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {summary.busiestDay?.totalOrders || 0} orders
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Calendar */}
      {calendarData && (
        <DeliveryCalendar
          days={calendarData.days}
          month={calendarData.month}
          year={calendarData.year}
          onMonthChange={handleMonthChange}
        />
      )}
    </div>
  );
}
