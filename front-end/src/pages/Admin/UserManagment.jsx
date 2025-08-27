import React, { useState } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import SearchFilter from '../../components/AdminPanal/UserManagment/SearchFilter';
import EditUserModal from '../../components/AdminPanal/UserManagment/EditUserModal';
import Header from '../../components/AdminPanal/UserManagment/Header';
import ActionButton from '../../components/AdminPanal/UserManagment/ActionButton';
import { initialEmployee } from '../Data/initialEmployee'

function UserManagment() {

  const columns = [
    {
      header: 'Employee Name',
      key: 'fullName',
      render: (row) => `${row.firstName} ${row.lastName}`,
      className: 'font-mono text-sm text-gray-800'
    },
    {
      header: 'Section',
      key: 'section',
      className: 'text-gray-800'
    },
    {
      header: 'Employee ID',
      key: 'employeeId',
      className: 'text-gray-800'
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <ActionButton
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row.id)}
          editTooltip="Edit Employee"
          deleteTooltip="Delete Employee"
        />
      )
    }
  ];

  // handler functions...

  return (
    <div className='p-6'>
      <Header/>

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartments={selectedDepartments}
        setSelectedDepartment={setSelectedDepartment}
      />

      <EmployeeTable 
        columns={columns}
        data={filteredEmployees}
        emptyMessage="Add employees to see them listed here"
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        employee={editingEmployee}
        onClose={handleCloseModal}
        onUpdate={handleUpdateEmployee}
      />
    </div>
  )
}

export default UserManagment