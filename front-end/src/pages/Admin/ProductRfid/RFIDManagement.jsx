import React from 'react'
import { useState } from 'react';

function RFIDManagement() {
const [rfidEntries, setRfidEntries] = useState([

    {
        id: 1,
        rfidNumber: 'RFID001234',
        unit: 'Unit 1',
        workplace: 'Line 1',
        status: 'ACTIVE'
    },

    {
        id: 2,
        rfidNumber: 'RFID001284',
        unit: 'UNIT 1',
        workplace: 'LINE 2',
        status: 'ACTIVE'
    },
    
]);

const [isModalOpen, setIsModalOpen] = useState(false);
const [editingEntry, setEditingEntry ] = useState(null);
const [searchTerm, setSearchTerm ] = useState('');
const [unitFilter, setUnitFilter]= useState('All Units');
const [workplaceFilter, setWorkplaceFilter ] = useState('All Workplaces');



const units = ['All Units', 'Unit 1', 'Unit 2','Unit 3'];
const workplaces = ['All Workplaces', 'LINE 1', 'LINE 2', 'LINE 3', 'LINE 4'];

  //Apply filters and fetch data
  const handleAddEntry = ()=>{
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry=(entry)=>{
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry=(id)=>{
    if(window.confirm('Are you sure you want to delete this RFID entry?')){
      setRfidEntries(prev=>prev.filter(entry=>entry.id !== id));
    }
  };

const handleSaveEntry = (entryData)=>{
  if(editingEntry){
    //Edit exiting entry
    setRfidEntries(prev=>
      prev.map(entry=>
        entry.id === editingEntry.id
        ? {...entryData, id: editingEntry.id}
        : entry
      )
    );
  }
}

  const confirmDelete = async () => {
    const result = await deleteRFIDEntry(deletingEntry._id);
    if (result.success){
      setShowDeleteConfirmation(false);
      setDeletingEntry(null);
    }  
  };


}

export default RFIDManagement