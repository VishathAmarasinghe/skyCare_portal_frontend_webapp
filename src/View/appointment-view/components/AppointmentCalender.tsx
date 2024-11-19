import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { dayjsLocalizer, Calendar, Views, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

dayjs.extend(timezone);
const localizer = dayjsLocalizer(dayjs);

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const events = [
  // Events for today
  {
    id: 0,
    title: 'Morning Standup',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30, 0),
    resourceId: 1,
  },
  {
    id: 1,
    title: 'Client Meeting',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0),
    resourceId: 2,
  },
  {
    id: 2,
    title: 'Lunch Break',
    allDay: false,
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0),
    resourceId: 3,
  },
  {
    id: 3,
    title: 'Team Brainstorming',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0),
    resourceId: 4,
  },

  // Events for tomorrow
  {
    id: 4,
    title: 'Project Kickoff',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0, 0),
    resourceId: 1,
  },
  {
    id: 5,
    title: 'Code Review Session',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 30, 0),
    resourceId: 2,
  },
  {
    id: 6,
    title: 'Product Demo',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0, 0),
    resourceId: 3,
  },

  // Miscellaneous events for other days
  {
    id: 7,
    title: 'Weekly Sync',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 30, 0),
    resourceId: 4,
  },
  {
    id: 8,
    title: 'Workshop',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 13, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 15, 0, 0),
    resourceId: 2,
  },
  {
    id: 9,
    title: 'Networking Event',
    allDay: true,
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 0, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 23, 59, 59),
    resourceId: 1,
  },
];

const resources = [
  { resourceId: 1, resourceTitle: 'Board room' },
  { resourceId: 2, resourceTitle: 'Training room' },
  { resourceId: 3, resourceTitle: 'Meeting room 1' },
  { resourceId: 4, resourceTitle: 'Meeting room 2' },
];

interface ColoredDateCellWrapperProps {
  children?: React.ReactNode; // Updated to optional
}

const ColoredDateCellWrapper: React.FC<ColoredDateCellWrapperProps> = ({ children }) => (
  <div style={{ backgroundColor: 'lightblue' }}>{children}</div>
);

const AppointmentCalendar = () => {
  const { components, defaultDate, views } = useMemo(() => {
    // Use Views constants explicitly
    const availableViews: View[] = [Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY, Views.AGENDA];

    return {
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      views: availableViews,
    };
  }, []);

  return (
    <Stack width="100%" height="100%">
      <Stack width="100%" height="5%" />
      <Stack width="100%" height="90%" sx={{ backgroundColor: 'white', p: 2 }}>
        <Calendar
          components={components}
          defaultDate={defaultDate}
          events={events}
            dayLayoutAlgorithm="no-overlap"
          localizer={localizer}
        //   resources={resources}
          showMultiDayTimes
          step={60}
          popup
          views={views} // Correctly typed as `View[]`
          style={{ height: '100%', width: '100%' }}
        />
      </Stack>
    </Stack>
  );
};

export default AppointmentCalendar;
