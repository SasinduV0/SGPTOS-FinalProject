import React, { useEffect, useState } from 'react'

const RfidForm =({entry, onSave, onCancel, units, workplaces, loading}) => {
    const [formData, setFormData] = useState({
       rfidNumber: '',
       unit: '',
       workplaces: '',
       status: 'ACTIVE' 
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    useEffect(()=>{
        if(entry){
            setFormData({
                rfidNumber: entry.rfidNumber,
                unit: entry.unit,
                workplaces: entry.workplaces,
                status: entry.status
            });
        }
    }, [entry]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.rfidNumber.trim()){
            newErrors.rfidNumber = 'RFID Number is required';
        }

        if (!formData.unit){
            newErrors.unit = 'Unit is required';
        }

        if (!formData.workplaces){
            newErrors.workplaces = 'Workplace id required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length=== 0;

    };

    const handleSubmit = (e) => {
        e.preventDefault();         //stop page refresh
        setServerError('');
        if(validateForm()){
            onSave(formData);       //call parent’s save function
        }
    };

    const handleChange = (e) => {
        const {name, value} = e. target;
        setFormData(prev => ({
            ... prev,
            [name]: value
        }));

        //clear error when user starts typing
        if(errors[name]){
            setErrors(prev => ({
                ...prev,
                [name]:''
            }));
        }
    };

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
                                onChange={handleChange}
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
                            <select
                                id='unit'
                                name='unit'
                                value={formData.unit}
                                onChange={handleChange}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.unit ? 'border-red-300' : 'border-gray-300'
                                }`}>

                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            {errors.unit && (
                                <p className='mt-1 text-sm text-red-600'> {errors.unit} </p>
                            )}
                        </div>

                        {/*workplace*/}

                        <div>
                            <label htmlFor='workplace' className='block text-sm font-medium text-gray-700 mb-1'> Workplace </label>
                            <select
                                id='workplace'
                                name='workplace'
                                value={formData.workplaces}
                                onChange={handleChange}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.workplace ? 'border-red-300' : 'border-gray-300'
                                }`}>
                                    <option value="">Select Workplace</option>
                                    {workplaces.map(workplace=>{
                                        <option key={workplace} value={workplace}>{workplace}</option>
                                    })}
                                </select>

                                {errors.workplace &&(
                                    <p className="mt-1 text-sm text-red-600">{errors.workplace}</p>
                                )}
                        </div>

                        {/*Status (only show for edit)*/}

                        {entry && (
                            <div>
                                <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-1'> Status </label>
                                <select
                                    id='status'
                                    name='status'
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed'>
                                        <option value='ACTIVE'>ACTIVE</option>
                                        <option value ='INACTIVE'>INACTIVE</option>
                                    </select>
                            </div>
                        )};

                        {/*BUttons*/}
                        <div className='flex justify-end space-x-3 pt-4'>
                            <button
                                id='button'
                                onClick={onCancel}
                                disabled={loading}
                                className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200'>
                                    Cancel
                                </button>

                            <button type='submit'
                            disabled={loading}
                            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center'>

                                {loading && (
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                )}
                                {entry ? 'update' : 'Save'}
                            </button>
                        </div>
                    </form>


            </div>

        </div>
    )
};

export default RfidForm;



