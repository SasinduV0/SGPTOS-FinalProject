import React from 'react'
// import {Chart as ChartJS} from 'chart.js/auto';
// import {Bar, Doughut, Line} from 'react-chartjs-2'

import LeadingLineCard from '../components/live-dashboard/LeadingLineCard'

import OverallTargetChart from '../components/Charts/Live-Dashboard/OverallTargetChart'
import FollowingLine from '../components/live-dashboard/FollowingLine'
import Greetings from '../components/live-dashboard/Greeting'
import TopEmployees from '../components/live-dashboard/TopEmployees'
import LineTargetChart from '../components/live-dashboard/LineTargetChart'
import RemainingTime from '../components/live-dashboard/RemainingTime'
import DefectRateChart from '../components/live-dashboard/DefectRateChart'

function LiveDashboard({ lineData }) {

  const lineTargets = {
  1: 1000,
  2: 800,
  3: 900,
  4: 1100,
  5: 950,
  6: 1050,
  7: 700,
  8: 850,
};

  return (
    <div className='px-7 bg-gray-100'>
      <div className='p-5 w-full flex items-center justify-center gap-6 bg-gray-100 '>
        {/* Left-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className='bg-blue-800 rounded-xl shadow-lg p-4 h-[310px] shadow-gray-500'>
            <LeadingLineCard/>
          </div>
          <div className='bg-yellow-300 rounded-xl shadow-lg p-4 h-[250px] shadow-gray-500'>
            {/* <FastestEmployees/> */}
            <TopEmployees/>
          </div>
          <div className='bg-white rounded-xl shadow-lg p-4 h-[240px] shadow-gray-500'>chart 3</div>
        </div>

        {/* Middle-section */}
        <div className="w-[35%]">
          <div className="bg-white rounded-xl shadow-lg  h-[830px] flex items-center justify-center flex-col shadow-gray-500">
              {/* <Greetings/> */}
              <RemainingTime/>
               <OverallTargetChart lineTargets={lineTargets} />
             <div className="">
      <     LineTargetChart />
      </div>
      </div>
      </div>


        {/* Right-section */}
        <div className='w-[30%] flex flex-col gap-4'>
          <div className=' bg-red-700 rounded-xl shadow-lg p-4 h-[310px] shadow-gray-500'>
            <FollowingLine/>
          </div>
          <div className='bg-yellow-300 rounded-xl shadow-lg p-4 h-[250px] shadow-gray-500'>
            chart 3
          </div>
          <div className='bg-white rounded-xl shadow-lg p-4 h-[240px] shadow-gray-500'>
              <div className='flex items-center justify-center'>
                <DefectRateChart defects={20} total={500} />
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveDashboard