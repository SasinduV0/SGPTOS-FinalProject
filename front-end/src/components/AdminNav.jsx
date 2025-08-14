import React from 'react'
import { FaStripeS } from "react-icons/fa";


function AdminNav({currentStep}) {

  const icon = [FaStripeS]

  const step = ["Employee Details", "Security", "Review"];
  return (
    <div className="flex gap-4 mb-6">

      {icon.map((label, index) => (

        <div
          key={index}
          className={`px-4 py-2 rounded ${
            currentStep === index + 1 ? "bg-blue-500 text-white":"bg-gray-500"}`}
              >

                {label}

          </div>

      ))}
    </div>
  )
}

export default AdminNav