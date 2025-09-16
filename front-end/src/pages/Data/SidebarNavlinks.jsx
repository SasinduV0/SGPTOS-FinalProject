import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import { MdAppRegistration, MdDashboard } from 'react-icons/md';
import { BiRfid } from "react-icons/bi";
import { RiRfidLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";

export const ManagerLinks = [
  { label: 'Dashboard', href: '/manager', icon: <FaTachometerAlt /> },
  { label: 'Employee Management', href: '/manager/em', icon: <FaUser /> },
  { label: 'Employee Efficiency', href: '/manager/ee', icon: <FaCog /> },
  { label: 'Live Dashboard', href: '/live-dashboard', icon: <MdDashboard /> },
];

export const adminLinks = [
  { label: 'User Registration', href: '/admin/UserRegistration', icon: <MdAppRegistration /> },
  { label: 'User Management', href: '/admin/UserManagment', icon: <FaUser /> },
  { label: 'Employees RFID Update', href: '/admin/EmployeeRfidMan', icon: <BiRfid /> },
  { label: 'Product RFID Update', href: '/admin/ProductRfidMan', icon: <RiRfidLine /> },
];

export const QCManagerLinks = [
  { label: 'Dashboard', href: '/qc', icon: <FaTachometerAlt /> },
  { label: 'Defect Rate', href: '/qc/DefectRate', icon: <FiAlertTriangle /> },
  { label: 'Employee Management', href: '/qc/Employee', icon: <FaUser /> },
];
export const ProfileLinks = [
  
];



