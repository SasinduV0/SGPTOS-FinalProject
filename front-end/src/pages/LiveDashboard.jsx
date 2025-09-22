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
import TotalProduction from '../components/BottomBar/Total'
import LineTargetSum from '../components/BottomBar/LineTargetSum'
import RemainingTarget from '../components/BottomBar/RemainingTarget'
import Remain from '../components/BottomBar/Remain'
import RemainingTimeBottom from '../components/BottomBar/RemainingTimeBottom'
import EfficiencyRate from '../components/BottomBar/EffeciencyRate'
import DefectRate from '../components/BottomBar/DefectRate'
import AssignSupervisor from '../components/live-dashboard/AssignSupervisor'
import ReallocatedEmployees from '../components/live-dashboard/ReallocatedEmployees'

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
    <div className='h-screen flex flex-col bg-gray-100'>
      {/* Main content area */}
      <div className='flex-1 px-7'>
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
            <div className='bg-white rounded-xl shadow-lg p-4 h-[270px] shadow-gray-500'>
              <AssignSupervisor/>
            </div>
          </div>

          {/* Middle-section */}
          <div className="w-[35%]">
            <div className="bg-white rounded-xl shadow-lg  h-[860px] flex items-center justify-center flex-col shadow-gray-500">
                {/* <Greetings/> */}
                <RemainingTime/>
                <div className='flex'>
                  <OverallTargetChart lineTargets={lineTargets} />
                  <RemainingTarget/>
                </div>
                
                <div className="mt-10">
                  < LineTargetChart />
                </div>
            </div>
          </div>


          {/* Right-section */}
          <div className='w-[30%] flex flex-col gap-4'>
            <div className=' bg-red-700 rounded-xl shadow-lg p-4 h-[300px] shadow-gray-500'>
              <FollowingLine/>
            </div>
            <div className='bg-white rounded-xl shadow-lg p-4 h-[270px] shadow-gray-500'>
              <ReallocatedEmployees/>

            </div>
            <div className='bg-white rounded-xl shadow-lg p-4 pt-5 h-[260px] shadow-gray-500'>
                <div className='flex items-center justify-center mt-2'>
                  <DefectRateChart defects={20} total={500} />
                </div>
            </div>
          </div>
        </div> 
      </div>

      {/* Bottom bar - will always be at the bottom */}
      <div className='w-full h-16 bg-black overflow-hidden flex '>
        <LineTargetSum/>
        <TotalProduction/>
        <Remain/>
        <EfficiencyRate/>
        <DefectRate/>
        <RemainingTimeBottom/>
        <Greetings/>
      </div>
    </div>
  )
}

export default LiveDashboard