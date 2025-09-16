import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ For API calls
import { Edit2, Save, X } from "lucide-react";
import SideBar from "../../components/SideBar";
import { ManagerLinks } from "../../pages/Data/SidebarNavlinks";

const LineManagement = () => {
  const [lineManagementData, setLineManagementData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  // ✅ Fetch data from backend on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/line-management")
      .then((res) => setLineManagementData(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Edit row
  const handleEdit = (row) => {
    setEditingRow(row._id); // use _id from MongoDB
    setEditData(row);
  };

  // Save updated row to backend
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/line-management/${editingRow}`,
        editData
      );
      // Update frontend state
      setLineManagementData((prev) =>
        prev.map((item) => (item._id === editingRow ? res.data : item))
      );
      setEditingRow(null);
      setEditData({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow mt-25 ml-70">
      <SideBar title="Manager Panel" links={ManagerLinks} />
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Line Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">
                Employee no
              </th>
              <th className="text-left p-4 font-medium text-gray-700">Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Unit</th>
              <th className="text-left p-4 font-medium text-gray-700">Line No</th>
              <th className="text-left p-4 font-medium text-gray-700">Position</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Started date</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lineManagementData.map((row) => (
              <tr key={row._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{row.employeeNo}</td>
                <td className="p-4">{row.name}</td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <select
                      value={editData.unit || ""}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Unit A">Unit A</option>
                      <option value="Unit B">Unit B</option>
                      <option value="Unit C">Unit C</option>
                    </select>
                  ) : (
                    row.unit
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <select
                      value={editData.lineNo || ""}
                      onChange={(e) => handleInputChange("lineNo", e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Line 01">Line 01</option>
                      <option value="Line 02">Line 02</option>
                      <option value="Line 03">Line 03</option>
                      <option value="Line 04">Line 04</option>
                    </select>
                  ) : (
                    row.lineNo
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <select
                      value={editData.position || ""}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Operator">Operator</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Quality Control">Quality Control</option>
                      <option value="Technician">Technician</option>
                    </select>
                  ) : (
                    row.position
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <select
                      value={editData.status || ""}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <input
                      type="date"
                      value={editData.startedDate?.slice(0, 10) || ""}
                      onChange={(e) => handleInputChange("startedDate", e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row.startedDate?.slice(0, 10)
                  )}
                </td>
                <td className="p-4">
                  {editingRow === row._id ? (
                    <div className="flex space-x-2">
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
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
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
