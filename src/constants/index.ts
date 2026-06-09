import { DashboardCardProps, SettingsCardProps } from "../types/types";
import PeopleIcon from "@mui/icons-material/People";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import HailIcon from "@mui/icons-material/Hail";
import TaskIcon from "@mui/icons-material/Task";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CampaignIcon from "@mui/icons-material/Campaign";
import DescriptionIcon from "@mui/icons-material/Description";
import DataObjectIcon from "@mui/icons-material/DataObject";
import EmailIcon from "@mui/icons-material/Email";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import RuleIcon from "@mui/icons-material/Rule";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";

export const CREATE_CLIENT_STEPS = [
  "Basic Info",
  "Interests and Dislikes",
  "Address Info"
];

export const CREATE_CARE_PLAN_STEPS = [
  "Basic Info",
  "Goals",
  "Living Situation & Supports",
  "Support Schedule",
  "Risk & Outcomes",
  "Billing & Budget",
];

export const CREATE_APPOINTMENT_STEPS = [
  "Basic Info",
  "Address & Participants",
  "Uploads",
];

export const CREATE_CARE_GIVER_STEPS = ["Basic Info", "File Uploads", "Salary"];

export const DEFAULT_CARE_GIVER_TYPE = "Not specified";

export const CARE_GIVER_TYPES = [
  "Not specified",
  "Casual",
  "Contractor",
  "Full-time",
  "Part-time",
] as const;

export type CareGiverType = (typeof CARE_GIVER_TYPES)[number];

export const getCareGiverTypeLabel = (careGiverType?: string | null): string =>
  careGiverType?.trim() || DEFAULT_CARE_GIVER_TYPE;

export const isUnspecifiedCareGiverType = (careGiverType?: string | null): boolean =>
  getCareGiverTypeLabel(careGiverType) === DEFAULT_CARE_GIVER_TYPE;

export const RETIRED_AGREEMENT_TEMPLATE_KEYS = ["worker_unspecified"] as const;

export const isVisibleAgreementTemplate = (template: {
  templateKey: string;
  status?: string | null;
}): boolean =>
  template.status?.toLowerCase() !== "inactive" &&
  !RETIRED_AGREEMENT_TEMPLATE_KEYS.includes(
    template.templateKey as (typeof RETIRED_AGREEMENT_TEMPLATE_KEYS)[number]
  );

export const getCareGiverTypeChipStyle = (
  careGiverType?: string | null
): { backgroundColor: string; color: string; borderColor: string } => {
  switch (getCareGiverTypeLabel(careGiverType)) {
    case "Casual":
      return { backgroundColor: "#E3F2FD", color: "#1565C0", borderColor: "#1565C0" };
    case "Contractor":
      return { backgroundColor: "#FFF3E0", color: "#E65100", borderColor: "#E65100" };
    case "Full-time":
      return { backgroundColor: "#E8F5E9", color: "#2E7D32", borderColor: "#2E7D32" };
    case "Part-time":
      return { backgroundColor: "#F3E5F5", color: "#6A1B9A", borderColor: "#6A1B9A" };
    default:
      return { backgroundColor: "#F5F5F5", color: "#616161", borderColor: "#9E9E9E" };
  }
};

export const CREATE_CARE_GIVER_OUTSIDE_REGISTRATION = [
  "Basic Info",
  "File Uploads",
  "Agreement",
];

export const CREATE_CARE_GIVER_INTERNAL_UPDATE = ["Basic Info", "File Uploads"];

export const CREATE_INCIDENT_STEPS = [
  "Basic Info",
  "Questions",
  "Documents",
  "Involved Parties",
];

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const phoneNoRegex = /^\+?[1-9]\d{1,14}$/;

export const DASHBOARD_CARDS: DashboardCardProps[] = [
  {
    title: "Clients",
    value: 100,
    icon: PeopleIcon,
    name: "clientCount",
    urlLink: "/Clients",
  },
  {
    title: "Appointments",
    value: 30,
    icon: HomeRepairServiceIcon,
    name: "serviceCount",
    urlLink: "/Appointments",
  },
  {
    title: "Staff",
    value: 20,
    icon: HailIcon,
    name: "staffCount",
    urlLink: "/Employees",
  },
  {
    title: "Admins",
    value: 100,
    icon: TaskIcon,
    name: "adminCount",
    urlLink: "/Employees",
  },
];

export const SETTINGS_CARD_ARRAY: SettingsCardProps[] = [
  {
    title: "Languages",
    icon: AccountCircleIcon,
    subText: "Manage supported languages for user profiles",
  },
  {
    title: "Client Type",
    icon: GroupIcon,
    subText: "Categorize clients by type",
  },
  {
    title: "Client Status",
    icon: BadgeIcon,
    subText: "Track and update client activity statuses",
  },
  {
    title: "Client Fundings",
    icon: BusinessIcon,
    subText: "Organize clients based on classification",
  },
  {
    title: "Care Plan Status",
    icon: PlaylistAddCheckIcon,
    subText: "Monitor care plan progress and statuses",
  },
  {
    title: "Appointment Types",
    icon: EventNoteIcon,
    subText: "Define and manage appointment categories",
  },
  {
    title: "Incident Types",
    icon: ReportProblemIcon,
    subText: "Set up different types of incident reports",
  },
  {
    title: "Incident Status",
    icon: CheckCircleOutlineIcon,
    subText: "Monitor resolution status of incidents",
  },
  {
    title: "Incident Questions",
    icon: QuestionAnswerIcon,
    subText: "Configure questions for incident reports",
  },
  {
    title: "Care Giver File Uploads",
    icon: CloudUploadIcon,
    subText: "Manage file uploads for care givers",
  },
  {
    title: "Care Giver Salary",
    icon: MonetizationOnIcon,
    subText: "Track and update care giver salary details",
  },
  {
    title: "Home Message",
    icon: CampaignIcon,
    subText: "Configure the home banner message for caregivers",
  },
  {
    title: "Agreement Templates",
    icon: DescriptionIcon,
    subText: "Create and publish service agreement templates",
  },
  {
    title: "Placeholder Reference",
    icon: DataObjectIcon,
    subText: "Browse merge field tokens for templates",
  },
  {
    title: "Email Templates",
    icon: EmailIcon,
    subText: "Manage agreement email templates and test send",
  },
  {
    title: "Organization Details",
    icon: BusinessCenterIcon,
    subText: "Configure organization info and logo for agreements",
  },
  {
    title: "Assignment Rules",
    icon: RuleIcon,
    subText: "Map care giver types to agreement templates",
  },
  {
    title: "Reference Materials",
    icon: AttachFileIcon,
    subText: "Upload documents to attach when sending agreements",
  },
  {
    title: "Staff Training Settings",
    icon: SchoolOutlinedIcon,
    subText: "Configure training courses and providers",
  },
  {
    title: "Behavior Support Settings",
    icon: PsychologyOutlinedIcon,
    subText: "Configure RP types, authorisation and intensity options",
  },
];
