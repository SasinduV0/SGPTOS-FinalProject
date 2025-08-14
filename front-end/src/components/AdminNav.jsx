import React from 'react'

function AdminNav() {

  const step = ["Employee Details", "Security", "Review"];
  return (
    <div className="flex gap-4 mb-6">

      {FaStripeS.map((lable, index) => (

        <div
          key={index}
          className={`px-4 py-2 rounded ${
            step === index + 1 ? "bg-blue-500 text-white":"bg-gray-500"}`}>
              
          </div>

      ))}
    </div>
  )
}

export default AdminNav