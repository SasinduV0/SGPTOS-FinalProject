import React, { useState } from 'react'



function EmployeeDetails() {
 return(

  <div>

{/*//Personal information*/}

    <div className=" max-w-2x1 mx-auto p-4">
      <h2 className="text-x1 font-bold text-center">Personal Information</h2>
      <p className="text-x1 font-bold text-center">Enter the employee’s basic details</p>

      <div className="flex flex-row gap-4 w-full">

      <div  className="flex-1">
        <label htmlfor="firstname" className="block mb-1">Fist Name</label>
        <input
        type="text"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      <div className="flex-1">
        <label htmlfor="Lastname" className="block mb-1">Last Name</label>
        <input
        type="text"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      </div>

      <div>
        <label htmlfor="Email" className="block mb-1">Email Address</label>
        <input
        type="email"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>
      
      <div>
        <label htmlfor="Phone Number" className="block mb-1">Phone Number</label>
        <input
        type="tel"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

    </div>

{/*//Work information*/}
    <div>

      <h2 className="text-x1 font-bold text-center">Work Informaton</h2>
      <p className="text-x1 font-bold text-center">Assign department and employee details</p>

      <div calssName="flex">

        <div className="flex-1">
          <lable htmlfor="employeeId" classname="block mb-1">Employee ID</lable>
          <input
          type="text"
          className="border rounded-lg p-2 mt-2 w-full"/>
        </div>

        <div classname="flex-1">
            <lable htmlfor="department" classname="block mb-1"></lable>
            <select className="border rounded-lg p-2 mt-2 w-full">

              <option value="" disabled>Select Department</option>
              <option value="Cutting">Cutting</option>
              <option value="Cutting">packing</option>
              <option value="Cutting">sawing</option>

            </select>
        </div>
      </div>

    </div>
  </div>

 )

}

export default EmployeeDetails