import React, { useState } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import SearchFilter from '../../components/AdminPanal/UserManagment/SearchFilter';
import { initialEmployee } from '../Data/employeeData'

function UserManagment() {

  const [employees, setEmployees ] = useState(initialEmployee);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartment]= useState('All Departments');

  return (
    <div className='p-6'>

      {/*Serch and dropdown*/}
      <SearchFilter
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedDepartments={selectedDepartments}
      setSelectedDepartment={setSelectedDepartment}/>

      {/*Employee Table*/}
      <EmployeeTable
      employees={''}  //should add props
      onEdit={''}
      onDelete={''}/>
    </div>
  )
}

export default UserManagment