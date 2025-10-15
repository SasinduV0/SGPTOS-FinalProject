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
import LineTargetCharts from '../components/live-dashboard/LineTargetCharts'
import OverallTargetChartsRFID from '../components/Charts/Live-Dashboard/OverallTargetChartsRFID'
// import RemainingTargetRFID from '../components/Manager/RemainingTargetRFID'
import RemainingTargetRFIDYY from '../components/BottomBar/RemainingTargetRFIDYY'

function LiveDashboard({ lineData }) {

  const lineTargets = {
    1: 100,
    2: 80,
    3: 90,
    4: 110,
    5: 95,
    6: 105,
    7: 70,
    8: 85,
  };

  return (
    <div className=' w-screen flex flex-col bg-gray-100 overflow-hidden'>
      {/* Main content area - takes remaining height after bottom bar */}
      <div className='flex-1'>
        <div className='h-full w-full flex items-center justify-center gap-6 bg-gray-100 p-5'>
          {/* Left-section */}
          <div className='w-[30%] h-full flex flex-col gap-4'>
            <div className='bg-blue-800 rounded-xl shadow-lg px-4 py-2 h-[270px] shadow-gray-500'>
              <LeadingLineCard/>
            </div>
            <div className='bg-yellow-300 rounded-xl shadow-lg p-4 h-[226px]  shadow-gray-500'>
              {/* <FastestEmployees/> */}
              <TopEmployees/>
            </div>
            <div className='bg-white rounded-xl shadow-lg p-4 flex-[200] shadow-gray-500'>
              <AssignSupervisor/>
            </div>
          </div>

          {/* Middle-section */}
          <div className="w-[35%] h-[765px]">
            <div className="bg-white rounded-xl shadow-lg h-full flex items-center justify-center flex-col shadow-gray-500 p-4">
              {/* <Greetings/> */}
              <div className='flex'>
                <RemainingTime/>
              </div>
              <div className='flex items-center justify-center flex-1'>
                {/* <OverallTargetChart lineTargets={lineTargets} /> */}
                <OverallTargetChartsRFID/>

                {/* <RemainingTarget/> */}
                {/* <RemainingTargetRFID/>    this is manager dashboard card = wrong entry */}
                <RemainingTargetRFIDYY/>

              </div>
              <div className="flex mt-4">
                {/* <LineTargetChart /> */}
                <LineTargetCharts/>
              </div>
            </div>
          </div>

          {/* Right-section */}
          <div className='w-[30%] h-full flex flex-col gap-4'>
            <div className='bg-red-700 rounded-xl shadow-lg p-4 h-[270px]  shadow-gray-500'>
              <FollowingLine/>
            </div>
            <div className='bg-white rounded-xl shadow-lg p-4 h-[245px] shadow-gray-500'>
              <ReallocatedEmployees/>
            </div>
            <div className='bg-white rounded-xl shadow-lg p-4 pt-5 h-[220px] shadow-gray-500'>
              <div className='h-full flex items-center justify-center'>
                <DefectRateChart defects={20} total={500} />
              </div>
            </div>
          </div>
        </div> 
      </div>

      {/* Bottom bar - fixed at bottom */}
      <div className='w-full h-14 bg-black overflow-hidden flex'>
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