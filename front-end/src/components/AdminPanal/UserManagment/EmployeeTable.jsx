import { initialEmployee } from '../../../pages/Data/initialEmployee';
import React from 'react'
import { Edit, Trash2 } from 'lucide-react';

function EmployeeTable({onEdit, employees, onDelete}) {
  return (
    <div className='overflow-x-auto'>
        <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
                <tr>
                    <th className='px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMPLOYEE</th>
                    <th className='px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> SECTION</th>
                    <th className='px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMAIL</th>
                    <th className='px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> EMPLOYEE ID</th>
                    <th className='px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'> ACTION</th>
                </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>

            {employees.map((employee)=>(
              <tr key={employee.id} className='hover:bg-gray-50 transition-colors duration-200'>
                <td className='text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm'>
                  {employee.firstName} {employee.lastName}
                </td>
                <td className='text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm'>
                  {employee.section}
                </td>
                <td className='text-left py-3 px-4 font-medium uppercase text-sm text-blue-600 hover:text-blue-800 cursor-pointer'>
                  {employee.email}
                </td>
                <td className='text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm'>
                  {employee.employeeId}
                </td>
                <td className='text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm'>

                  <div className='flex space-x-2'>

                    <button
                      onClick={()=> onEdit(employee)}
                      className='text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded hover:bg-blue-50'
                      title='Edit Employee'>

                        <Edit size={16}/>

                      </button>

                      <button
                        onClick={()=>onDelete(employee)}
                        className='text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded hover:bg-red-50'
                        title='Delete Employee'>

                          <Trash2 size={16}/>

                        </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            <p>No employee found matching your search criteria.</p>
          </div>
        )}
    </div>
  )
}

export default EmployeeTable