import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import { MdAppRegistration, MdDashboard } from 'react-icons/md';
import { BiRfid } from "react-icons/bi";
import { RiRfidLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { BsBarChartLine } from "react-icons/bs";
import { MdOutlineSpaceDashboard } from "react-icons/md";


export const ManagerLinks = [
  { label: 'Dashboard', href: '/manager', icon: <FaTachometerAlt /> },
  { label: 'Employee Management', href: '/manager/employee-management', icon: <FaUser /> },
  { label: 'Report Analytics', href: '/manager/report-analytics', icon: <FaCog /> },
  { label: 'Production', href: '/manager/production', icon: <MdDashboard /> },
];

export const SupervisorLinks = [
  { label: 'Home', href: '/supervisor', icon: <IoHomeOutline /> },
  { label: 'Worker Assignment', href: '/supervisor/worker-assignment', icon: <FiUsers /> },
  { label: 'Line Productivity', href: '/supervisor/lineProd', icon: <BsBarChartLine /> },
  { label: 'Live Dashboard', href: '/live-dashboard', icon: <MdOutlineSpaceDashboard /> },
];

export const adminLinks = [
  { label: 'User Registration', href: '/admin/UserRegistration', icon: <MdAppRegistration /> },
  { label: 'User Management', href: '/admin/UserManagment', icon: <FaUser /> },
  { label: 'Employees RFID Update', href: '/admin/EmployeeRfidMan', icon: <BiRfid /> },
  { label: 'Product RFID Update', href: '/admin/ProductRfidMan', icon: <RiRfidLine /> },
];

export const ProfileLinks = [
  
];

