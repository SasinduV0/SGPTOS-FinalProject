/*import React from 'react'
import { useState } from 'react';

function RFIDManagement() {
const [rfidEntries, setRfidEntries] = useState([

    {
        id: 1,
        rfidNumber: 'RFID001234',
        unit: 'Line 1',
        state: 'Activity'
    },

    {
        id: 2,
        rfidNumber: 'RFID001284',
        unit: 'UNIT 1',
        workplace: 'LINE 2',
        status: 'ACTIVE'
    },
    
]);

const [showForm, setShowForm] = useState(false);
const [showDeleteConfirmation, setShowDeleteConfirmation]= useState(false);
const [editingEntry, setEditingEntry ] = useState(null);
const [deletingEntry, setDeletingEntry ] = useState(null);
const [searchTerm, setSearchTerm ] = useState('');
const [selectedUnit, setSelectedUnit ] = useState('All Units');
const [selectedWorkplace, setSelectedWorkplace ] = useState('All Workplaces');

const units = ['All Units', 'Unit 1', 'Unit 2','Unit 3'];
const workplaces = ['All Workplaces', 'LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

const fileredEntries = rfidEntries.filter(entry =>{
    const matchsSearch = entry.rfidNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchsUnit = selectedUnit==='All Units' || entry.unit === selectedUnit;
    const mathesWorkplace = selectedWorkplace === 'All Workplace' || entry.workplace === selectedWorkplace;

    return matchsSearch && matchsUnit && mathesWorkplace;

});

  //Apply filters and fetch data

  const applyFilters = () => {
    fetchRFIDEntries({
      search: searchTerm,
      unit: selectedUnit,
      workplace: selectedWorkplace,
    });
  };

  const handleAddEntry=()=>{
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEditEntry = (Entry) =>{
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteEntry = (entry) => {
    setDeletingEntry(entry);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const result = await deleteRFIDEntry(deletingEntry._id);
    if (result.success){
      setShowDeleteConfirmation(false);
      setDeletingEntry(null);
    }  
  };

  const handleSaveEntry = async (entryData) => {
    let result;

    if (editingEntry){
      result = await updateRFIDEntry()
    }
  }
}

export default RFIDManagement*/