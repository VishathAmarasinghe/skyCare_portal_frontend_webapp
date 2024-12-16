import { DashboardCardProps, SettingsCardProps } from "../types/types";
import PeopleIcon from '@mui/icons-material/People';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import HailIcon from '@mui/icons-material/Hail';
import TaskIcon from '@mui/icons-material/Task';
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

export const CREATE_CLIENT_STEPS = ["Basic Info", "Interests and Dislikes", "Address Info"];

export const CREATE_CARE_PLAN_STEPS = ["Basic Info", "Goals", "Billing/budget"];

export const CREATE_APPOINTMENT_STEPS = ["Basic Info", "Address & Participants", "Uploads"];

export const  CREATE_CARE_GIVER_STEPS = ["Basic Info", "File Uploads", "Salary"];

export const  CREATE_CARE_GIVER_OUTSIDE_REGISTRATION = ["Basic Info", "File Uploads", "Agreement"];

export const CREATE_INCIDENT_STEPS = ["Basic Info", "More Info", "Questions","Documents","Involved Parties"];

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const phoneNoRegex = /^\+?[1-9]\d{1,14}$/

export const DASHBOARD_CARDS:DashboardCardProps[]=[
    {
        title: "Clients",
        value: 100,
        icon: PeopleIcon,
        name:"clientCount"
    },
    {
        title: "Services",
        value: 30,
        icon: HomeRepairServiceIcon,
        name:"serviceCount"
    },
    {
        title: "Staff",
        value: 20,
        icon: HailIcon,
        name:"staffCount"
    },
    {
        title: "Admins",
        value: 100,
        icon: TaskIcon,
        name:"adminCount"
    }
]


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
      title: "Client Classification",
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
  ];
