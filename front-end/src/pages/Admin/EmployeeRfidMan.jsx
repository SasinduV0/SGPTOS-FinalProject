import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/AdminPanal/Header';
import SearchBar from '../../components/AdminPanal/SearchBar';
import DataTable from '../../components/AdminPanal/DataTable';
import StatusBadge from '../../components/AdminPanal/StatusBadge';
import ActionButton from '../../components/AdminPanal/ActionButton';
import RfidModal from '../../components/AdminPanal/RfidModal';
import AddButton from '../../components/AdminPanal/AddButton';

const API_BASE_URL = 'http://localhost:8001/api/rfid-employees';

const EmployeeRfidMan = () => {
  const [rfidEntries, setRfidEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // RFID employees fetch කරන්න
  const fetchRfidEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      console.log('Fetching RFID employees with params:', params);
      
      const response = await axios.get(API_BASE_URL, { params });
      console.log('Fetched RFID employees:', response.data);
      
      setRfidEntries(response.data.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error fetching employees';
      setError(errorMsg);
      console.error('Error fetching RFID employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component load වෙද්දී data fetch කරන්න
  useEffect(() => {
    fetchRfidEmployees();
  }, []);

  // Search term change වෙද්දී data refresh කරන්න
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRfidEmployees();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddEntry = () => {
    console.log('Opening add modal');
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    console.log('Opening edit modal for:', entry);
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this RFID entry?')) {
      try {
        console.log('Deleting employee with ID:', id);
        
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        console.log('Delete response:', response.data);
        
        await fetchRfidEmployees(); // Data refresh කරන්න
        alert('Employee deleted successfully!');
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error deleting employee';
        setError(errorMsg);
        console.error('Error deleting employee:', error);
        alert('Error deleting employee: ' + errorMsg);
      }
    }
  };

  const handleSaveEntry = async (entryData) => {
    try {
      console.log('Saving entry data:', entryData);
      
      let response;
      if (editingEntry) {
        // Edit existing entry
        console.log('Updating employee with ID:', editingEntry._id);
        response = await axios.put(`${API_BASE_URL}/${editingEntry._id}`, entryData);
        console.log('Update response:', response.data);
        alert('Employee updated successfully!');
      } else {
        // Add new entry
        console.log('Creating new employee');
        response = await axios.post(API_BASE_URL, entryData);
        console.log('Create response:', response.data);
        alert('Employee created successfully!');
      }
      
      setIsModalOpen(false);
      setEditingEntry(null);
      await fetchRfidEmployees(); // Data refresh කරන්න
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error saving employee';
      setError(errorMsg);
      console.error('Error saving employee:', error);
      alert('Error saving employee: ' + errorMsg);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log('Updating status for employee:', id, 'to:', newStatus);
      
      const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      await fetchRfidEmployees(); // Data refresh කරන්න
      alert('Status updated successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error updating status';
      setError(errorMsg);
      console.error('Error updating status:', error);
      alert('Error updating status: ' + errorMsg);
    }
  };

  const tableColumns = [
    {
      header: 'RFID NUMBER',
      key: 'rfidNumber',
      className: 'font-mono text-sm text-gray-800'
    },
    {
      header: 'NAME',
      key: 'empName',
      className: 'text-gray-800'
    },
    {
      header: 'EMPLOYEE ID',
      key: 'empId',
      className: 'text-gray-800'
    },
    {
      header: 'DEPARTMENT',
      key: 'department',
      className: 'text-gray-800'
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (entry) => (
        <StatusBadge
          status={entry.status}
          onChange={(newStatus) => handleStatusChange(entry._id, newStatus)}
        />
      )
    },
    {
      header: 'ACTION',
      key: 'actions',
      render: (entry) => (
        <ActionButton
          onEdit={() => handleEditEntry(entry)}
          onDelete={() => handleDeleteEntry(entry._id)}
          editTooltip="Edit RFID Entry"
          deleteTooltip="Delete RFID Entry"
        />
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm">
            
            <div className="flex items-center justify-between p-6 border-b">
              <Header title="Employee RFID Management" icon={<User />} />
              <AddButton handleAddEntry={handleAddEntry} text="Add Employee" />
            </div>

            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search RFID, Name or Employee ID"
            />

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700 text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading RFID employees...</p>
              </div>
            )}

            {/* RFID Entries */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  RFID Entries ({rfidEntries.length})
                </h2>
              </div>

              {!loading && (
                <DataTable
                  columns={tableColumns}
                  data={rfidEntries}
                  emptyMessage="No RFID employees found. Try adjusting your search criteria or add a new employee."
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RFID Modal */}
      <RfidModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing modal');
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialData={editingEntry}
      />
    </div>
  );
};

export default EmployeeRfidMan;