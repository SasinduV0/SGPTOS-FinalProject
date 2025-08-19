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
        e.preventDefault();
        setServerError('');
        if(validateForm()){
            onSave(formData);
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

    return()
}



