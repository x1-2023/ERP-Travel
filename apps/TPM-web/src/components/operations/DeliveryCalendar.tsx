/**
 * Delivery Calendar Component
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { Link } from 'react-router-dom';
import type { CalendarDay, DeliveryOrder } from '@/types/operations';

interface DeliveryCalendarProps {
  days: CalendarDay[];
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  onDayClick?: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DeliveryCalendar({
  days,
  month,
  year,
  onMonthChange,
  onDayClick,
}: DeliveryCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get first day of month
  const firstDay = new Date(year, month - 1, 1);
  const startingDay = firstDay.getDay();

  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create calendar grid
  const calendarDays: (CalendarDay | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = days.find((d) => d.date === dateStr);
    calendarDays.push(
      dayData || {
        date: dateStr,
        orders: [],
        totalOrders: 0,
        deliveredCount: 0,
        pendingCount: 0,
      }
    );
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
    onDayClick?.(date);
  };

  const selectedDayData = days.find((d) => d.date === selectedDate);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {MONTHS[month - 1]} {year}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-24" />;
              }

              const isToday = day.date === today;
              const isSelected = day.date === selectedDate;
              const hasOrders = day.totalOrders > 0;

              return (
                <button
                  key={day.date}
                  onClick={() => handleDayClick(day.date)}
                  className={`h-24 p-1 text-left border rounded-lg transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary'
                      : 'border-muted hover:border-primary/50'
                  } ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-primary' : ''
                      }`}
                    >
                      {parseInt(day.date.split('-')[2])}
                    </span>
                    {hasOrders && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 rounded-full">
                        {day.totalOrders}
                      </span>
                    )}
                  </div>

                  {hasOrders && (
                    <div className="mt-1 space-y-0.5">
                      {day.deliveredCount > 0 && (
                        <div className="text-xs text-green-600 truncate">
                          {day.deliveredCount} delivered
                        </div>
                      )}
                      {day.pendingCount > 0 && (
                        <div className="text-xs text-orange-600 truncate">
                          {day.pendingCount} pending
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day details */}
      {selectedDayData && selectedDayData.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Orders for {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDayData.orders.map((order: DeliveryOrder) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <Link
                      to={`/operations/delivery/${order.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name}
                    </p>
                  </div>
                  <DeliveryStatusBadge status={order.status} size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
