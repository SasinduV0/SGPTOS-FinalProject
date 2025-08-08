import React from 'react'
import SideBar from '../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';

const adminLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Users', href: '/admin/users', icon: <FaUser /> },
  { label: 'Settings', href: '/admin/settings', icon: <FaCog /> },
];

function AdminDashboard() {
  return (
    <>
    <SideBar title="Admin Panel" links={adminLinks} />
      <div className='h-screen w-full flex items-center justify-center gap-4 bg-gray-300 pl-64 mt-16'>
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[250px]'>chart 1</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
        </div>
        <div className='w-[30%]'>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[680px]'>chart 2</div>
        </div>
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[265px]'>chart 4</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[400px]'>chart 5</div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard