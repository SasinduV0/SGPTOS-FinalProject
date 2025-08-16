import React from 'react'
import SideBar from '../../components/SideBar'
import { FaTachometerAlt, FaUser, FaCog } from 'react-icons/fa';
import {adminLinks} from '../Data/SidebarNavlinks'
import AdminNav from '../../components/AdminNav'
import EmployeeDetails from '../Admin/Forms/EmployeeDetails'
import { useState } from 'react';

function AdminDashboard() {

  const [step, setStep] = useState(1);

  const handleCancel = ()=>{
    setStep(1);
  }

  return (
    <>
   

    <SideBar title="Admin Panel" links={adminLinks} />

     <div className="pl-165 pt-20 pb-0 item-center"> 
        <AdminNav />
      </div>

      

      <div className='min-h-screen w-full flex items-center justify-center gap-4 bg-gray-300 pl-64 mt-16'>
        
        <div className ="mt-4">
          {step === 1 && <EmployeeDetails nextStep={()=>  //when you click "next" button from employee details form
            setStep(2)}
            prevStep={()=> setStep(1)}
            cancel={handleCancel}/>
          
          }

          {/*{step === 2 && (
            <Security nextStep={()=> setStep (3)} prevStep={()=> setStep(1)} cancel={handleCancel}/>   //when you click "next" or "Previous"button from security form
          )}

          {step ===3 && <Review prevStep={()=> setStep(2)} cancel={handleCancel}/>}*/}


        </div>

      </div>
    </>
  )
}

export default AdminDashboard