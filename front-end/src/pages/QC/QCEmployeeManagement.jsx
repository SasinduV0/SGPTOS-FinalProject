
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Users, Edit3, Save, X, Search, Filter } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { QCManagerLinks } from '../Data/SidebarNavlinks';

const QCEmployeeManagement = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-16');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');
  
  const [employees, setEmployees] = useState([
    { id: 101, name: 'Dilmi ', qcUnit: 'Operation A', dateAdded: '2025-01-15', status: 'Active' },
    { id: 102, name: 'Dulari', qcUnit: 'Operation B', dateAdded: '2025-02-10', status: 'Active' },
    { id: 103, name: 'Raneesha ', qcUnit: 'Operation C', dateAdded: '2025-01-22', status: 'Active' },
    { id: 104, name: 'Sasindu', qcUnit: 'Operation A', dateAdded: '2025-03-05', status: 'Active' },
    { id: 105, name: 'Mihiran', qcUnit: 'Operation B', dateAdded: '2025-02-18', status: 'Active' },
    { id: 106, name: 'Sandun', qcUnit: 'Operation C', dateAdded: '2025-01-30', status: 'Active' },
    { id: 107, name: 'Pahasara', qcUnit: 'Operation A', dateAdded: '2025-03-12', status: 'Active' },
    { id: 108, name: 'Kamal', qcUnit: 'Operation B', dateAdded: '2025-02-25', status: 'Active' }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    id: '',
    qcUnit: 'Operation A',
    status: 'Active'
  });

  const [editData, setEditData] = useState({});

  const qcUnits = [
    'Operation A', 'Operation B', 'Operation C', 'Operation D',
    'Operation E', 'Operation F', 'Operation G', 'Operation H'
  ];

  // Validation function
  const validateEmployee = (employee) => {
    if (!employee.name.trim()) return 'Employee name is required';
    if (!employee.id.toString().trim()) return 'Employee ID is required';
    if (employees.some(emp => emp.id === parseInt(employee.id) && emp.id !== editingEmployee)) {
      return 'Employee ID already exists';
    }
    return null;
  };

  const handleAddEmployee = () => {
    const error = validateEmployee(newEmployee);
    if (error) {
      alert(error);
      return;
    }

    const employeeToAdd = {
      id: parseInt(newEmployee.id),
      name: newEmployee.name.trim(),
      qcUnit: newEmployee.qcUnit,
      dateAdded: new Date().toISOString().split('T')[0],
      status: newEmployee.status
    };
    
    setEmployees(prev => [...prev, employeeToAdd]);
    setNewEmployee({ name: '', id: '', qcUnit: 'Operation A', status: 'Active' });
    setShowAddForm(false);
  };

  const handleEditEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEditData({ ...employee });
    setEditingEmployee(employeeId);
  };

  const handleSaveEdit = () => {
    const error = validateEmployee(editData);
    if (error) {
      alert(error);
      return;
    }

    setEmployees(prev => 
      prev.map(emp => 
        emp.id === editingEmployee 
          ? { ...editData, name: editData.name.trim() }
          : emp
      )
    );
    setEditingEmployee(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditData({});
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const toggleStatus = (employeeId) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' }
          : emp
      )
    );
  };

  // Filter and search employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.toString().includes(searchTerm);
    const matchesFilter = filterUnit === 'ALL' || employee.qcUnit === filterUnit;
    return matchesSearch && matchesFilter;
  });

  // Helper functions
  const getMostCommonUnit = () => {
    if (employees.length === 0) return 'None';
    
    const unitCounts = employees.reduce((acc, emp) => {
      acc[emp.qcUnit] = (acc[emp.qcUnit] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(unitCounts).reduce((a, b) => 
      unitCounts[a] > unitCounts[b] ? a : b
    );
  };

  const getActiveEmployees = () => employees.filter(emp => emp.status === 'Active').length;

  return (
    <div className="ml-70 mt-20 min-h-screen bg-gray-50">
      <SideBar title="QC Panel" links={QCManagerLinks} />
      
      <div className="p-4 lg:p-6">
        {/* Header Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QC Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage Quality Control team members and their assignments</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Date Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Add Employee Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add QC Employee
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All QC Units</option>
                {qcUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Employee Form */}
          {showAddForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New QC Employee</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name *</label>
                  <input
                    type="text"
                    placeholder="Enter employee name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                  <input
                    type="number"
                    placeholder="Enter employee ID"
                    value={newEmployee.id}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QC Unit</label>
                  <select
                    value={newEmployee.qcUnit}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, qcUnit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {qcUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddEmployee}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Employee
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEmployee({ name: '', id: '', qcUnit: 'Operation A', status: 'Active' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">QC Employee Directory</h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredEmployees.length} of {employees.length} QC employees
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QC Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployee === employee.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployee === employee.id ? (
                        <input
                          type="number"
                          value={editData.id}
                          onChange={(e) => setEditData(prev => ({ ...prev, id: parseInt(e.target.value) }))}
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-blue-600">{employee.id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployee === employee.id ? (
                        <select
                          value={editData.qcUnit}
                          onChange={(e) => setEditData(prev => ({ ...prev, qcUnit: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {qcUnits.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {employee.qcUnit}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(employee.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          employee.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {employee.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingEmployee === employee.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEmployee(employee.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No QC employees found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Total QC Employees</div>
            <div className="text-2xl font-bold text-blue-600 mt-2">{employees.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Active Employees</div>
            <div className="text-2xl font-bold text-green-600 mt-2">{getActiveEmployees()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">QC Operations</div>
            <div className="text-2xl font-bold text-purple-600 mt-2">
              {new Set(employees.map(emp => emp.qcUnit)).size}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Most Common Unit</div>
            <div className="text-lg font-bold text-orange-600 mt-2">
              {getMostCommonUnit()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Today's Date</div>
            <div className="text-lg font-bold text-indigo-600 mt-2">
              {new Date(selectedDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCEmployeeManagement;