import React from 'react'

function LiveDashboard() {
  return (
    <div>
      <div className='h-screen w-full flex items-center justify-center gap-4 bg-gray-300'>
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-blue-800 rounded-xl shadow-2xl p-4 h-[250px]'>
            <h2 className='text-white text-lg font-semibold flex items-center justify-center'>Leading Line</h2>
            <p className="text-sm">Line 4 : Target achieved</p>
          </div>

          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
        </div>
        <div className='w-[30%]'>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[680px]'>chart 2</div>
        </div>
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[250px]'>chart 1</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
          <div className='bg-gray-400 rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
        </div>
      </div>
    </div>
  )
}

export default LiveDashboard