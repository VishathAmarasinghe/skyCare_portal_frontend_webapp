import React, { useEffect, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { dayjsLocalizer, Calendar, Views, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {
  AppointmentCalenderType,
  fetchAppointmentbyCalender,
  fetchAppointmentbyCalenderWithUser,
  fetchRecurrentAppointmentDetails,
  fetchSingleAppointment,
} from "@slices/appointmentSlice/appointment";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";

dayjs.extend(timezone);
const localizer = dayjsLocalizer(dayjs);

interface CalenderEventCellType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  recurrentAppID: string;
}

interface ColoredDateCellWrapperProps {
  children?: React.ReactNode;
}

const ColoredDateCellWrapper: React.FC<ColoredDateCellWrapperProps> = ({
  children,
}) => <div style={{ backgroundColor: "lightblue" }}>{children}</div>;

interface AppointmentCalendarProps {
  setIsAppointmentAddModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setRecurrentAppointmentVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppointmentCalendar = ({
  setIsAppointmentAddModalVisible,
  setIsEditing,
  setRecurrentAppointmentVisible,
}: AppointmentCalendarProps) => {
  const dispatch = useAppDispatch();
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const [calenderEvents, setCalendarEvents] = useState<CalenderEventCellType[]>(
    []
  );
  const authRole = useAppSelector((State) => State?.auth?.roles);
  const authData = useAppSelector((state) => state?.auth?.userInfo);

  const { components, defaultDate, views } = useMemo(() => {
    const availableViews: View[] = [
      Views.MONTH,
      Views.WEEK,
      Views.WORK_WEEK,
      Views.DAY,
      Views.AGENDA,
    ];
    return {
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      views: availableViews,
    };
  }, []);

  useEffect(() => {
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    if (
      authRole.includes(APPLICATION_ADMIN) ||
      authRole.includes(APPLICATION_SUPER_ADMIN)
    ) {
      dispatch(fetchAppointmentbyCalender({ startDate, endDate }));
    } else {
      dispatch(
        fetchAppointmentbyCalenderWithUser({
          startDate,
          endDate,
          employeeID: authData?.userID || "",
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    if (appointmentSlice?.calenderEvents?.length > 0) {
      const formattedEvents = formatEvents(appointmentSlice.calenderEvents);
      setCalendarEvents(formattedEvents);
    }
  }, [appointmentSlice?.calenderEvents]);

  const formatEvents = (appointments: any[]) => {
    return appointments.map((appointment) => ({
      id: appointment.appointmentID,
      title: appointment.title,
      start: new Date(appointment.startDateAndTime),
      end: new Date(appointment.endDateAndTime),
      color: appointment.eventColor,
      recurrentAppID: appointment.recurrentAppointmentID,
    }));
  };

  const handleDateRangeChange = (
    range: Date[] | { start: Date; end: Date },
    view?: View
  ) => {
    if (Array.isArray(range)) {
      if (
        authRole?.includes(APPLICATION_ADMIN) ||
        authRole?.includes(APPLICATION_SUPER_ADMIN)
      ) {
        dispatch(
          fetchAppointmentbyCalender({
            startDate: dayjs(range[0]).format("YYYY-MM-DD"),
            endDate: dayjs(range[1]).format("YYYY-MM-DD"),
          })
        );
      } else {
        dispatch(
          fetchAppointmentbyCalenderWithUser({
            startDate: dayjs(range[0]).format("YYYY-MM-DD"),
            endDate: dayjs(range[1]).format("YYYY-MM-DD"),
            employeeID: authData?.userID || "",
          })
        );
      }
    } else {
      if (
        authRole?.includes(APPLICATION_ADMIN) ||
        authRole?.includes(APPLICATION_SUPER_ADMIN)
      ) {
        dispatch(
          fetchAppointmentbyCalender({
            startDate: dayjs(range.start).format("YYYY-MM-DD"),
            endDate: dayjs(range.end).format("YYYY-MM-DD"),
          })
        );
      } else {
        dispatch(
          fetchAppointmentbyCalenderWithUser({
            startDate: dayjs(range.start).format("YYYY-MM-DD"),
            endDate: dayjs(range.end).format("YYYY-MM-DD"),
            employeeID: authData?.userID || "",
          })
        );
      }
    }
  };

  // Custom styling for events
  const eventPropGetter = (event: CalenderEventCellType) => {
    return {
      style: {
        backgroundColor: event.color || "#3174ad", // Default color if event.color is not defined
        color: "#fff", // Text color
        borderRadius: "5px", // Rounded corners
        padding: "5px",
      },
    };
  };

  const handleSelectEvent = (
    event: CalenderEventCellType,
    e: React.SyntheticEvent<HTMLElement, Event>
  ) => {
    console.log("Selected event:", event);
    if (authRole?.includes(APPLICATION_CARE_GIVER)) {
      dispatch(
        fetchRecurrentAppointmentDetails({
          recurrentAppointmentID: event?.recurrentAppID?.toString(),
        })
      );
      setRecurrentAppointmentVisible(true);
    } else {
      dispatch(fetchSingleAppointment(event?.id.toString()));
      setIsAppointmentAddModalVisible(true);
      setIsEditing(false);
    }
  };

  return (
    <Stack width="100%" height="100%">
      <Stack width="100%" height="5%" />

      <Stack width="100%" height="90%" sx={{ backgroundColor: "white", p: 2 }}>
        <Calendar
          components={components}
          defaultDate={defaultDate}
          events={calenderEvents}
          eventPropGetter={eventPropGetter} // Add custom styling
          dayLayoutAlgorithm="no-overlap"
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          showMultiDayTimes
          step={60}
          popup
          views={views}
          onRangeChange={handleDateRangeChange}
          style={{ height: "100%", width: "100%" }}
        />
      </Stack>
    </Stack>
  );
};

export default AppointmentCalendar;
