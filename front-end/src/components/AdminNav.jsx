import React from 'react'
import { FaStripeS } from "react-icons/fa";


function AdminNav({currentStep}) {

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
    <div className="flex justify-between item-center">

      {newStep.map((step, index)=>(
        <div key={index} className="flex item-center">

          <div className={`rounded-full h-10 w-10 flex items-center justify-center
            ${step.selected ? "bg-blue-600 text-white" : "bg-gray-200"}`}>

              {index + 1}

          </div>

            <div className="ml-2">{step.description}</div>

            {index !== steps.length - 1 && (
              <div className="flex-auto border-t-2 mx-2"></div>
            )}
        </div>
      ))}
    </div>
  )
}

export default AdminNav