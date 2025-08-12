import React from 'react'
import SideBar from '../../components/SideBar'
import {ManagerLinks} from '../../pages/Data/SidebarNavlinks';

function Manager() {
  return (
    <div className='ml-70 mt-20'>
      <SideBar title="Manager Panel" links={ManagerLinks} />
      <div>
        Manager Dashboard
      </div>
      
    </div>
  )
}

export default Manager