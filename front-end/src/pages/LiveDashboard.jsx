import React from 'react'
// import {Chart as ChartJS} from 'chart.js/auto';
// import {Bar, Doughut, Line} from 'react-chartjs-2'

import LeadingLineCard from '../components/live-dashboard/LeadingLineCard'

import OverallTargetChart from '../components/Charts/Live-Dashboard/OverallTargetChart'
import FollowingLine from '../components/live-dashboard/FollowingLine'
import Greetings from '../components/live-dashboard/Greeting'
import TopEmployees from '../components/live-dashboard/TopEmployees'
import LineTargetChart from '../components/live-dashboard/LineTargetChart'

function LiveDashboard() {
  return (
    <div>
      <div className='p-5 w-full flex items-center justify-center gap-4 bg-gray-300'>
        {/* Left-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-blue-800 rounded-xl shadow-2xl p-4 h-[350px]'>
            <LeadingLineCard/>
          </div>
          <div className='bg-green-600 rounded-xl shadow-2xl p-4 h-[280px]'>
            {/* <FastestEmployees/> */}
            <TopEmployees/>
          </div>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[270px]'>chart 3</div>
        </div>

        {/* Middle-section */}
        <div className="w-[30%]">
          <div className="bg-gray-400 rounded-xl shadow-2xl p-4 h-[930px] flex items-center justify-center gap-25 flex-col">
            <Greetings/>
            <OverallTargetChart />
             <div className="">
      <     LineTargetChart />
    </div>
          </div>
        </div>


        {/* Right-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className=' bg-red-700 rounded-xl shadow-2xl p-4 h-[350px]'>
            <FollowingLine/>
          </div>
          <div className='bg-yellow-300 rounded-xl shadow-2xl p-4 h-[280px]'>
            chart 3
          </div>
          <div className='bg-white rounded-xl shadow-2xl p-4 h-[270px]'>chart 3</div>
        </div>
      </div>
    </div>
  )
}

export default LiveDashboard