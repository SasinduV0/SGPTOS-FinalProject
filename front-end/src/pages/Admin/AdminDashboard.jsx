import React from 'react'
import SideBar from '../../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import {adminLinks} from '../Data/SidebarNavlinks'
import AdminNav from '../../components/AdminNav'
import AdminNavControl from '../../components/AdminNavControl'
import EmployeeDetails from '../Admin/Forms/EmployeeDetails'
import { useState } from 'react';

function AdminDashboard() {

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword:"",
    fullName:"",
    email:"",
    
  });

  const steps = ["Employee Details", "Security", "Review", "Complete"]

  const displayStep = (step) => {
    switch (step){
      case 1:
        return <EmployeeDetails formData={formDate} setFormData={setFormData}/>
      case 2:
        return <Security formData={formDate} setFormData={setFormData}/>
      case 3:
        return <Review formData={formDate} setFormData={setFormData}/>
      case 4:
        return <Final formData={formDate} setFormData={setFormData}/>
      default:
        return null;
    }
  };

  const validateStep = () => {
    if(currentStep===1){
      if(!formData.usernam || !formData.password || !formData.confirmPassword){
        alert("Please fill all fields.");
        return false;
      }

      if(formData.password !== formData.confirmPassword){
        alert("Passwords do not  match !");
        return false;
      }
    }

    /*if (currentStep === 2){

    }*/
  }
  
}

export default AdminDashboard