import React, { useState } from 'react';
import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';
import { dashboardData } from '../Data/dashboardData';


const AssignmentPage = () => {
  const [selectedLine, setSelectedLine] = useState(1);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [stations, setStations] = useState([...dashboardData.stations]);
  const [availableWorkers, setAvailableWorkers] = useState([...dashboardData.availableWorkers]);
  const [showOptimizeTable, setShowOptimizeTable] = useState(false);

  //select one time
  const handleWorkerSelect = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? []
        : [workerId]
    );
  };

  //worker assignment to station
  const assignWorkerToStation = (stationId) => {
    if (selectedWorkers.length === 0) return;
    const workerId = selectedWorkers[0];
    const worker = availableWorkers.find(w => w.id === workerId);
    if (!worker) return;
    setStations(prevStations => prevStations.map(station => {
      if (station.id === stationId && !station.occupied) {
        return {
          ...station,
          worker: worker.name,
          task: worker.skills[0] || 'Assigned',
          efficiency: 90, 
          occupied: true
        };
      }
      return station;
    }));
    setAvailableWorkers(prev => prev.filter(w => w.id !== workerId));
    setSelectedWorkers([]);
  };

  const handleReassignWorkers = () => {

    setAvailableWorkers(prev => {
      const assignedWorkers = stations
        .filter(station => station.occupied && station.worker)
        .map(station => {
          const original = dashboardData.availableWorkers.find(w => w.name === station.worker);
          return original || { id: station.worker, name: station.worker, skills: ['Assigned'], experience: 0 };
        });

      const allWorkers = [...prev, ...assignedWorkers];
      const uniqueWorkers = allWorkers.filter((w, idx, arr) => arr.findIndex(x => x.id === w.id) === idx);
      return uniqueWorkers;
    });
    setStations(prevStations => prevStations.map(station => ({
      ...station,
      worker: null,
      task: 'Available',
      efficiency: 0,
      occupied: false
    })));
    setSelectedWorkers([]);
  };

  // Get all workers for the selected line
  const lineInfo = dashboardData.lines.find(line => line.id === selectedLine);
  const lineWorkers = lineInfo ? lineInfo.workers : [];

  
  const usedIds = new Set();

  // Only show assigned workers who are in availableWorkers
  const assignedWorkers = stations
    .filter(s => s.occupied && s.worker && dashboardData.availableWorkers.some(w => w.name === s.worker))
    .map((station) => {
      const original = dashboardData.availableWorkers.find(w => w.name === station.worker);
      return {
        id: original?.id || station.worker,
        name: station.worker,
        occupation: station.task,
        station: station.name
      };
    });
  const unassignedWorkers = availableWorkers.map(w => ({
    id: w.id,
    name: w.name,
    occupation: w.skills[0] || 'Unassigned',
    station: 'Unassigned'
  }));
  const allWorkersForTable = [...assignedWorkers, ...unassignedWorkers];

  const handleOptimizeClick = () => {
    setShowOptimizeTable(true);
  };

  const handleCloseOptimizeTable = () => {
    setShowOptimizeTable(false);
  };

  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
    <div className="space-y-6 ml-64 w-full mt-16">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Worker Assignment Management</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Production Line:</h3>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 4].map((lineNum) => (
              <button
                key={lineNum}
                onClick={() => setSelectedLine(lineNum)}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedLine === lineNum
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Line {lineNum}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Station Layout */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Line {selectedLine} - Station Layout</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {stations.filter(s => s.occupied).length}/{stations.length} Stations Occupied
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {stations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => assignWorkerToStation(station.id)}
                  className={`p-5 rounded-xl text-center min-h-32 flex flex-col justify-center cursor-pointer transition-all duration-300 ${
                    station.occupied
                      ? 'bg-green-50 border-2 border-green-500 border-solid'
                      : 'bg-gray-50 border-2 border-gray-300 border-dashed hover:bg-yellow-50 hover:border-yellow-400'
                  }`}
                >
                  <strong className="block mb-2">{station.name}</strong>
                  {station.occupied ? (
                    <>
                      <p className="font-medium">{station.worker}</p>
                      <small className="text-gray-600">{station.task} • {station.efficiency}% Eff.</small>
                    </>
                  ) : (
                    <p className="text-gray-500">Click to assign worker</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:shadow-lg"
                onClick={handleOptimizeClick}
              >
                Optimize Assignments
              </button>
              <button
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300"
                onClick={handleReassignWorkers}
              >
                Reassign Workers
              </button>
            </div>
            
            {/* Optimize Table Modal */}
            {showOptimizeTable && (
              <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30">
                <div className="bg-white rounded-2xl p-8 shadow-2xl min-w-[350px] max-w-lg w-full relative">
                  <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    onClick={handleCloseOptimizeTable}
                  >
                    &times;
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-center">Optimized Worker Assignments for {lineInfo?.name || `Line ${selectedLine}`}</h3>
                  <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 max-h-80" style={{maxHeight:'22rem'}}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                          <th className="py-3 px-4 text-left font-semibold rounded-tl-xl w-32">Worker ID</th>
                          <th className="py-3 px-4 text-left font-semibold w-40">Worker Name</th>
                          <th className="py-3 px-4 text-left font-semibold w-40">Occupation</th>
                          <th className="py-3 px-4 text-left font-semibold rounded-tr-xl w-40">Station</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {allWorkersForTable.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 px-4 text-center text-gray-400">No workers found for this line.</td>
                          </tr>
                        ) : (
                          [...allWorkersForTable]
                            .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
                            .map((w, idx) => (
                              <tr
                                key={w.id + '-' + idx}
                                className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}
                              >
                                <td className="py-2 px-4 font-mono text-xs text-gray-500">{w.id}</td>
                                <td className="py-2 px-4 font-medium text-gray-800">{w.name}</td>
                                <td className="py-2 px-4 text-gray-700">{w.occupation}</td>
                                <td className={"py-2 px-4 " + (w.station === 'Unassigned' ? 'text-gray-400 font-semibold' : 'text-blue-600 font-semibold')}>{w.station === 'Unassigned' ? 'Unassigned' : w.station}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="py-2 px-4 text-right text-xs text-gray-400 rounded-b-xl">
                            Total: {allWorkersForTable.length} workers
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Workers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Available Workers</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {availableWorkers.length} Available
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {[...availableWorkers].sort((a, b) => a.id.localeCompare(b.id)).map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => handleWorkerSelect(worker.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedWorkers.includes(worker.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-800">{worker.name}</div>
                      <div className="text-sm text-gray-600">ID: {worker.id}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {worker.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>Experience:</strong> {worker.experience} years</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AssignmentPage;