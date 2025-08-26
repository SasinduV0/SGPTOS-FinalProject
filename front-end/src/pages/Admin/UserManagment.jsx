import React, { useState } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import SearchFilter from '../../components/AdminPanal/UserManagment/SearchFilter';
import EditUserModal from '../../components/AdminPanal/UserManagment/EditUserModal';
import { initialEmployee } from '../Data/initialEmployee'

function UserManagment() {

  const [employees, setEmployees ] = useState(initialEmployee);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartment]= useState('All Departments');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

 //Filter employees based on serach term and departmet

 const filteredEmployees = employees.filter(employee =>{
  const matchesSearch =

  employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDepartment = selectedDepartments === 'All Departments' || employee.department === selectedDepartments;

  return matchesSearch && matchesDepartment;
 });

 //Handle edit employee
 const handleEdit = (employee) => {
  setEditingEmployee({...employee});
  setIsEditModalOpen(true);
 };

 //Handle delete employee
 const handleDelete = (employeeId) => {
  if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.'))  {
    setEmployees(employees.filter(emp=>emp.id !== employeeId));
  }
 };

 //Handle update employee
 const handleUpdateEmployee = (updatedEmployee) => {
  setEmployees(employees.map(emp =>
    emp.id === updatedEmployee.id 
    ? updatedEmployee
    :emp
  ));
  setIsEditModalOpen(false);
  setEditingEmployee(null);
 }

 //Handle close modal
 const handleCloseModal = () =>{
  setIsEditModalOpen(false);
  setEditingEmployee(null)
 };

  return (
    <div>
    <div className='p-6'>

      {/*Serch and dropdown*/}
      <SearchFilter
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedDepartments={selectedDepartments}
      setSelectedDepartment={setSelectedDepartment}/>

      {/*Employee Table*/}
      <EmployeeTable
      employees={filteredEmployees}  //should add props
      onEdit={handleEdit}
      onDelete={handleDelete}/>
    </div>

    {/*Edit user modal*/}
    <EditUserModal
      isOpen={isEditModalOpen}
      employee={editingEmployee}
      onClose={handleCloseModal}
      onUpdate={handleUpdateEmployee}/>
    </div>
    
  )
}

export default UserManagment