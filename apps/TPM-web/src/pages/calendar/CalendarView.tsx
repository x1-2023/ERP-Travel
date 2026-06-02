/**
 * Calendar View Page - Modern Premium Design
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Demo promotions with richer data
const demoPromotions = [
  {
    id: '1',
    code: 'PROMO-2026-001',
    name: 'Q1 Trade Discount',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    status: 'ACTIVE',
    color: '#10b981',
    budget: 500000000,
  },
  {
    id: '2',
    code: 'PROMO-2026-002',
    name: 'Lunar New Year',
    startDate: '2026-01-25',
    endDate: '2026-02-10',
    status: 'ACTIVE',
    color: '#f43f5e',
    budget: 800000000,
  },
  {
    id: '3',
    code: 'PROMO-2026-003',
    name: 'Valentine Sale',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    status: 'PENDING_APPROVAL',
    color: '#ec4899',
    budget: 300000000,
  },
  {
    id: '4',
    code: 'PROMO-2026-004',
    name: 'March Madness',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT',
    color: '#3b82f6',
    budget: 1200000000,
  },
];

const statusConfig = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white' },
  PENDING_APPROVAL: { label: 'Pending', className: 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white' },
  DRAFT: { label: 'Draft', className: 'bg-slate-500 text-white dark:bg-slate-600 dark:text-white' },
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Get promotions for a specific date
  const getPromotionsForDate = (date: Date) => {
    return demoPromotions.filter((promo) => {
      const start = parseISO(promo.startDate);
      const end = parseISO(promo.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  // Get promotions for selected date
  const selectedDatePromotions = selectedDate
    ? getPromotionsForDate(selectedDate)
    : [];

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotion Calendar</h1>
          <p className="text-foreground-subtle text-sm mt-1">
            Visualize and manage your promotion timeline
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link to="/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Promotion
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-surface-border bg-surface/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={previousMonth}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground-muted" />
                </button>
                <h2 className="text-xl font-semibold text-foreground min-w-[180px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-foreground-muted" />
                </button>
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-muted rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-surface-border">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "py-3 text-center text-xs font-semibold uppercase tracking-wider",
                  i >= 5 ? "text-foreground-subtle" : "text-foreground-muted"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayPromotions = getPromotionsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 border-b border-r border-surface-border cursor-pointer transition-all duration-150",
                    "hover:bg-surface-hover",
                    !isCurrentMonth && "bg-surface/30",
                    isSelected && "bg-primary/5 ring-2 ring-primary ring-inset",
                    index % 7 === 6 && "border-r-0"
                  )}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors",
                        !isCurrentMonth && "text-foreground-subtle/50",
                        isCurrentMonth && !isToday && (isWeekend ? "text-foreground-subtle" : "text-foreground"),
                        isToday && "bg-primary text-primary-foreground font-semibold",
                        isSelected && !isToday && "bg-primary/10 text-primary"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayPromotions.length > 2 && (
                      <span className="text-[10px] font-medium text-foreground-subtle bg-surface-hover px-1.5 py-0.5 rounded">
                        +{dayPromotions.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Event pills */}
                  <div className="space-y-1">
                    {dayPromotions.slice(0, 2).map((promo) => (
                      <div
                        key={promo.id}
                        className="group relative"
                      >
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium truncate transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: promo.color + '18',
                            color: promo.color,
                            borderLeft: `3px solid ${promo.color}`,
                          }}
                        >
                          <span className="truncate">{promo.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Date Details */}
          <div className="bg-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border bg-surface/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  {selectedDate ? format(selectedDate, 'EEEE') : 'Select a date'}
                </h3>
              </div>
              {selectedDate && (
                <p className="text-2xl font-bold text-foreground mt-1">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              )}
            </div>

            <div className="p-4">
              {selectedDate ? (
                selectedDatePromotions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDatePromotions.map((promo) => {
                      const status = statusConfig[promo.status as keyof typeof statusConfig];
                      return (
                        <Link
                          key={promo.id}
                          to={`/promotions/${promo.id}`}
                          className="block rounded-xl border border-surface-border p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
                              style={{ backgroundColor: promo.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", status.className)}>
                                  {status.label}
                                </span>
                              </div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {promo.name}
                              </p>
                              <p className="text-xs text-foreground-subtle mt-0.5">{promo.code}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-foreground-subtle">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(parseISO(promo.startDate), 'MMM d')} - {format(parseISO(promo.endDate), 'MMM d')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-foreground-subtle" />
                    </div>
                    <p className="text-sm text-foreground-muted">No promotions</p>
                    <p className="text-xs text-foreground-subtle mt-1">on this date</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-foreground-muted">Click a date to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Promotions Legend */}
          <div className="bg-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border bg-surface/50">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Active Promotions</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {demoPromotions.map((promo) => {
                const status = statusConfig[promo.status as keyof typeof statusConfig];
                return (
                  <Link
                    key={promo.id}
                    to={`/promotions/${promo.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: promo.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {promo.name}
                      </p>
                      <p className="text-[11px] text-foreground-subtle">{promo.code}</p>
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0", status.className)}>
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
