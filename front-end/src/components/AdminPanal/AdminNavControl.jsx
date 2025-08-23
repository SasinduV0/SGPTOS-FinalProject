import React from 'react'

function AdminNavControl({handleClick, currentStep, steps}) {
  return (
    <div className="container flex justify-around mt-4 mb-8">

        <button 
            onClick={()=> handleClick("back")}
            className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-xl
            ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={currentStep===1}> Back </button>

        <button 
            onClick={()=> handleClick("next")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            > {currentStep===steps.length - 1 ? "Confirm":"Next"} </button>
    </div>
  )
}

export default AdminNavControl