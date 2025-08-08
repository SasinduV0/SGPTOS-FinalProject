import React from 'react'
import SideBar from '../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';

const ManagerLinks = [
  { label: 'link1', href: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'link2', href: '/admin/users', icon: <FaUser /> },
  { label: 'link3', href: '/admin/settings', icon: <FaCog /> },
];

function Manager() {
  return (
    <div>
      <SideBar title="Manager Panel" links={ManagerLinks} />
    </div>
  )
}

export default Manager