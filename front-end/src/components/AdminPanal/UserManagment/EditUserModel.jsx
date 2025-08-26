import React, { useState } from 'react'
import { X } from 'lucide-react';

function EditUserModel({isOpen, employee, onClose, onUpdate}) {

    const [editingEmployee, setEditingEmployee] = useState(employee || {});
    const [activeTab, setActiveTab] = useState('Profile');

    React.useEffect(()=>{
        if (employee){
            setEditingEmployee({...employee});
        }
    }, [employee]);

    const handleInputChange = (field, value) => {
        setEditingEmployee(prev => ({...prev, [field]: value}))
    };


    const handleUpdate=()=>{
        onUpdate(editingEmployee);
        onClose();
    };

    if (!isOpen || !employee) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex item-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>

            {/*Modal Header*/}

            <div className='flex justify-between item-center mb-6'>
                <div>
                    <h2 className='text-xl font-semibold text-gray-900'>Edit User</h2>
                    <p className='text-sm text-gray-500'>Employee ID:{editingEmployee.employeeId}</p>
                </div>

                <button
                    onClick={onClose}
                    className='text-gray-400 hover:text-gray-600 transition-colors duration-200'>
 
                        <X size={24}/>

                    </button>
            </div>

            {/*Tabs*/}
            <div className='flex space-x-8 mb-6 border-b'>
                <button
                    onClick={()=>setActiveTab('Profile')}
                    className={`pb-2 text-sm font-medium transition-colors duration-200 ${
                        activeTab=== 'Profile'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                        Profile
                    </button>

                    <button
                        onClick={()=>setActiveTab('Security')}
                        className={`pb-2 text-sm font-medium transition-colors duration-200 ${
                            activeTab==='Security'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                            Security
                    </button>
            </div>

            {/*Form Content*/}
            {activeTab==='Profile' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

                {/*Personal Information*/}
                    <div>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>Personal Information</h3>

                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>First Name*</label>

                                <input
                                    type='text'
                                    value={editingEmployee.firstName || ''}
                                    onChange={(e)=>handleInputChange('firstName', e.target.value)}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>

                            </div>

                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name*</label>

                            <input
                                type='text'
                                value={editingEmployee.lastName || ''}
                                onChange={(e)=>handleInputChange('lastName', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                            
                            </div>

                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>

                            <input
                                type='text'
                                value={editingEmployee.phoneNumber || ''}
                                onChange={(e)=>handleInputChange('phoneNumber', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                            
                            </div>

                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address*</label>

                            <input
                                type='email'
                                value={editingEmployee.email || ''}
                                onChange={(e)=>handleInputChange('email', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                            
                            </div>

                        </div>

                    </div>

                    {/*Work Information*/}

                    <div>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>Work Information</h3>

                        <div className='space-y-4'>
                            
                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Employee ID*</label>

                            <input
                                type='text'
                                value={editingEmployee.employeeId || ''}
                                onChange={(e)=>handleInputChange('employeeId', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                            
                            </div>

                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Department*</label>

                            <select
                                type='text'
                                value={editingEmployee.department || ''}
                                onChange={(e)=>handleInputChange('department', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'>

                                    <option value=''>Select Department</option>
                                    <option value='Production'>Production </option>
                                    <option value='Sawing'>Sawing</option>
                                    <option value='Quality Control'>Quality Control</option>
                                </select>
                            
                            </div>

                            <div>

                            <label className='block text-sm font-medium text-gray-700 mb-1'>Section</label>

                            <input
                                type='text'
                                value={editingEmployee.section || ''}
                                onChange={(e)=>handleInputChange('section', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                            
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {activeTab==='Security' &&(
                <div className='py-8 text-center text-gray-500'>

                    <div className='space-y-4'>

                        <h3 className='text-lg font-medium text-gray-900'>Security Setting</h3>
                    </div>
                </div>
            )}

            {/* Modal Action */}

            <div className='flex justify-end space-x-4 mt-8 pt-4 border-t'>

                <button
                    onClick={onClose}
                    className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200'>

                        cancel

                </button>

                <button
                    onClick={handleUpdate}
                    className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200'>

                        Update User
                    </button>
            </div>
        </div>
    </div>
  )
}

export default EditUserModel