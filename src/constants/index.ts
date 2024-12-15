import { DashboardCardProps } from "../types/types";
import PeopleIcon from '@mui/icons-material/People';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import HailIcon from '@mui/icons-material/Hail';
import TaskIcon from '@mui/icons-material/Task';

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
