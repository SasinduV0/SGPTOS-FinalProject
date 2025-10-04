import React, { useState, useEffect } from 'react';
import {User} from 'lucide-react'
import EditUserModal from '../../components/AdminPanal/EditUserModal';
import Header from '../../components/AdminPanal/Header';
import ActionButton from '../../components/AdminPanal/ActionButton';
import { initialEmployee } from '../Data/initialEmployee'
import SearchBar from '../../components/AdminPanal/SearchBar';
import FilterBar from '../../components/AdminPanal/FilterBar';
import DataTable from '../../components/AdminPanal/DataTable';

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

  //For filter bar
  const departments = ['All Departments', 'Cutting', 'QC', 'Sewing', 'Packing'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">

          <div className="flex items-center justify-between p-6 border-b">
              <Header title="User Managment" icon={<User />} />
            </div>

              <div className='flex items-center gap-6 bg-gray-50'>
                {/*Department filter*/}
                <FilterBar
                selectedOption={selectedDepartment}
                setSelectedOption={setSelectedDepartment}
                options={departments}
                selectLabel='Department'
                searchPlaceholder=''/>

                {/*Search Bar*/}
                <div className='flex-1'>
                  <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder="Search Name or Employee ID"
                  />
                </div>

              </div>

              <div className="p-6">
                <h2 className="text-lg font-medium">Users ({filteredEmployees.length})</h2>
                <DataTable
                  columns={columns}
                  data={filteredEmployees}
                  emptyMessage="Try adjusting search or filters"
                />
              </div>

              {isEditModalOpen && (
                <EditUserModal
                  isOpen={isEditModalOpen}
                  employee={editingEmployee}
                  onClose={handleCloseModal}
                  onUpdate={handleUpdateEmployee}
                />
              )}
            </div>  
          </div>
        </div>
    
      
  );
};

export default UserManagment