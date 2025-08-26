import React, { useState } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import { initialEmployee } from '../Data/employeeData'

function UserManagment() {

  const [employees, setEmployees ] = useState(initialEmployee);
  return (
    <div className='p-6'>
      {/*Employee Table*/}
      <EmployeeTable
      employees={''}  //should add props
      onEdit={''}
      onDelete={''}/>
    </div>
  )
}

export default UserManagment