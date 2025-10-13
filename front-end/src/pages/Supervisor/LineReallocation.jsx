import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Activity, RefreshCw, UserPlus } from 'lucide-react';

const LineReallocationApp = () => {
  const [reallocations, setReallocations] = useState([
    {
      _id: '1',
      EmployeeID: 'EMP001',
      name: 'John Smith',
      lineNo: 'L100',
      newLineNo: ['L105', 'L110']
    },
    {
      _id: '2',
      EmployeeID: 'EMP002',
      name: 'Sarah Johnson',
      lineNo: 'L101',
      newLineNo: []
    },
    {
      _id: '3',
      EmployeeID: 'EMP003',
      name: 'Michael Chen',
      lineNo: 'L102',
      newLineNo: ['L120']
    },
    {
      _id: '4',
      EmployeeID: 'EMP004',
      name: 'Emily Davis',
      lineNo: 'L103',
      newLineNo: []
    },
    {
      _id: '5',
      EmployeeID: 'EMP005',
      name: 'David Martinez',
      lineNo: 'L104',
      newLineNo: ['L115', 'L125']
    },
    {
      _id: '6',
      EmployeeID: 'EMP006',
      name: 'Jessica Brown',
      lineNo: 'L105',
      newLineNo: []
    }
  ]);
  const [reallocatedOnly, setReallocatedOnly] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isConnected, setIsConnected] = useState(true);
  const [formData, setFormData] = useState({
    EmployeeID: '',
    name: '',
    lineNo: '',
    newLineNo: []
  });
  const [recruitFormData, setRecruitFormData] = useState({
    position: '',
    department: '',
    reason: ''
  });

  const API_URL = 'http://localhost:5000/api/line-reallocation';

  useEffect(() => {
    updateReallocatedOnly();
  }, [reallocations]);

  const updateReallocatedOnly = () => {
    const filtered = reallocations.filter(
      item => item.newLineNo && item.newLineNo.length > 0
    );
    setReallocatedOnly(filtered);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      newLineNo: formData.newLineNo.length > 0 ? formData.newLineNo : []
    };

    if (editMode) {
      setReallocations(reallocations.map(item => 
        item._id === currentId ? { ...item, ...payload } : item
      ));
    } else {
      const newEntry = {
        _id: Date.now().toString(),
        ...payload
      };
      setReallocations([...reallocations, newEntry]);
    }
    
    resetForm();
  };

  const handleEdit = (item) => {
    setFormData({
      EmployeeID: item.EmployeeID,
      name: item.name,
      lineNo: item.lineNo,
      newLineNo: item.newLineNo || []
    });
    setCurrentId(item._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setReallocations(reallocations.filter(item => item._id !== id));
    }
  };

  const handleRecruitClick = (employee) => {
    setSelectedEmployee(employee);
    setShowRecruitModal(true);
  };

  const handleRecruitSubmit = () => {
    console.log('Recruiting employee:', selectedEmployee);
    console.log('Position details:', recruitFormData);
    alert(`Recruitment initiated for ${selectedEmployee.name}\nPosition: ${recruitFormData.position}\nDepartment: ${recruitFormData.department}`);
    
    setShowRecruitModal(false);
    setRecruitFormData({
      position: '',
      department: '',
      reason: ''
    });
    setSelectedEmployee(null);
  };

  const resetForm = () => {
    setFormData({
      EmployeeID: '',
      name: '',
      lineNo: '',
      newLineNo: []
    });
    setEditMode(false);
    setCurrentId(null);
    setShowModal(false);
  };

  const handleNewLineNoChange = (value) => {
    const lines = value.split(',').map(l => l.trim()).filter(l => l);
    setFormData({ ...formData, newLineNo: lines });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Line Reallocation Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-gray-800">{reallocations.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Reallocated</p>
                <p className="text-3xl font-bold text-gray-800">{reallocatedOnly.length}</p>
              </div>
              <RefreshCw className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Not Reallocated</p>
                <p className="text-3xl font-bold text-gray-800">{reallocations.length - reallocatedOnly.length}</p>
              </div>
              <Activity className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Employees ({reallocations.length})
            </button>
            <button
              onClick={() => setActiveTab('reallocated')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reallocated'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reallocated Only ({reallocatedOnly.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Line</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Line(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === 'all' ? reallocations : reallocatedOnly).map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.EmployeeID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{item.lineNo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.newLineNo && item.newLineNo.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.newLineNo.map((line, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                              {line}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No reallocation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.newLineNo && item.newLineNo.length > 0 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Reallocated</span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRecruitClick(item)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Recruit for New Position"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(activeTab === 'all' ? reallocations : reallocatedOnly).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No records found
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Reallocation' : 'Add New Reallocation'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.EmployeeID}
                  onChange={(e) => setFormData({ ...formData, EmployeeID: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Line No</label>
                <input
                  type="text"
                  value={formData.lineNo}
                  onChange={(e) => setFormData({ ...formData, lineNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Line No(s) <span className="text-gray-500 text-xs">(comma-separated, optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.newLineNo.join(', ')}
                  onChange={(e) => handleNewLineNoChange(e.target.value)}
                  placeholder="e.g., L101, L102, L103"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecruitModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b bg-purple-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Recruit for New Position</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Employee: {selectedEmployee.name} ({selectedEmployee.EmployeeID})</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Title</label>
                <input
                  type="text"
                  value={recruitFormData.position}
                  onChange={(e) => setRecruitFormData({ ...recruitFormData, position: e.target.value })}
                  placeholder="e.g., Senior Production Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={recruitFormData.department}
                  onChange={(e) => setRecruitFormData({ ...recruitFormData, department: e.target.value })}
                  placeholder="e.g., Quality Assurance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Recruitment</label>
                <textarea
                  value={recruitFormData.reason}
                  onChange={(e) => setRecruitFormData({ ...recruitFormData, reason: e.target.value })}
                  placeholder="e.g., Excellent performance and leadership skills"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRecruitModal(false);
                    setRecruitFormData({ position: '', department: '', reason: '' });
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecruitSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Recruitment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineReallocationApp;