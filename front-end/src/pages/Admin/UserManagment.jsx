import React, { useState, useEffect } from 'react';
import {User} from 'lucide-react'
import EditUserModal from '../../components/AdminPanal/EditUserModal';
import Header from '../../components/AdminPanal/Header';
import ActionButton from '../../components/AdminPanal/ActionButton';
import SearchBar from '../../components/AdminPanal/SearchBar';
import FilterBar from '../../components/AdminPanal/FilterBar';
import DataTable from '../../components/AdminPanal/DataTable';
import ConfirmDeleteUser from '../../components/AdminPanal/ConfirmDeleteUser';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api/users';

function UserManagment() {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_BASE_URL);
      console.log('Fetched users:', response.data);
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and department
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedDepartment, users]);

  // Handler functions
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  // Updated delete handler - opens confirmation modal
  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
    setDeleteModalOpen(true);
  };

  // Actual delete function after confirmation
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${deleteTarget._id}`);
      await fetchUsers(); // Refresh the list
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || err.message || 'Error deleting user');
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await axios.put(`${API_BASE_URL}/${updatedUser._id}`, updatedUser);
      await fetchUsers(); // Refresh the list
      alert('User updated successfully!');
      handleCloseModal();
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || err.message || 'Error updating user');
    }
  };

  // Table columns configuration
  const columns = [
    {
      header: 'User Name',
      key: 'name',
      render: (row) => `${row.firstname || ''} ${row.lastname || ''}`,
      className: 'font-medium text-gray-900'
    },
    {
      header: 'Department',
      key: 'department',
      className: 'text-gray-800'
    },
    {
      header: 'User ID',
      key: 'userID',
      className: 'font-mono text-sm'
    },
    {
      header: 'Username',
      key: 'username',
      className: 'font-mono text-sm'
    },
    {
      header: 'User Role',
      key: 'role',
      className: 'font-mono text-sm'
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <ActionButton
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDeleteClick(row)}
          editTooltip="Edit User"
          deleteTooltip="Delete User"
        />
      )
    }
  ];

  // Updated departments list
  const departments = [
    'All Departments', 
    'Cutting', 
    'Quality Control', 
    'Sewing', 
    'Packing',
    'Finishing'
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-base text-gray-800">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">

          <div className="flex items-center justify-between p-6 border-b">
              <Header title="User Management" icon={<User />} />
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
                  searchPlaceholder="Search Name, User ID or Username"
                  />
                </div>
              </div>

              {/* Add error and loading states */}
              {error && <div className="p-4 text-red-600">{error}</div>}
              {loading && <div className="p-6 text-center">Loading users...</div>}

              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  emptyMessage="No users found. Try adjusting search or filters"
                />
              </div>

              {isEditModalOpen && (
                <EditUserModal
                  isOpen={isEditModalOpen}
                  user={editingUser}
                  onClose={handleCloseModal}
                  onUpdate={handleUpdateUser}
                />
              )}

              {/*Delete Confirmation Modal */}
              {deleteModalOpen && deleteTarget && (
                <ConfirmDeleteUser
                  isOpen={deleteModalOpen}
                  onClose={() => {
                    setDeleteModalOpen(false);
                    setDeleteTarget(null); // Clear target when closing
                  }}
                  onConfirm={confirmDelete}
                  user={deleteTarget}
                />
              )}
            </div>  
          </div>
        </div>
  );
};

export default UserManagment