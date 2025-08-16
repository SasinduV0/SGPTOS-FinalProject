import React from 'react'
// import {Chart as ChartJS} from 'chart.js/auto';
// import {Bar, Doughut, Line} from 'react-chartjs-2'
import ProductionDashboard from '../components/live-dashboard/ProductionDashboard'
import LeadingLineCard from '../components/live-dashboard/LeadingLineCard'
import FastestEmployees from '../components/live-dashboard/FastestEmployees'
import OverallTargetChart from '../components/Charts/Live-Dashboard/OverallTargetChart'

function LiveDashboard() {
  return (
    <div>
      <div className='p-5 w-full flex items-center justify-center gap-4 bg-gray-300'>
        {/* Left-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-blue-800 rounded-xl shadow-2xl p-4 h-[350px]'>
            <LeadingLineCard/>
          </div>
          <div className='bg-yellow-300 rounded-xl shadow-2xl p-4 h-[260px]'>
            <FastestEmployees/>
          </div>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
        </div>

        {/* Middle-section */}
        <div className="w-[30%]">
          <div className="bg-white rounded-xl shadow-2xl p-4 h-[840px] flex items-center justify-center gap-25 flex-col">
            <OverallTargetChart />
            <OverallTargetChart />
          </div>
        </div>


        {/* Right-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[250px]'>chart 1</div>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[200px]'>chart 3</div>
        </div>
      </div>
    </div>
  )
}

export default LiveDashboard