import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import { MdAppRegistration, MdDashboard } from 'react-icons/md';
import { BiRfid } from "react-icons/bi";
import { RiRfidLine } from "react-icons/ri";

export const ManagerLinks = [
  { label: 'Dashboard', href: '/manager', icon: <FaTachometerAlt /> },
  { label: 'Employee Management', href: '/manager/em', icon: <FaUser /> },
  { label: 'Employee Efficiency', href: '/manager/ee', icon: <FaCog /> },
  { label: 'Live Dashboard', href: '/live-dashboard', icon: <MdDashboard /> },
];

export const adminLinks = [
  { label: 'User Registration', href: '/admin/AdminDashboard', icon: <MdAppRegistration /> },
  { label: 'User Management', href: '/admin/userManagement', icon: <FaUser /> },
  { label: 'Employees RFID Update', href: '/admin/employeesRFID', icon: <BiRfid /> },
  { label: 'Product RFID Update', href: '/admin/ProductRfid/RFIDManagement', icon: <RiRfidLine /> },
];

export const ProfileLinks = [
  
];

