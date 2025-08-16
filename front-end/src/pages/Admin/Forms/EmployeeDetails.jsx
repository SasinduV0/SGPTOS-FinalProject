import React, { useState } from 'react'



function EmployeeDetails() {
 return(

  <div>
    <h2 className="text-x1 font-bold">Personal Information</h2>
    <input
    type="text"
    placeholder="Username"
    className="border rounded-lg p-2 mt-2 w-full"/>

    <input
    type="password"
    placeholder="Password"
    className="border rounded-lg p-2 mt-2 w-full"/>
    
  </div>
 )

}

export default EmployeeDetails