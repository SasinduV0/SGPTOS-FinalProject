import React, { useEffect, useState } from 'react'

const RfidModal =({isOpen, onClose, onSave, initialData}) => {
    const [formData, setFormData] = useState({
       rfidNumber: '',
       unit: '',
       workplaces: '',
       status: 'ACTIVE' 
    });

    const [errors, setErrors] = useState({});

    const units =['Unit 1', 'Unit 2'];
    const workplace =['Line 1', 'Line 2', 'Line 3'];
    

    useEffect(()=>{
        if(initialData){
            setFormData({
                rfidNumber: initialData.rfidNumber,
                unit: initialData.unit,
                workplaces: initialData.workplaces,
                status: initialData.status
            });
        } else {
            setFormData({
                rfidNumber: '',
                unit:'',
                workplace:'',
                status:'ACTIVE'
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.rfidNumber.trim()){
            newErrors.rfidNumber = 'RFID Number is required';
        } else if (formData.rfidNumber.length<5){
            newErrors.rfidNumber ='RFID Number must be at least 5 characters'
        }

        if (!formData.unit){
            newErrors.unit = 'Unit is required';
        }

        if (!formData.workplaces){
            newErrors.workplaces = 'Workplace is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length=== 0;

    };

    const handleSubmit = (e) => {
        e.preventDefault();         //stop page refresh
        
        if(validateForm()){
            onSave(formData);       //call parent’s save function
        }
    };

    const handleInputChange = (field, value) => {
        
        setFormData(prev => ({
            ... prev,
            [field]: value
        }));

        //clear error when user starts typing
        if(errors[field]){
            setErrors(prev => ({
                ...prev,
                [field]:''
            }));
        }
    };

    if (!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex item-center justify-center z-50">
            <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>

                {/*header*/}
                <div className='flex item-center justify-between mb-6'>
                    <h2 className='text-x1 font-semibold text-gray-900'>
                        {entry ? 'Edit RFID Entry' : 'Add New RFID Entry'}
                    </h2>

                    <button 
                        onChange={onCancel}
                        disabled={loading}
                        className='text-gray-400 hover:text-gray-600 transition-colors duration-200'>
                            <X className='w-5 h-5'/>
                        </button>
                </div>

                {/*Form*/}
                <form onSubmit = {handleSubmit}
                    className='space-y-4'>

                        {/*server Error*/}

                        {serverError && (
                            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                                {serverError}
                            </div>
                        )}

                        {/*RFID Number*/}

                        <div>
                            <label htmlFor='rfidNumber' className='block text-sm font-medium text-gray-700 mb-1'> RFID Number </label>
                            <input
                                type='text'
                                id='refidNumber'
                                name='rfidNumber'
                                value={formData.rfidNumber}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder='e.g: RFID001234'
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.rfidNumber ? 'border-red-300' : 'border-gray-300'}`}/>
                            
                            {errors.rfidNumber && (
                                <p className='mt-1 text-sm text-red-600'>{errors.rfidNumber}</p>
                            )}

                        </div>

                        {/*unit*/}

                        <div>
                            <label htmlFor='unit' className='block text-sm font-medium text-gray-700 mb-1'>Unit</label>
                            <div className='relative'>
                            <select
                                id='unit'
                                name='unit'
                                value={formData.unit}
                                onChange={(e)=>handleInputChange('unit', e.target.value)}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.unit ? 'border-red-300' : 'border-gray-300'
                                }`}>

                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            
                            <ChevronDown className='absolute right-3 top-1/2 transform-translate-y-1/2 text-gray-400 pointer-event-none' size={16}/>

                            </div>

                            {errors.unit && (
                                <p className='mt-1 text-sm text-red-600'> {errors.unit} </p>
                            )}
                        </div>

                        {/*workplace*/}

                        <div>
                            <label htmlFor='workplace' className='block text-sm font-medium text-gray-700 mb-1'> Workplace </label>
                            <div className='relative'>
                            <select
                                id='workplace'
                                name='workplace'
                                value={formData.workplaces}
                                onChange={(e)=> handleInputChange('workplace', e.target.value)}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.workplace ? 'border-red-300' : 'border-gray-300'
                                }`}>
                                    <option value="">Select Workplace</option>
                                    {workplaces.map(workplace=>{
                                        <option key={workplace} value={workplace}>{workplace}</option>
                                    })}
                                </select>

                                <ChevronDown className='absolute right-3 top-1/2 transform-translate-y-1/2 text-gray-400 pointer-event-none' size={16}/>

                                </div>

                                {errors.workplace &&(
                                    <p className="mt-1 text-sm text-red-600">{errors.workplace}</p>
                                )}
                        </div>

                        {/*Status (only show for edit)*/}

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'> Status </label>

                            <div className='relative'>
                                <select
                                    value={formData.status}
                                    onChange={(e)=>handleInputChange('status', e.target.value)}
                                    className='w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer transition-colors'>

                                        <option value='ACTIVE'>ACTIVE</option>
                                        <option value='INACTIVE'>INACTIVE</option>

                                    </select>

                                    <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' size={16}/>

                            </div>
                        </div>

                        {/*Buttons*/}

                        <div className='flex justify-end gap-3 pt-6 border-t border-gray-200'>

                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium'
                                >
                                    Cancel
                            </button>

                            <button
                                type='submit'
                                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 translation-colors font-medium'>
                                    {initialData? 'Update Entry' : 'Save Entry'}
                                </button>

                        </div>
                    </form>
                </div>
            </div>
    );
};

export default RfidModal;
