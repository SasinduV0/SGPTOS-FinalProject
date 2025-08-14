import React from 'react'
import { FaStripeS } from "react-icons/fa";


function AdminNav({currentStep}) {

  const icon = [FaStripeS]

  const steps = ["Employee Details", "Security", "Review"];
  return (
    <div className="flex gap-4 mb-6 h-10">

      {steps.map((label, index) => (

        <div
          key={index}
          className={`px-4 py-2 rounded ${
            currentStep === index + 1 ? "bg-blue-100 text-white":"bg-gray-500"}`}
              >

                {label}

          </div>

      ))}
    </div>
  )
}

export default AdminNav