import employeeData from '../../../pages/Data/employeeData'
import React from 'react'

function EmployeeTable() {
  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
                <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMPLOYEE</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> SECTION</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMAIL</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMPLOYEE ID</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> ACTION</th>
                </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'></tbody>

            {EmployeeDetails.map((employee)=>
            <th key={employee.id} className='hover:bg-gray-50 transition-colors duration-200'></th>)}
        </table>
    </div>
  )
}

export default EmployeeTable