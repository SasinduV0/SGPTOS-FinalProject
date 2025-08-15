import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";

export const ManagerLinks = [
  { label: 'Dashboard', href: '/manager', icon: <FaTachometerAlt /> },
  { label: 'Employee Management', href: '/manager/em', icon: <FaUser /> },
  { label: 'Employee Efficiency', href: '/manager/ee', icon: <FaCog /> },
  { label: 'Live Dashboard', href: '/live-dashboard', icon: <MdDashboard /> },
];

export const adminLinks = [
  { label: 'Home', href: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Employee', href: '/admin/users', icon: <FaUser /> },
  { label: 'Settings', href: '/admin/settings', icon: <FaCog /> },
  { label: 'Live Dashboard', href: '/live-dashboard', icon: <MdDashboard /> },
];

export const ProfileLinks = [
  
];

