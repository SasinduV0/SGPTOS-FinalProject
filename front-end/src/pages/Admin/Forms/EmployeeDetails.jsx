import React, { useState } from 'react'



function EmployeeDetails({nextStep, prevStep, cancel}) {

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
    <div className="border p-6 rounded shadow-md bg-white w-96">
      <h2 className="text-x1 font-bold mb-4">Employee Details</h2>

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

    <div className="mb-4">

      <label className="block mb-2 front-medium">
        Email
      </label>

      <input 
        type="email"
        value={employeeEmail}
        onChange={(e)=>setEmployeeEmail(e.target.value)}
        className= "border p-2 rounded w-full"
        placeholder="Enter employee email"
        />
      
    </div>

    {/*Navigation button set*/}

    <div className="flex justify-between mt-4">

      <button onClick={prevStep}        //Previous button
        className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Previous
      </button>

      <button onClick={handleNext}       //next button
        className="bg-gray-500 text-white px-4 py-2 rounded"
          >
          Next
      </button>

      <button onClick={cancel}          //Cancel button
        className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            cancel
      </button>

    </div>

    </div>
  )
}

export default EmployeeDetails