import React, { useState } from 'react';
import Header from '../../components/AdminPanal/EmployeeRfid/header';
import FilterBar from '../../components/AdminPanal/EmployeeRfid/FilterBar';
import DataTable from '../../components/AdminPanal/EmployeeRfid/DataTable';
import StatusBadge from '../../components/AdminPanal/EmployeeRfid/StatusBadge';
import ActionButton from '../../components/AdminPanal/EmployeeRfid/ActionButton';
import RfidModal from '../../components/AdminPanal/EmployeeRfid/RfidModal';
import Modal from '../../components/AdminPanal/EmployeeRfid/Modal';

const EmployeeRfidMan = () => {
  const [rfidEntries, setRfidEntries] = useState([
    {
      id: '1',
      rfidNumber: 'RFID01-234',
      empName: 'H.D.L Fernando',
      empId: 'EMP-002',
      status: 'ACTIVE'
    },
    {
      id: '2',
      rfidNumber: 'RFID01-235',
      empName: 'P.K Perera',
      empId: 'emp-903',
      status: 'ACTIVE'
    },
    {
      id: '3',
      rfidNumber: 'RFID01-236',
      empName: 'S. silva',
      empId: 'EMP-086',
      status: 'INACTIVE'
    },
    {
      id: '4',
      rfidNumber: 'RFID01-789',
      empName: 'R. Kumara',
      empId: 'EMP-080',
      status: 'ACTIVE'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
 


  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this RFID entry?')) {
      setRfidEntries(prev => prev.filter(entry => entry.id !== id));
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
        id: Date.now().toString()
      };
      setRfidEntries(prev => [...prev, newEntry]);
    }
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setRfidEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, status: newStatus } : entry
      )
    );
  };

  const filteredEntries = rfidEntries.filter(entry => {
    const matchesSearch = entry.rfidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.empId.toLowerCase().includes(searchTerm.toLowerCase());

    
    return matchesSearch ;
  });

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
      header: 'STATUS',
      key: 'status',
      render: (entry) => (
        <StatusBadge
          status={entry.status}
          onChange={(newStatus) => handleStatusChange(entry.id, newStatus)}
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

  {/*const filters = [
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
  ];*/}

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Page Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm">
            <Header
              title="Employee RFID Management"
              onAddClick={handleAddEntry}
              addButtonText="Add RFID Entry"
              icon={<div className="w-4 h-4 bg-white rounded-sm"></div>}
            />

            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search RFID, Name or Employee ID"
            />

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

export default EmployeeRfidMan;