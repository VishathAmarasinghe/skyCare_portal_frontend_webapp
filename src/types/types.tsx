import { SvgIconProps } from "@mui/material";

export enum ConfirmationType {
  update = "update",
  send = "send",
  upload = "upload",
  accept = "accept",
}

export enum State {
  failed = "failed",
  success = "success",
  loading = "loading",
  idle = "idle",
}

export interface PreLoaderProps {
  message: string | null;
  hideLogo?: boolean;
  isLoading?: boolean;
}

export interface ErrorHandlerProps {
  message: string | null;
}

export interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ElementType<SvgIconProps>;
  name: string;
  urlLink: string;
}

export interface AppointmentTimeFrame {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface SettingsCardProps {
  title: SettingsCardTitle;
  icon: React.ElementType<SvgIconProps>;
  subText: string;
}

export type SettingsCardTitle =
  | "Languages"
  | "Client Type"
  | "Client Status"
  | "Client Classification"
  | "Care Plan Status"
  | "Appointment Types"
  | "Incident Types"
  | "Incident Status"
  | "Incident Questions"
  | "Care Giver File Uploads"
  | "Care Giver Salary";
