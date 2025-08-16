import React, { useState } from 'react'



function EmployeeDetails({formData, setFormData}) {
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
        name="firstname"
        value={formData.firstname}
        onChange={e => setFormData({ ...formData, firstname: e.target.value})}
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      <div className="flex-1">
        <label htmlFor="lastname" className="block mb-1">Last Name</label>
        <input
        type="text"
        name="lastname"
        value={formData.lastname}
        onChange={e => setFormData({ ...formData, lastname: e.target.value})}
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>

      </div>

      <div>
        <label htmlFor="email" className="block mb-1">Email Address</label>
        <input
        type="email"
        name="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value})}
        className="border rounded-lg p-2 mt-2 w-full"/>
      </div>
      
      <div>
        <label htmlFor="phoneNumber" className="block mb-1">Phone Number</label>
        <input
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value})}
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
          name="employeeId"
          value={formData.employeeId}
          onChange={e => setFormData({ ...formData, employeeId: e.target.value})}
          className="border rounded-lg p-2 mt-2 w-full"/>
        </div>

        <div className="flex-1">
            <label htmlFor="department" className="block mb-1"></label>
            <select 
            name="department"
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value})}
            className="border rounded-lg p-2 mt-2 w-full">

              <option value="" disabled>Select Department</option>
              <option value="Cutting">Cutting</option>
              <option value="Packing">Packing</option>
              <option value="Sawing">Sawing</option>

            </select>
        </div>
      </div>

    </div>
  </div>

 )

}

export default EmployeeDetails