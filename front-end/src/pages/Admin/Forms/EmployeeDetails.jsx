import React, { useState } from 'react'



function EmployeeDetails() {

const [employeeName, setEmployeeName] =  useState('');
const [employeeEmail, setEmployeeEmail] = useState('');

//handle next button click
const handleNext =()=>{
  if (employeeName.trim()==='' || employeeEmail.trim()===''){
    alert("please fill all field");
    return;
  }

  nextStep(); //move to security step
}

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