import React from 'react'
import SideBar from '../../components/SideBar'
import {ManagerLinks} from '../../pages/Data/SidebarNavlinks';

function Manager() {
  return (
    <div>
      <SideBar title="Manager Panel" links={ManagerLinks} />
      <div className='p-18'>
        {/* <UserProfile/> */}
      </div>
      
    </div>
  )
}

export default Manager