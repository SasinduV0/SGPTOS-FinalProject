import React, { useState } from 'react';
import { User } from 'lucide-react';
import Header from '../../components/AdminPanal/Header';
import SearchBar from '../../components/AdminPanal/SearchBar';
import FilterBar from '../../components/AdminPanal/FilterBar';
import DataTable from '../../components/AdminPanal/DataTable';
import StatusBadge from '../../components/AdminPanal/StatusBadge';
import ActionButton from '../../components/AdminPanal/ActionButton';
import RfidModal from '../../components/AdminPanal/RfidModal';
import Modal from '../../components/AdminPanal/Modal';
import AddButton from '../../components/AdminPanal/AddButton';

const ProductRfidMan = () => {
  const [rfidEntries, setRfidEntries] = useState([
    {
      id: '1',
      rfidNumber: 'RFID01-234',
      unit: 'UNIT 1',
      workplace: 'LINE 1',
      status: 'ACTIVE'
    },
    {
      id: '2',
      rfidNumber: 'RFID01-235',
      unit: 'UNIT 1',
      workplace: 'LINE 2',
      status: 'ACTIVE'
    },
    {
      id: '3',
      rfidNumber: 'RFID01-236',
      unit: 'UNIT 2',
      workplace: 'LINE 3',
      status: 'INACTIVE'
    },
    {
      id: '4',
      rfidNumber: 'RFID01-789',
      unit: 'UNIT 1',
      workplace: 'LINE 4',
      status: 'ACTIVE'
    }
  ]);

  // State variables for modal, editing, search, and filters
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [workplaceFilter, setWorkplaceFilter] = useState('All Workplaces');

  const units = ['All Units', 'UNIT 1', 'UNIT 2', 'UNIT 3'];
  const workplaces = ['All Workplaces', 'LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

  // Function to handle adding a new entry
  const handleAddEntry = () => {
    setEditingEntry(null);    
    setIsModalOpen(true);     
  };

  // Function to handle editing an existing entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);   // Set the entry to be edited
    setIsModalOpen(true);
  };

  // Function to handle deleting an entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this RFID entry?')) {
      setRfidEntries(prev => prev.filter(entry => entry.id !== id));    // Remove the entry by ID
    }
  };

  const handleSaveEntry = (entryData) => {
    if (editingEntry) {
      // Edit existing entry
      setRfidEntries(prev =>
        prev.map(entry =>
          entry.id === editingEntry.id
            ? { ...entryData, id: editingEntry.id }
            : entry
        )
      );
    } else {
      // Add new entry
      const newEntry = {
        ...entryData,
        id: Date.now().toString()     // Generate a unique ID
      };
      setRfidEntries(prev => [...prev, newEntry]);    // Add the new entry to the list
    }
    setIsModalOpen(false);   
    setEditingEntry(null);    
  };

  // Function to handle status changes for an entry
  const handleStatusChange = (id, newStatus) => {
    setRfidEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, status: newStatus } : entry
      )
    );
  };

  // Filter the RFID entries based on search and filter criteria
  const filteredEntries = rfidEntries.filter(entry => {
    const matchesSearch = entry.rfidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'All Units' || entry.unit === unitFilter;
    const matchesWorkplace = workplaceFilter === 'All Workplaces' || entry.workplace === workplaceFilter;
    
    return matchesSearch && matchesUnit && matchesWorkplace;
  });

  // Define the table columns for the DataTable component
  const tableColumns = [
    {
      header: 'RFID NUMBER',
      key: 'rfidNumber',
      className: 'font-mono text-sm text-gray-800'
    },
    {
      header: 'UNIT',
      key: 'unit',
      className: 'text-gray-800'
    },
    {
      header: 'WORKPLACE',
      key: 'workplace',
      className: 'text-gray-800'
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (entry) => (
        <StatusBadge
          status={entry.status}
          onChange={(newStatus) => handleStatusChange(entry.id, newStatus)}   // Allow status changes
        />
      )
    },
    {
      header: 'ACTION',
      key: 'actions',
      render: (entry) => (
        <ActionButton
          onEdit={() => handleEditEntry(entry)}
          onDelete={() => handleDeleteEntry(entry.id)}
          editTooltip="Edit RFID Entry"
          deleteTooltip="Delete RFID Entry"
        />
      )
    }
  ];

  const filters = [
    {
      value: unitFilter,
      onChange: setUnitFilter,
      options: units
    },
    {
      value: workplaceFilter,
      onChange: setWorkplaceFilter,
      options: workplaces
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Page Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm">

            <div className="flex items-center justify-between p-6 border-b">
              <Header title="Product RFID Managment" icon={<User />} />
              <AddButton onClick={handleAddEntry} text="Add User" />
            </div>

            <div className='flex items-center gap-6 p-6 bg-gray-50'>

              {/*Search Bar*/}
              <div className='flex-1'>
                <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search RFID"
                />
              </div>

              {/*Unit filter*/}
              <FilterBar
              selectedOption={unitFilter}
              setSelectedOption={setUnitFilter}
              options={units}
              selectLabel='Unit'
              searchPlaceholder=''/>

              {/*Workplace filter*/}
              <FilterBar
              selectedOption={workplaceFilter}
              setSelectedOption={setWorkplaceFilter}
              options={workplaces}
              selectLabel='Workplace'
              searchPlaceholder=''/>
              
            </div>


            {/* RFID Entries */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  RFID Entries ({filteredEntries.length})
                </h2>
              </div>

              <DataTable
                columns={tableColumns}
                data={filteredEntries}
                emptyMessage="Try adjusting your search or filter criteria"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RFID Modal */}
      <RfidModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialData={editingEntry}
      />
    </div>
  );
};

export default ProductRfidMan;