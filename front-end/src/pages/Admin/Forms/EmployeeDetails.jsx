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
        <label htmlFor="firstname" className="block mb-1">Fist Name</label>
        <input
        type="text"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      <div className="flex-1">
        <label htmlFor="Lastname" className="block mb-1">Last Name</label>
        <input
        type="text"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      </div>

      <div>
        <label htmlFor="Email" className="block mb-1">Email Address</label>
        <input
        type="email"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>
      
      <div>
        <label htmlFor="Phone Number" className="block mb-1">Phone Number</label>
        <input
        type="tel"
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

    </div>

{/*//Work information*/}
    <div>

      <h2 className="text-x1 font-bold text-center">Work Informaton</h2>
      <p className="text-x1 font-bold text-center">Assign department and employee details</p>

      <div className="flex">

        <div className="flex-1">
          <label htmlFor="employeeId" className="block mb-1">Employee ID</label>
          <input
          type="text"
          className="border rounded-lg p-2 mt-2 w-full"/>
        </div>

        <div className="flex-1">
            <label htmlFor="department" className="block mb-1"></label>
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