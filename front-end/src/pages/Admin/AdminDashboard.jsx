import React from 'react'
import SideBar from '../../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import {adminLinks} from '../Data/SidebarNavlinks'
import ProductRfidMan from './ProductRfidMan';
import UserRegistration from './UserRegistration';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeRfidMan from './EmployeeRfidMan';

function AdminDashboard() {

return(

  <div className='ml-70 mt-20'>
        <SideBar title="Admin Panal" links={adminLinks} />

  <div className='flex-1 p-5'>
    <Routes>

      <Route index element={<Navigate to='UserRegistration'/>}/>
      <Route path='UserRegistration' element={<UserRegistration/>}/>
      <Route path='ProductRfidMan' element={<ProductRfidMan/>}/>
      <Route path='EmployeeRfidMan' element={<EmployeeRfidMan/>}/>
      {/*<Route path='UserManagment' element={<UserManagment/>}/>*/}

        

    </Routes>
  </div>
   

</div>
)};

export default AdminDashboard