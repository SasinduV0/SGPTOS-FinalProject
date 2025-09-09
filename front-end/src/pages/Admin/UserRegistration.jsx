import React, { useState } from 'react';
import AdminNav from '../../components/AdminPanal/AdminNav'
import AdminNavControl from '../../components/AdminPanal/AdminNavControl'
import EmployeeDetails from './RegistrationForms/EmployeeDetails'
import Security from './RegistrationForms/Security'
import Final from './RegistrationForms/Final'


function UserRegistration() {

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
        return <Final formData={formData} setFormData={setFormData} handleBack={()=> handleClick(".prev")}/>
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
    //if on step 3 and going back, reset form and go to step 1
    if (currentStep===3) {
      setFormData({
        firstname:'',
        lastname:'',
        email:'',
        phoneNumber:'',
        employeeId:'',
        department:'',
        password:'',
        confirmPassword:'',

      });

      newStep = 1;
    }else{
      newStep--;
    }
  }

  if (newStep > 0 && newStep <= steps.length){
    setCurrentStep(newStep);
  }
};


  return (
    <div className='mx-auto rounded-2xl bg-white pb-2 shadow-xl md:w-1/2'>
        <div className='container horizontal mt-5'>
            <AdminNav steps={steps} currentStep={currentStep}/>
        </div>

        <div className='my-10 p-10'>{displayStep(currentStep)}</div>

        {currentStep !== steps.length && (
            <AdminNavControl
                handleClick={handleClick}
                currentStep={currentStep}
                steps={steps}
            />
        )}
    </div>
  );
}

export default UserRegistration