import React from 'react'
import SideBar from '../../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import {adminLinks} from '../Data/SidebarNavlinks'
import AdminNav from '../../components/AdminPanal/AdminNav'
import AdminNavControl from '../../components/AdminPanal/AdminNavControl'
import EmployeeDetails from '../Admin/Forms/EmployeeDetails'
import Security from '../Admin/Forms/Security'
import Final from '../Admin/Forms/Final'
import RFIDManagement from './ProductRfid/RFIDManagement';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

function AdminDashboard() {

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email:"",
    phoneNumber:"",
    employeeId:"",
    department:"",
    password:"",
    confirmPassword:"",
    
  });

  const steps = ["Employee Details", "Security", "Complete"]

  const displayStep = (step) => {
    switch (step){
      case 1:
        return <EmployeeDetails formData={formData} setFormData={setFormData}/>
      case 2:
        return <Security formData={formData} setFormData={setFormData}/>
      case 3:
        return <Final formData={formData} setFormData={setFormData}/>
      default:
        return null;
    }
  };

  //EmployeeDetail form

  const validateStep = () => {
    if(currentStep===1){
      if(!formData.firstname || !formData.lastname || !formData.email || !formData.phoneNumber || !formData.phoneNumber || !formData.employeeId || !formData.department){
        alert("Please fill all fields.");
        return false;
      }
      return true;
    }

  //Security form
    if(currentStep===2){
      if(!formData.password || !formData.confirmPassword){
        alert("Please fill all fields.");
        return false;
      }

      if(formData.password!==formData.confirmPassword){
        alert("Password do not match !")
        return false;
      }
      return true;
    }
    return true;
  
}

const handleClick = (direction) => {
  let newStep = currentStep;

  if (direction=== "next"){
    if(!validateStep()) return;   //stop if validation fail
    newStep++;
  } else{
    newStep--;
  }

  if (newStep > 0 && newStep <= steps.length){
    setCurrentStep(newStep);
  }
};

return(

  <div className='ml-70 mt-20'>
        <SideBar title="Admin Panal" links={adminLinks} />
        EmployeeEfficiency Dashboard

  <div className='flex-1 p-5'>
    <Routes>
      <Route path='AdminDashboard' element={
        <div className='mx-auto rounded-2xl bg-white pb-2 shadow-xl md:w-1/2'>
          <div className='container horizontal mt-5'>
            <AdminNav steps={steps} currentStep={currentStep}/>
          </div>

            <div className='my-10 p-10'>{displayStep(currentStep)}</div>
            {currentStep !== steps.length && (
              <AdminNavControl
                handleClick={handleClick}
                currentStep={currentStep}
                steps={steps}/>
            )}

        </div>
      }/>

      <Route path='ProductRfid/RFIDManagement' element={<RFIDManagement/>}/>

    </Routes>
  </div>
   

</div>
)};

export default AdminDashboard