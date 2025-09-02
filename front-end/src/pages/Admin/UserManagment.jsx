import React, { useState, useEffect } from 'react'
import EmployeeTable from '../../components/AdminPanal/UserManagment/EmployeeTable'
import SearchFilter from '../../components/AdminPanal/UserManagment/SearchFilter';
import EditUserModal from '../../components/AdminPanal/UserManagment/EditUserModal';
import Header from '../../components/AdminPanal/UserManagment/Header';
import ActionButton from '../../components/AdminPanal/UserManagment/ActionButton';
import { initialEmployee } from '../Data/initialEmployee'

function UserManagment() {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState(initialEmployee);
  const [filteredEmployees, setFilteredEmployees] = useState(initialEmployee);

  // Debug log to check data structure
  useEffect(() => {
    console.log('Initial employee data:', employees[0]);
  }, []);

  // Filter employees based on search and department
  useEffect(() => {
    let filtered = [...employees];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(emp => emp.section === selectedDepartment);
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, employees]);

  // Handler functions
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
    handleCloseModal();
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Employee Name',
      key: 'name',
      render: (row) => `${row.firstName || ''} ${row.lastName || ''}`,
      className: 'font-medium text-gray-900'
    },
    {
      header: 'Department',
      key: 'section',
      className: 'text-gray-800'
    },
    {
      header: 'Employee ID',
      key: 'empId',
      className: 'font-mono text-gray-800'
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

  return (
    <div className='p-6 space-y-6'>
      <Header />

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
      />

      <EmployeeTable 
        columns={columns}
        data={filteredEmployees}
        emptyMessage="Add employees to see them listed here"
      />

      {isEditModalOpen && (
        <EditUserModal
          isOpen={isEditModalOpen}
          employee={editingEmployee}
          onClose={handleCloseModal}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </div>
  )
}

export default UserManagment