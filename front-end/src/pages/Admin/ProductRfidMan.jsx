// src/pages/AdminPanal/ProductRfidMan.jsx
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/AdminPanal/Header';
import SearchBar from '../../components/AdminPanal/SearchBar';
import FilterBar from '../../components/AdminPanal/FilterBar';
import DataTable from '../../components/AdminPanal/DataTable';
import StatusBadge from '../../components/AdminPanal/StatusBadge';
import ActionButton from '../../components/AdminPanal/ActionButton';
import ProRfidModal from '../../components/AdminPanal/ProRfidModal';
import AddButton from '../../components/AdminPanal/AddButton';
import ConfirmDeleteModal from '../../components/AdminPanal/ConfirmDeleteModal';

const API_BASE_URL = "http://localhost:8001/api/product-rfids";


const ProductRfidMan = () => {
  const [rfidEntries, setRfidEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [workplaceFilter, setWorkplaceFilter] = useState('All Workplaces');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //delete modal stste
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const units = ['All Units', 'UNIT 1', 'UNIT 2', 'UNIT 3'];
  const workplaces = ['All Workplaces', 'LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (unitFilter && unitFilter !== 'All Units') params.unit = unitFilter;
      if (workplaceFilter && workplaceFilter !== 'All Workplaces') params.workplace = workplaceFilter;
      const res = await axios.get(API_BASE_URL, { params });
      setRfidEntries(res.data.data || []);
    } catch (err) {
      console.error('Fetch product rfids error', err);
      setError(err.response?.data?.message || err.message || 'Error fetching product rfids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [searchTerm, unitFilter, workplaceFilter]);

  const handleAdd = () => { setEditingEntry(null); setIsModalOpen(true); };
  const handleEdit = (entry) => { setEditingEntry(entry); setIsModalOpen(true); };
 
  //open delete modal
  const handleDeleteClick = (entry) => {
    setDeleteTarget(entry);
    setDeleteModalOpen(true);
  };

  //confirm delete after RFID check
  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${deleteTarget._id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSave = async (entryData) => {
    try {
      // entryData already cleaned by modal
      if (editingEntry) {
        await axios.put(`${API_BASE_URL}/${editingEntry._id}`, entryData);
        alert('Updated successfully');
      } else {
        await axios.post(API_BASE_URL, entryData);
        alert('Created successfully');
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      fetchData();
    } catch (err) {
      console.error('Save error', err);
      const msg = err.response?.data?.message || err.message || 'Error saving';
      alert(msg);
      // If validation errors array present, show joined message
      if (err.response?.data?.errors) alert(err.response.data.errors.join('\n'));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/status`, { status: newStatus });
      fetchData();
      alert('Status updated');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const tableColumns = [
    { header: 'RFID NUMBER', key: 'rfidNumber', className: 'font-mono text-sm' },
    { header: 'UNIT', key: 'unit' },
    { header: 'WORKPLACE', key: 'workplace' },
    { header: 'STATUS', key: 'status', render: (entry) => <StatusBadge status={entry.status} onChange={(s) => handleStatusChange(entry._id, s)} /> },
    { header: 'ACTION', key: 'actions', render: (entry) => <ActionButton onEdit={() => handleEdit(entry)} onDelete={() => handleDeleteClick(entry)} /> }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-base text-gray-800">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <Header title="Product RFID Management" icon={<User/>} />
            <AddButton handleAddEntry={handleAdd} text="Add RFID" />
          </div>

          <div className="flex items-center gap-6 bg-gray-50">
            <FilterBar selectedOption={unitFilter} setSelectedOption={setUnitFilter} options={units} selectLabel="Unit" />
            <FilterBar selectedOption={workplaceFilter} setSelectedOption={setWorkplaceFilter} options={workplaces} selectLabel="Workplace" />
            <div className="flex-1">
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search RFID"/>
            </div>
          </div>

          {error && <div className="p-4 text-red-600">{error}</div>}
          {loading && <div className="p-6 text-center">Loading...</div>}

          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900">RFID Entries ({rfidEntries.length})</h2>
            <DataTable columns={tableColumns} data={rfidEntries} emptyMessage="Try adjusting search or filters" />
          </div>
        </div>
      </div>

      <ProRfidModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEntry(null); }}
        onSave={handleSave}
        initialData={editingEntry}
      />

      {deleteTarget &&(
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={()=> setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          rfidNumber={deleteTarget.rfidNumber}
          entityType='product'/>
      )}

    </div>
  );
};

export default ProductRfidMan;
