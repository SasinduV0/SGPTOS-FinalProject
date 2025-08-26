import React from 'react'
import { Search } from 'lucide-react';

function SearchFilter({searchTerm, setSearchTerm, selectedDepartments, setSelectedDepartment}) {

//list of departments to display in the dropdown
  const departments = ['All Departments', 'Production', 'sawing', 'Quality Control'];

  return (
    <div className='bg-white shadow-sm p-4 mb-6'>
      <div className='flex justify-between item-center'>

        {/*Search input with an icon*/}
        <div className='relative flex-1 max-w-md'>

          <Search size={20} className='absolute left-3 top-1/2 transform-translate-y-1/2 text-gray-400'/>

          <input
            type='text'
            placeholder='Search by name, email or employee ID'
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'/>
        </div>

        {/*Department selection dropdown*/}
        <div className='relative flex-1'>
          <select
            value={selectedDepartments}
            onChange={(e)=>setSelectedDepartment(e.target.value)}
            className='ml-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>

              {departments.map((dept)=>(
                <option key={dept} value={dept}>{dept}</option>
              ))}

            </select>
        </div>
      </div>
    </div>
  )
}

export default SearchFilter