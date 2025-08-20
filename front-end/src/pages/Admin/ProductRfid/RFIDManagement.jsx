import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, Bell, User, ChevronDown } from 'lucide-react';
import RfidModal from '../../../components/AdminPanal/ProductRfid/RfidModal'

const RFIDManagement = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [workplaceFilter, setWorkplaceFilter] = useState('All Workplaces');

  const units = ['All Units', 'UNIT 1', 'UNIT 2', 'UNIT 3'];
  const workplaces = ['All Workplaces', 'LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

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
                         entry.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.workplace.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'All Units' || entry.unit === unitFilter;
    const matchesWorkplace = workplaceFilter === 'All Workplaces' || entry.workplace === workplaceFilter;
    
    return matchesSearch && matchesUnit && matchesWorkplace;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Page Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Page Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <h1 className="text-xl font-semibold text-gray-800">Product RFID Management</h1>
              </div>
              <button
                onClick={handleAddEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                Add RFID Entry
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search RFID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                  <select
                    value={workplaceFilter}
                    onChange={(e) => setWorkplaceFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {workplaces.map(workplace => (
                      <option key={workplace} value={workplace}>{workplace}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* RFID Entries */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800">RFID Entries ({filteredEntries.length})</h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">RFID NUMBER</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">UNIT</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">WORKPLACE</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">STATUS</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 uppercase text-sm">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-gray-800">{entry.rfidNumber}</td>
                        <td className="py-4 px-4 text-gray-800">{entry.unit}</td>
                        <td className="py-4 px-4 text-gray-800">{entry.workplace}</td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <select
                              value={entry.status}
                              onChange={(e) => handleStatusChange(entry.id, e.target.value)}
                              className={`appearance-none border-0 rounded-full px-3 py-1 text-sm font-medium cursor-pointer ${
                                entry.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit RFID Entry"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete RFID Entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEntries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg mb-2">No RFID entries found</div>
                  <div className="text-sm">Try adjusting your search or filter criteria</div>
                </div>
              )}
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

export default RFIDManagement;