import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/AdminPanal/Header';
import SearchBar from '../../components/AdminPanal/SearchBar';
import DataTable from '../../components/AdminPanal/DataTable';
import StatusBadge from '../../components/AdminPanal/StatusBadge';
import ActionButton from '../../components/AdminPanal/ActionButton';
import EmpRfidModal from '../../components/AdminPanal/EmpRfidModal';
import AddButton from '../../components/AdminPanal/AddButton';
import ConfirmDeleteModal from '../../components/AdminPanal/ConfirmDeleteModal';

const API_BASE_URL = 'http://localhost:8001/api/rfid-employees';

const EmployeeRfidMan = () => {
  const [rfidEntries, setRfidEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //For delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchRfidEmployees = async () => {
    try {
      setLoading(true); setError('');
      const params = searchTerm ? { search: searchTerm } : {};
      const res = await axios.get(API_BASE_URL, { params });
      setRfidEntries(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching employees');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRfidEmployees(); }, []);
  useEffect(() => {
    const timer = setTimeout(fetchRfidEmployees, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddEntry = () => { setEditingEntry(null); setIsModalOpen(true); };
  const handleEditEntry = (entry) => { setEditingEntry(entry); setIsModalOpen(true); };

  //Insted of deleting directly, open modal
  const handleDeleteClick = (entry) => {
    setDeleteTarget(entry);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${deleteTarget._id}`);
      fetchRfidEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };


  const handleSaveEntry = async (entryData) => {
    try {
      if (editingEntry) {
        await axios.put(`${API_BASE_URL}/${editingEntry._id}`, entryData);
        alert('Updated successfully!');
      } else {
        await axios.post(API_BASE_URL, entryData);
        alert('Created successfully!');
      }
      setIsModalOpen(false); setEditingEntry(null); await fetchRfidEmployees();
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  // Your current handleStatusChange function 
  const handleStatusChange = async (id, newStatus) => {
    try 
    { 
      await axios.patch(`${API_BASE_URL}/${id}/status`, { status:newStatus }); 
      fetchRfidEmployees(); 
      alert('Ststus updated');
    }catch (err){ 
      alert(err.response?.data?.message || err.message); } //Error popup
  };

  const tableColumns = [
    { header:'RFID NUMBER', key:'rfidNumber' },
    { header:'NAME', key:'empName' },
    { header:'EMPLOYEE ID', key:'empId' },
    { header:'DEPARTMENT', key:'department' },
    { header:'STATUS', key:'status', render:(entry)=><StatusBadge status={entry.status} onChange={(s)=>handleStatusChange(entry._id,s)} /> },
    { header:'ACTION', key:'actions', render:(entry)=><ActionButton onEdit={()=>handleEditEntry(entry)} onDelete={()=>handleDeleteClick(entry)} /> }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-base text-gray-800">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">

            <Header title="Employee RFID Management" icon={<User />} />
            <AddButton handleAddEntry={handleAddEntry} text="Add Employee" />

          </div>

          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search RFID Number" />
          
          {error && <div className="p-4 text-red-600">{error}</div>}
          {loading && <div className="p-6 text-center">Loading...</div>}

          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900">RFID Entries ({rfidEntries.length})</h2>
            <DataTable columns={tableColumns} data={rfidEntries} emptyMessage="Try adjusting search or filters" />
          </div>
        </div>
      </div>

      {/*Delete confirmation modal*/}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={()=> setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          rfidNumber={deleteTarget.rfidNumber}
          entityType='employee'/>
      )}

      <EmpRfidModal
        isOpen={isModalOpen}
        onClose={()=>{ setIsModalOpen(false); setEditingEntry(null); }}
        onSave={handleSaveEntry}
        initialData={editingEntry}
      />
    </div>
  );
};

export default EmployeeRfidMan;
