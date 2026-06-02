'use client'

import { useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, Views, Event } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/vi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { INTERVIEW_TYPE, INTERVIEW_RESULT } from '@/lib/recruitment/constants'
import type { CalendarEvent } from '@/types/recruitment'

import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('vi')
const localizer = momentLocalizer(moment)

interface InterviewCalendarProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
}

interface CalendarEventStyled extends Event {
  resource: CalendarEvent
}

export function InterviewCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
}: InterviewCalendarProps) {
  const calendarEvents: CalendarEventStyled[] = useMemo(
    () =>
      events.map((event) => ({
        title: `${event.candidate.fullName} - ${INTERVIEW_TYPE[event.type]?.label || event.type}`,
        start: new Date(event.start),
        end: new Date(event.end),
        resource: event,
      })),
    [events]
  )

  const eventStyleGetter = useCallback((event: CalendarEventStyled) => {
    const result = event.resource.result
    let backgroundColor = '#3b82f6' // blue default

    if (result === 'PASSED') backgroundColor = '#10b981'
    else if (result === 'FAILED') backgroundColor = '#ef4444'
    else if (result === 'RESCHEDULED') backgroundColor = '#f59e0b'
    else if (result === 'NO_SHOW') backgroundColor = '#f97316'

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '12px',
      },
    }
  }, [])

  const handleSelectEvent = useCallback(
    (event: CalendarEventStyled) => {
      if (onSelectEvent) {
        onSelectEvent(event.resource)
      }
    },
    [onSelectEvent]
  )

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      if (onSelectSlot) {
        onSelectSlot(slotInfo)
      }
    },
    [onSelectSlot]
  )

  const messages = {
    today: 'Hôm nay',
    previous: 'Trước',
    next: 'Sau',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Giờ',
    event: 'Sự kiện',
    noEventsInRange: 'Không có lịch phỏng vấn trong khoảng thời gian này.',
    showMore: (total: number) => `+${total} thêm`,
  }

  const EventComponent = ({ event }: { event: CalendarEventStyled }) => {
    return (
      <div className="px-1">
        <div className="font-medium truncate text-xs">
          {event.resource.candidate.fullName}
        </div>
        <div className="text-[10px] opacity-80 truncate">
          {INTERVIEW_TYPE[event.resource.type]?.label} - Vòng {event.resource.round}
        </div>
        {event.resource.location && (
          <div className="text-[10px] opacity-70 truncate">
            {event.resource.location}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Lịch phỏng vấn</CardTitle>
          <div className="flex gap-2">
            {Object.entries(INTERVIEW_RESULT).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      key === 'PASSED'
                        ? '#10b981'
                        : key === 'FAILED'
                        ? '#ef4444'
                        : key === 'RESCHEDULED'
                        ? '#f59e0b'
                        : key === 'NO_SHOW'
                        ? '#f97316'
                        : '#3b82f6',
                  }}
                />
                <span className="text-xs text-muted-foreground">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.WEEK}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={messages}
            min={new Date(2024, 0, 1, 7, 0)}
            max={new Date(2024, 0, 1, 20, 0)}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              event: EventComponent as any,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
