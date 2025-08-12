import React from 'react'
import UserProfile from '../components/UserProfile'
import SideBar from '../components/SideBar'
import {ProfileLinks} from '../pages/Data/SidebarNavlinks'

function Profile() {
  return (
    <div>
        <SideBar title="Settings" links={ProfileLinks}/>
        <UserProfile/>
    </div>
  )
}

export default Profile