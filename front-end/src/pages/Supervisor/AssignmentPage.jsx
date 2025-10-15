import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

// Define 4 positions for each line
const LINE_POSITIONS = [
  { id: 1, name: 'Position 1', description: 'Primary Position' },
  { id: 2, name: 'Position 2', description: 'Secondary Position' },
  { id: 3, name: 'Position 3', description: 'Tertiary Position' },
  { id: 4, name: 'Position 4', description: 'Quaternary Position' }
];

const AssignmentPage = () => {
  const [selectedLine, setSelectedLine] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [lineAssignments, setLineAssignments] = useState({
    1: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    2: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    3: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    4: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    5: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    6: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    7: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) },
    8: { positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null})) }
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignmentTable, setShowAssignmentTable] = useState(false);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:8001/api/employees");
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to fetch employees data");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      setEmployees(updatedEmployees);
    });

    socket.on("employeeUpdate", (updatedEmployee) => {
      setEmployees(prev => 
        prev.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp)
      );
    });

    return () => {
      socket.off("leadingLineUpdate");
      socket.off("employeeUpdate");
    };
  }, []);

  // Clear selected worker when switching lines
  useEffect(() => {
    setSelectedWorker(null);
  }, [selectedLine]);

  // Get current line's data
  const currentLineData = lineAssignments[selectedLine];
  const positions = currentLineData.positions;
  
  // Get all assigned employee IDs for the current line
  const assignedEmployeeIds = positions
    .filter(p => p.employeeId)
    .map(p => p.employeeId);

  // Filter available workers by line and exclude already assigned workers
  const getAvailableWorkers = () => {
    if (loading || employees.length === 0) {
      return [];
    }

    // Use backend data - filter employees by line and not assigned
    const lineEmployees = employees.filter(emp => 
      emp.line === selectedLine && 
      !assignedEmployeeIds.includes(emp._id)
    );
    
    return lineEmployees.map(emp => ({
      id: emp._id,
      name: emp.name,
      position: emp.position || 'General Worker',
      pcs: emp.pcs || 0,
      line: emp.line,
      status: emp.status || 'Active'
    }));
  };
  
  const availableWorkers = getAvailableWorkers();

  // Select worker
  const handleWorkerSelect = (worker) => {
    setSelectedWorker(selectedWorker?.id === worker.id ? null : worker);
  };

  // Assign worker to position
  const assignWorkerToPosition = async (positionId) => {
    if (!selectedWorker) return;
    
    // Check if position is already occupied
    const position = positions.find(p => p.id === positionId);
    if (position.employeeId) {
      setError("This position is already occupied. Please unassign the current worker first.");
      return;
    }
    
    try {
      // Update employee's line and position in backend
      await axios.put(
        `http://localhost:8001/api/employees/${selectedWorker.id}`,
        {
          line: selectedLine,
          position: position.name,
          status: 'Active'
        }
      );
      
      // Update local state
      setLineAssignments(prev => ({
        ...prev,
        [selectedLine]: {
          positions: prev[selectedLine].positions.map(p => {
            if (p.id === positionId) {
              return {
                ...p,
                employee: selectedWorker.name,
                employeeId: selectedWorker.id,
                employeePosition: selectedWorker.position
              };
            }
            return p;
          })
        }
      }));
      
      setSelectedWorker(null);
      setError(null);
      console.log("✅ Worker assigned successfully");
      
    } catch (error) {
      console.error("❌ Error assigning worker:", error);
      setError("Failed to assign worker. Please try again.");
    }
  };

  // Unassign worker from position
  const unassignWorkerFromPosition = async (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (!position.employeeId) return;

    if (!window.confirm(`Are you sure you want to unassign ${position.employee} from ${position.name}?`)) {
      return;
    }

    try {
      // Update employee status in backend (optional - you can keep them assigned or mark as unassigned)
      await axios.put(
        `http://localhost:8001/api/employees/${position.employeeId}`,
        {
          position: 'Unassigned'
        }
      );

      // Update local state
      setLineAssignments(prev => ({
        ...prev,
        [selectedLine]: {
          positions: prev[selectedLine].positions.map(p => {
            if (p.id === positionId) {
              return {
                ...p,
                employee: null,
                employeeId: null,
                employeePosition: null
              };
            }
            return p;
          })
        }
      }));

      setError(null);
      console.log("✅ Worker unassigned successfully");

    } catch (error) {
      console.error("❌ Error unassigning worker:", error);
      setError("Failed to unassign worker. Please try again.");
    }
  };

  // Clear all assignments for current line
  const handleClearLine = async () => {
    if (!window.confirm(`Are you sure you want to clear all assignments for Line ${selectedLine}?`)) {
      return;
    }

    try {
      // Unassign all employees on this line
      const assignedIds = positions.filter(p => p.employeeId).map(p => p.employeeId);
      
      for (const empId of assignedIds) {
        await axios.put(
          `http://localhost:8001/api/employees/${empId}`,
          { position: 'Unassigned' }
        );
      }

      // Reset local state
      setLineAssignments(prev => ({
        ...prev,
        [selectedLine]: {
          positions: LINE_POSITIONS.map(p => ({...p, employee: null, employeeId: null}))
        }
      }));

      setSelectedWorker(null);
      setError(null);

    } catch (error) {
      console.error("❌ Error clearing line:", error);
      setError("Failed to clear line assignments. Please try again.");
    }
  };

  // Get assignment summary for all lines
  const getAssignmentSummary = () => {
    return Object.entries(lineAssignments).map(([lineNum, data]) => {
      const assignedCount = data.positions.filter(p => p.employeeId).length;
      const assignedEmployees = data.positions
        .filter(p => p.employee)
        .map(p => ({
          position: p.name,
          employee: p.employee,
          employeePosition: p.employeePosition || 'N/A'
        }));

      return {
        lineNum: parseInt(lineNum),
        assignedCount,
        totalPositions: data.positions.length,
        employees: assignedEmployees
      };
    });
  };

  const handleShowAssignmentTable = () => {
    setShowAssignmentTable(true);
  };

  const handleCloseAssignmentTable = () => {
    setShowAssignmentTable(false);
  };

  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
      <div className="space-y-6 ml-64 w-full mt-16 p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <span className="font-medium">Error: </span>
              <span className="ml-2">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              <span>Loading employee data...</span>
            </div>
          </div>
        )}
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Employee Assignment Management</h2>
            <button
              onClick={handleShowAssignmentTable}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg"
            >
              View All Assignments
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Production Line:</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((lineNum) => {
                const assigned = lineAssignments[lineNum].positions.filter(p => p.employeeId).length;
                return (
                  <button
                    key={lineNum}
                    onClick={() => setSelectedLine(lineNum)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                      selectedLine === lineNum
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>Line {lineNum}</div>
                    <div className="text-xs mt-1">{assigned}/4</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Position Layout */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Line {selectedLine} - Positions</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  {positions.filter(p => p.employeeId).length}/4 Filled
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className={`p-5 rounded-xl text-center min-h-32 flex flex-col justify-center transition-all duration-300 ${
                      position.employeeId
                        ? 'bg-green-50 border-2 border-green-500 border-solid'
                        : 'bg-gray-50 border-2 border-gray-300 border-dashed'
                    }`}
                  >
                    <strong className="block mb-2 text-lg">{position.name}</strong>
                    <small className="text-gray-500 mb-3">{position.description}</small>
                    
                    {position.employeeId ? (
                      <>
                        <p className="font-medium text-gray-800 mb-1">{position.employee}</p>
                        <small className="text-gray-600 mb-3">{position.employeePosition}</small>
                        <div className="flex gap-2">
                          <button
                            onClick={() => assignWorkerToPosition(position.id)}
                            disabled={!selectedWorker}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedWorker
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => unassignWorkerFromPosition(position.id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => assignWorkerToPosition(position.id)}
                        disabled={!selectedWorker}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedWorker
                            ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedWorker ? 'Assign Selected' : 'Select Worker First'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
                  onClick={handleClearLine}
                >
                  Clear All Assignments
                </button>
              </div>
            </div>

            {/* Available Workers */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Available Employees - Line {selectedLine}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {availableWorkers.length} Available
                </span>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {availableWorkers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available employees for this line</p>
                    <small className="text-xs">All employees are assigned or no employees exist for Line {selectedLine}</small>
                  </div>
                ) : (
                  availableWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      onClick={() => handleWorkerSelect(worker)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedWorker?.id === worker.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-800">{worker.name}</div>
                          <div className="text-sm text-gray-600">ID: {worker.id}</div>
                        </div>
                        {selectedWorker?.id === worker.id && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong>Position:</strong> {worker.position}
                        </div>
                        <div>
                          <strong>Production:</strong> {worker.pcs} pcs
                        </div>
                        <div>
                          <strong>Line:</strong> {worker.line}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                            worker.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {worker.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Table Modal */}
        {showAssignmentTable && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">All Line Assignments</h3>
                <button
                  className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none"
                  onClick={handleCloseAssignmentTable}
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getAssignmentSummary().map((lineSummary) => (
                  <div key={lineSummary.lineNum} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-gray-800">Line {lineSummary.lineNum}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lineSummary.assignedCount === lineSummary.totalPositions
                          ? 'bg-green-100 text-green-800'
                          : lineSummary.assignedCount > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lineSummary.assignedCount}/{lineSummary.totalPositions} Filled
                      </span>
                    </div>
                    
                    {lineSummary.employees.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No assignments</p>
                    ) : (
                      <div className="space-y-2">
                        {lineSummary.employees.map((emp, idx) => (
                          <div key={idx} className="bg-blue-50 rounded-lg p-3 text-sm">
                            <div className="font-semibold text-gray-800">{emp.position}</div>
                            <div className="text-gray-700">{emp.employee}</div>
                            <div className="text-xs text-gray-500">{emp.employeePosition}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;