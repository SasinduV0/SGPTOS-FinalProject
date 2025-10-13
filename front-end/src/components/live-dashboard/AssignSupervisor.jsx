import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser, FaEdit, FaSave, FaTimes } from "react-icons/fa";

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const AssignSupervisor = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    superviorID: "",
    name: "",
    lineNo: []
  });

  // Fetch all supervisors initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch for display (4 latest)
        const res = await axios.get(`http://localhost:8001/api/line-management/names-lines`);
        setSupervisors(res.data);
        
        // Fetch all supervisors for editing dropdown
        const allRes = await axios.get(`http://localhost:8001/api/line-management`);
        setAllSupervisors(allRes.data);
      } catch (err) {
        console.error("Error fetching Supervisors:", err);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("supervisorUpdate", (updatedSupervisors) => {
      setSupervisors(updatedSupervisors);
      // Also update all supervisors list
      const fetchAllSupervisors = async () => {
        try {
          const allRes = await axios.get(`http://localhost:8001/api/line-management`);
          setAllSupervisors(allRes.data);
        } catch (err) {
          console.error("Error fetching all supervisors:", err);
        }
      };
      fetchAllSupervisors();
    });

    return () => {
      socket.off("supervisorUpdate");
    };
  }, []);

  // Handle edit mode
  const handleEdit = (supervisor) => {
    setEditingId(supervisor._id);
    setEditData({
      superviorID: supervisor.superviorID,
      name: supervisor.name,
      lineNo: supervisor.lineNo || []
    });
  };

  // Handle supervisor selection change
  const handleSupervisorChange = (supervisorId) => {
    const selectedSupervisor = allSupervisors.find(sup => sup._id === supervisorId);
    if (selectedSupervisor) {
      setEditData({
        superviorID: selectedSupervisor.superviorID,
        name: selectedSupervisor.name,
        lineNo: selectedSupervisor.lineNo || []
      });
    }
  };

  // Handle line selection change
  const handleLineChange = (e) => {
    const selectedLines = Array.from(e.target.selectedOptions, option => option.value);
    setEditData(prev => ({ ...prev, lineNo: selectedLines }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8001/api/line-management/${editingId}`, editData);
      setEditingId(null);
      setEditData({ superviorID: "", name: "", lineNo: [] });
    } catch (err) {
      console.error("Error updating supervisor:", err);
      alert("Error updating supervisor: " + (err.response?.data?.error || err.message));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditData({ superviorID: "", name: "", lineNo: [] });
  };

  // Get only the 4 latest supervisors (sorted by MongoDB ObjectId which contains creation timestamp)
  const latest4Supervisors = supervisors
    .sort((a, b) => new Date(b._id.substring(0, 8), 16) - new Date(a._id.substring(0, 8), 16))
    .slice(0, 4);

  return (
    <div className="p-0">
      <div className="text-black rounded-2xl px-3 py-1 bg-white">
        <h2 className="text-lg font-bold text-center">Line Supervisors</h2>

        <div className="mt-3 space-y-1/2">
          {latest4Supervisors.length === 0 ? (
            <p className="text-center text-gray-500">No supervisors found</p>
          ) : (
            latest4Supervisors.map((sup, index) => (
              <div
                key={sup._id}
                className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <div className="flex items-center gap-3">
                  <FaUser className="text-gray-600" />
                  <span className="font-medium text-gray-700">
                   {sup.name}
                  </span>
                </div>
                <span className="text-md font-semibold text-gray-600">
                  {sup.lineNo.join(", ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisor;
