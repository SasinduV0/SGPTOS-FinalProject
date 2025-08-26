import React, { useState } from "react";
import SideBar from '../../components/SideBar'
import {SupervisorLinks} from '../../pages/Data/SidebarNavlinks';
import {
  User,
  Eye,
  FilePenLine,
  XCircle,
} from "lucide-react";

const WAssignment = () => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const stats = [
    {
      title: "Present",
      value: "8/8",
      color: "text-green-600",
      icon: <User className="w-5 h-5 text-green-500" />,
    },
    {
      title: "On Break",
      value: "1",
      color: "text-yellow-600",
      icon: <User className="w-5 h-5 text-yellow-500" />,
    },
    {
      title: "Avg Performance",
      value: "101%",
      color: "text-blue-600",
      icon: <User className="w-5 h-5 text-blue-500" />,
    },
    {
      title: "Tasks Done",
      value: "53",
      color: "text-purple-600",
      icon: <User className="w-5 h-5 text-purple-500" />,
    },
  ];

  const team = [
    {
      id: "W001",
      name: "John Doe",
      line: "Line 1",
      position: "Assembly Operator",
      station: "Station 1",
      shiftStart: "06:00",
      skills: ["Assembly", "Quality Check"],
      notes: "Consistently high performer",
    },
    {
      id: "W002",
      name: "Jane Smith",
      line: "Line 2",
      position: "QC Inspector",
      station: "QC Station",
      shiftStart: "09:00",
      skills: ["Quality Check", "Reporting"],
      notes: "Excellent attention to detail",
    },
    {
      id: "W003",
      name: "Mike Johnson",
      line: "Line 1",
      position: "Packer",
      station: "Packaging",
      shiftStart: "08:30",
      skills: ["Packing", "Inventory"],
      notes: "Quick and efficient",
    },
    {
      id: "W004",
      name: "Lisa Brown",
      line: "Line 2",
      position: "Supervisor",
      station: "Line Control",
      shiftStart: "07:30",
      skills: ["Leadership", "Planning"],
      notes: "Great leadership skills",
    },
  ];

  const handleEditClick = (worker) => {
    setSelectedWorker(worker);
    setShowEditModal(true);
  };

  return (
    <div className='ml-70 mt-20 p-9 space-y-9'>
      <SideBar title="Manager Panel" links={SupervisorLinks} />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Worker Assignment
        </h1> 
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-gray-600">{s.title}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Workers Details table*/}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800"> Daily Worker Assignment</h2>
        </div>
        <div classNmae="overflow-x-audio">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-15 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {team.map((m) => (
                <tr
                  key={m.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-6 py-4 ">{m.id}</td>

                  {/* Line */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {m.line}
                    </span>
                  </td>

                  {/* Position */}
                  <td className="px-6 py-4">{m.position}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 flex gap-6">
                    <button
                      onClick={() => setSelectedWorker(m)}
                      className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow transition"
                      title="Show Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:shadow transition"
                      title="Edit Details"
                    >
                      <FilePenLine className="w-4 h-4" />
                    </button>
  
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Show Details Modal */}
      {selectedWorker && !showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedWorker.name}</h3>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-gray-500 hover:text-gray-700"
               >
                 <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium">{selectedWorker.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Station</p>
                <p className="font-medium">{selectedWorker.station}</p>
              </div>
             <div>
                <p className="text-sm text-gray-600">Shift Start</p>
                <p className="font-medium">{selectedWorker.shiftStart}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedWorker.skills.map((skill, index) => (
                    <span
                     key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md focus:ring-2 focus:ring-green-400"
                    >
                   {skill}
                   </span>
                    ))}
                 </div>
               </div>
             <div>
               <p className="text-sm text-gray-600">Notes</p>
               <p className="font-medium">{selectedWorker.notes}</p>
             </div>
           </div>
        </div>
      </div>
      )}
      

      {/* Edit Modal */}
      {showEditModal && selectedWorker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative border-gray-200">
            
            {/* Close button (X) */}
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedWorker(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XCircle size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4">Edit Worker Assignment</h2>
            <p className="text-sm text-gray-600 mb-4">
              Editing details for{" "}
              <span className="font-medium">{selectedWorker.name}</span>
            </p>

            {/* Simple form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Line</label>
                <input
                  type="text"
                  defaultValue={selectedWorker.line}
                  className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Position</label>
                <input
                  type="text"
                  defaultValue={selectedWorker.position}
                  className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorker(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorker(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WAssignment;

