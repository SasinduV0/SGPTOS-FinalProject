import React, { useState } from 'react'



function EmployeeDetails() {



  return (
    <div className="mb-4">

        <label className="block mb-2 front-medium">
            Employee Name
        </label>

        <input
            type="text"
            value={employeeName}
            onChange={()=> setEmployeeName (e.target.value)}
            className="border p-2 rounded w-64"
            placeholder="Enter employee name"/>

    </div>
  )
}

export default EmployeeDetails