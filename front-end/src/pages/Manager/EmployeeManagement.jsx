import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit2, Save, X, Trash2, Plus } from "lucide-react";
import SideBar from "../../components/SideBar";
import { ManagerLinks } from "../../pages/Data/SidebarNavlinks";

const API_URL = "http://localhost:8001/api/line-management";

const LineManagement = () => {
  const [lineManagementData, setLineManagementData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    superviorID: "",
    name: "",
    unit: "Unit A",
    lineNo: "",
    position: "",
    status: "Active",
    startedDate: "",
  });

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setLineManagementData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Input handlers
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewChange = (field, value) => {
    setNewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (value, isEdit = false) => {
    if (isEdit) {
      setEditData((prev) => ({ ...prev, lineNo: value }));
    } else {
      setNewData((prev) => ({ ...prev, lineNo: value }));
    }
  };

  // CRUD
  const handleSave = async () => {
    try {
      // Convert single lineNo to array format for backend if it's a string
      const dataToSend = {
        ...editData,
        lineNo: typeof editData.lineNo === 'string' ? [editData.lineNo] : editData.lineNo
      };
      
      await axios.put(`${API_URL}/${editingRow}`, dataToSend);
      setEditingRow(null);
      setEditData({});
      fetchData();
    } catch (err) {
      alert("Error updating: " + err.response?.data?.error);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supervisor?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting: " + err.response?.data?.error);
    }
  };

  const handleAdd = async () => {
    // Validate required fields
    if (!newData.superviorID.trim()) {
      alert("Supervisor ID is required");
      return;
    }
    if (!newData.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!newData.position.trim()) {
      alert("Position is required");
      return;
    }
    if (!newData.startedDate) {
      alert("Started Date is required");
      return;
    }
    if (!newData.lineNo) {
      alert("Please select a line number");
      return;
    }

    try {
      // Convert single lineNo to array format for backend
      const dataToSend = {
        ...newData,
        lineNo: [newData.lineNo] // Convert single selection to array
      };
      
      await axios.post(API_URL, dataToSend);
      setNewData({
        superviorID: "",
        name: "",
        unit: "Unit A",
        lineNo: "",
        position: "",
        status: "Active",
        startedDate: "",
      });
      fetchData();
    } catch (err) {
      alert("Error adding: " + err.response?.data?.error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mt-20 ml-70">
      <SideBar title="Manager Panel" links={ManagerLinks} />
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Line Management</h3>
      </div>

      {/* Add New Supervisor Form */}
      <div className="p-6 bg-gray-50 border-b">
        <h4 className="text-md font-medium text-gray-700 mb-4">Add New Supervisor</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Supervisor ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor ID</label>
            <input
              type="text"
              value={newData.superviorID}
              onChange={(e) => handleNewChange("superviorID", e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="S001"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newData.name}
              onChange={(e) => handleNewChange("name", e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter supervisor name"
              list="name-suggestions"
            />
            <datalist id="name-suggestions">
              <option value="John Doe" />
              <option value="Jane Smith" />
              <option value="Alice Brown" />
              <option value="Bob White" />
            </datalist>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={newData.unit}
              onChange={(e) => handleNewChange("unit", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Unit A">Unit A</option>
              <option value="Unit B">Unit B</option>
              <option value="Unit C">Unit C</option>
            </select>
          </div>

          {/* Line No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Line Number</label>
            <select
              value={newData.lineNo}
              onChange={(e) => handleLineChange(e.target.value, false)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Line</option>
              <option value="Line 01">Line 01</option>
              <option value="Line 02">Line 02</option>
              <option value="Line 03">Line 03</option>
              <option value="Line 04">Line 04</option>
              <option value="Line 05">Line 05</option>
              <option value="Line 06">Line 06</option>
              <option value="Line 07">Line 07</option>
              <option value="Line 08">Line 08</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={newData.position}
              onChange={(e) => handleNewChange("position", e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Supervisor"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newData.status}
              onChange={(e) => handleNewChange("status", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Started Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Started Date</label>
            <input
              type="date"
              value={newData.startedDate}
              onChange={(e) => handleNewChange("startedDate", e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Supervisor
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Supervisor ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Unit</th>
              <th className="p-3 text-left">Line No</th>
              <th className="p-3 text-left">Position</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Started Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lineManagementData.map((row) => (
              <tr key={row._id} className="border-b hover:bg-gray-50">
                {/* Supervisor ID */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <input
                      type="text"
                      value={editData.superviorID || ""}
                      onChange={(e) => handleInputChange("superviorID", e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    row.superviorID
                  )}
                </td>

                {/* Name */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full p-1 border rounded"
                      list="edit-name-suggestions"
                    />
                  ) : (
                    row.name
                  )}
                  {editingRow === row._id && (
                    <datalist id="edit-name-suggestions">
                      <option value="John Doe" />
                      <option value="Jane Smith" />
                      <option value="Alice Brown" />
                      <option value="Bob White" />
                    </datalist>
                  )}
                </td>

                {/* Unit */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <select
                      value={editData.unit || ""}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                      className="w-full p-1 border rounded"
                    >
                      <option>Unit A</option>
                      <option>Unit B</option>
                      <option>Unit C</option>
                    </select>
                  ) : (
                    row.unit
                  )}
                </td>

                {/* Line No */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <select
                      value={editData.lineNo || ""}
                      onChange={(e) => handleLineChange(e.target.value, true)}
                      className="w-full p-1 border rounded"
                    >
                      <option value="">Select Line</option>
                      {["Line 01","Line 02","Line 03","Line 04","Line 05","Line 06","Line 07","Line 08"].map(
                        (line) => (
                          <option key={line} value={line}>
                            {line}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {Array.isArray(row.lineNo) 
                        ? (row.lineNo.length > 0 ? row.lineNo[0] : "No Line Assigned")
                        : (row.lineNo || "No Line Assigned")
                      }
                    </span>
                  )}
                </td>

                {/* Position */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <input
                      type="text"
                      value={editData.position || ""}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    row.position
                  )}
                </td>

                {/* Status */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <select
                      value={editData.status || ""}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full p-1 border rounded"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  )}
                </td>

                {/* Started Date */}
                <td className="p-3">
                  {editingRow === row._id ? (
                    <input
                      type="date"
                      value={editData.startedDate?.substring(0, 10) || ""}
                      onChange={(e) => handleInputChange("startedDate", e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    new Date(row.startedDate).toLocaleDateString()
                  )}
                </td>

                {/* Actions */}
                <td className="p-3 flex space-x-2">
                  {editingRow === row._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingRow(row._id);
                          // Convert array lineNo to single value for editing
                          const editableData = {
                            ...row,
                            lineNo: Array.isArray(row.lineNo) ? row.lineNo[0] || "" : row.lineNo
                          };
                          setEditData(editableData);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineManagement;
