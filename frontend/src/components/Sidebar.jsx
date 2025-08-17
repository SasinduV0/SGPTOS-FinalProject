import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BarChart3, Settings, X } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleDefectRateClick = () => {
    navigate('/defect-rate');
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleHomeClick = () => {
    navigate('/');
    setSidebarOpen(false);
  };

  const handleEmployeeClick = () => {
    navigate('/employee-management');
    setSidebarOpen(false);
  };

  const handleLiveDashboardClick = () => {
    navigate('/live-dashboard');
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 z-30 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out lg:transition-none h-full lg:h-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">zigzag</h1>
            {/* Close button for mobile */}
            <button 
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6">
          <div 
            className={`px-6 py-3 cursor-pointer transition-colors ${
              isActive('/') 
                ? 'bg-gray-700 border-r-4 border-orange-500' 
                : 'hover:bg-gray-700'
            }`}
            onClick={handleHomeClick}
          >
            <div className="flex items-center">
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </div>
          </div>
          
          <div 
            className={`px-6 py-3 cursor-pointer transition-colors ${
              isActive('/defect-rate') 
                ? 'bg-gray-700 border-r-4 border-orange-500' 
                : 'hover:bg-gray-700'
            }`}
            onClick={handleDefectRateClick}
          >
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span>Defect Rate</span>
            </div>
          </div>
          
          <div 
            className={`px-6 py-3 cursor-pointer transition-colors ${
              isActive('/employee-management') 
                ? 'bg-gray-700 border-r-4 border-orange-500' 
                : 'hover:bg-gray-700'
            }`}
            onClick={handleEmployeeClick}
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span>Employee Management</span>
            </div>
          </div>
          
          <div 
            className={`px-6 py-3 cursor-pointer transition-colors ${
              isActive('/live-dashboard') 
                ? 'bg-gray-700 border-r-4 border-orange-500' 
                : 'hover:bg-gray-700'
            }`}
            onClick={handleLiveDashboardClick}
          >
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span>Live dashboard</span>
            </div>
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-6">
          <Settings className="w-6 h-6 cursor-pointer hover:text-gray-300 transition-colors" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;