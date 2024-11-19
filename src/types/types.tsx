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
}
