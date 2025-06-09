import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect
}) => {
  const events = appointments.map(appointment => {
    const date = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));

    return {
      id: appointment.id,
      title: `${appointment.clientName} - ${format(date, 'h:mm a')}`,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
      className: `status-${appointment.status}`,
      extendedProps: {
        status: appointment.status,
        description: appointment.description
      }
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
      <style>
        {`
          .status-pending { background-color: #fef3c7 !important; border-color: #f59e0b !important; }
          .status-approved { background-color: #d1fae5 !important; border-color: #059669 !important; }
          .status-rejected { background-color: #fee2e2 !important; border-color: #dc2626 !important; }
          
          @media (max-width: 640px) {
            .fc .fc-toolbar {
              flex-direction: column;
              gap: 1rem;
            }
            .fc .fc-toolbar-title {
              font-size: 1.25rem;
            }
            .fc .fc-button {
              padding: 0.4rem 0.8rem;
              font-size: 0.875rem;
            }
            .fc .fc-view-harness {
              height: auto !important;
              min-height: 400px;
            }
          }
        `}
      </style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        select={({ start }) => onDateSelect(start)}
        height="auto"
        allDaySlot={false}
        slotMinTime="10:00:00"
        slotMaxTime="18:00:00"
        slotDuration="01:00:00"
        expandRows={true}
        stickyHeaderDates={true}
        handleWindowResize={true}
        contentHeight="auto"
        eventContent={({ event }) => (
          <div className="p-1 text-sm sm:text-base">
            <div className="font-medium truncate">{event.title}</div>
            <div className="text-xs capitalize truncate">
              {event.extendedProps.status}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default AppointmentCalendar;