import React, { useState } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import { initialEmployee } from '../Data/employeeData'

function UserManagment() {

  const [employees, setEmployees ] = useState(initialEmployee);
  return (
    <div>UserManagment</div>
  )
}

export default UserManagment