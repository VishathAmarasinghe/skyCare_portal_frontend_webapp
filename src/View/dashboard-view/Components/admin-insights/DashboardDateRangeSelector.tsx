import React from "react";
import {
  Button,
  ButtonGroup,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

export interface DateRangeValue {
  from: string;
  to: string;
}

interface DashboardDateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
}

const formatDate = (date: Dayjs) => date.format("YYYY-MM-DD");

const DashboardDateRangeSelector: React.FC<DashboardDateRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const fromDate = dayjs(value.from);
  const toDate = dayjs(value.to);
  const periodDays = toDate.diff(fromDate, "day") + 1;

  const applyPreset = (days: number) => {
    const to = dayjs();
    const from = to.subtract(days - 1, "day");
    onChange({ from: formatDate(from), to: formatDate(to) });
  };

  const applyThisMonth = () => {
    const to = dayjs();
    const from = to.startOf("month");
    onChange({ from: formatDate(from), to: formatDate(to) });
  };

  const handleFromChange = (date: Dayjs | null) => {
    if (!date) {
      return;
    }
    const nextFrom = date;
    const nextTo = nextFrom.isAfter(toDate) ? nextFrom : toDate;
    onChange({ from: formatDate(nextFrom), to: formatDate(nextTo) });
  };

  const handleToChange = (date: Dayjs | null) => {
    if (!date) {
      return;
    }
    const nextTo = date;
    const nextFrom = nextTo.isBefore(fromDate) ? nextTo : fromDate;
    onChange({ from: formatDate(nextFrom), to: formatDate(nextTo) });
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
    >
      <Stack>
        <Typography variant="h6" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fortnightly timesheet intake and worker document compliance (AEST)
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => applyPreset(14)}
            variant={periodDays === 14 ? "contained" : "outlined"}
          >
            Last 14 days
          </Button>
          <Button
            onClick={() => applyPreset(30)}
            variant={periodDays === 30 ? "contained" : "outlined"}
          >
            Last 30 days
          </Button>
          <Button onClick={applyThisMonth}>This month</Button>
        </ButtonGroup>

        <DatePicker
          label="From"
          value={fromDate}
          onChange={handleFromChange}
          slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
        />
        <DatePicker
          label="To"
          value={toDate}
          onChange={handleToChange}
          slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
        />
      </Stack>
    </Stack>
  );
};

export default DashboardDateRangeSelector;
