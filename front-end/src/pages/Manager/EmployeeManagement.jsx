import React from 'react'
import SideBar from '../../components/SideBar'
import {ManagerLinks} from '../../pages/Data/SidebarNavlinks';

function EmployeeManagement() {
  return (
    <div className='ml-70 mt-20'>
        <SideBar title="Manager Panel" links={ManagerLinks} />
        EmployeeManagement Dashboard
    </div>
  )
}

export default EmployeeManagement