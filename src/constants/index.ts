import { DashboardCardProps } from "../types/types";
import PeopleIcon from '@mui/icons-material/People';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import HailIcon from '@mui/icons-material/Hail';
import TaskIcon from '@mui/icons-material/Task';

export const CREATE_CLIENT_STEPS = ["Basic Info", "Interests and Dislikes", "Address Info"];

export const CREATE_CARE_PLAN_STEPS = ["Basic Info", "Goals", "Billing/budget"];

export const phoneNoRegex = /^\+?[1-9]\d{1,14}$/

export const DASHBOARD_CARDS:DashboardCardProps[]=[
    {
        title: "Clients",
        value: 100,
        icon: PeopleIcon,
    },
    {
        title: "Services",
        value: 30,
        icon: HomeRepairServiceIcon,
    },
    {
        title: "Staff",
        value: 20,
        icon: HailIcon,
    },
    {
        title: "Upcoming Appointments",
        value: 100,
        icon: TaskIcon,
    }
]
