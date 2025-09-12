
import { FaStripeS } from "react-icons/fa";
import React, { useState, useEffect, useRef } from 'react'


function AdminNav({steps, currentStep}) {

  const icon = [FaStripeS]
  const [newStep, setNewStep] = useState([]);
  const stepRef = useRef();

  useEffect(()=>{
    const updateStep = steps.map((step, index) => ({
      description: step,
      completed: index < currentStep - 1,
      highlighted: index === currentStep - 1,
      selected: index <= currentStep -1,
    }));
    setNewStep(updateStep);
  }, [steps, currentStep]);


  return (
    <div className="flex items-center justify-between w-full py-6 px-4 bg-white rounded-lg shadow-sm">

      {newStep.map((step, index)=>(
        <div key={index} className="flex flex-col items-center w-full">

          {/*Step Circle*/}
          <div className={`rounded-full h-10 w-10 flex items-center justify-center font-bold transition-colors duration-300
            ${step.completed ? "bg-green-600 text-white" : step.selected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}
            ${step.highlighted ? "border-4 border-blue-400":" "}`}>

              {index + 1}

          </div>
            
            {/*Step Description*/}
            <div className="ml-2 text-base font-medium text-center">{step.description}</div>

        </div>
      ))}
    </div>
  )
}

export default AdminNav