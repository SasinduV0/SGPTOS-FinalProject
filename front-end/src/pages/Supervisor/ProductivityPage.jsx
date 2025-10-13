import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';
import LineWiseProductivity from '../../components/Manager/LineWiseProductivity';
import DailyTotalBarChart from '../../components/Manager/DailyTotalBarChart';
import DailyEmployeesList from '../../components/Supervisor/DailyEmployeesList';
import ProductionTargets from '../../components/Supervisor/ProductionTargets';
import { dashboardData } from '../Data/dashboardData';

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });


const ProductivityPage = ({ dashboardData: propDashboardData }) => {
  //Select line 
  const [selectedLine, setSelectedLine] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [defectData, setDefectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees and production data from backend
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

  // Fetch production data
  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/product");
        setProductionData(data);
      } catch (err) {
        console.error("Error fetching production data:", err);
      }
    };
    fetchProductionData();
  }, []);

  // Fetch defect data
  useEffect(() => {
    const fetchDefectData = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/iot/defect-rate");
        setDefectData(data);
      } catch (err) {
        console.error("Error fetching defect data:", err);
      }
    };
    fetchDefectData();
  }, []);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      setEmployees(updatedEmployees);
    });

    socket.on("productionUpdate", (updatedProduction) => {
      setProductionData(updatedProduction);
    });

    socket.on("defectUpdate", (updatedDefects) => {
      setDefectData(updatedDefects);
    });

    return () => {
      socket.off("leadingLineUpdate");
      socket.off("productionUpdate");
      socket.off("defectUpdate");
    };
  }, []);

  // Use backend data if available, otherwise fallback to prop or static data
  const effectiveDashboardData = employees.length > 0 ? {
    ...dashboardData,
    lines: dashboardData.lines.map(line => ({
      ...line,
      workers: employees.filter(emp => emp.line === line.id).length
    }))
  } : (propDashboardData || dashboardData);

  const lineOptions = effectiveDashboardData.lines.map(line => line.name);
  
  const getWorkerLine = (worker) => {
    const foundLine = effectiveDashboardData.lines.find(line =>
      line.workerDetails && line.workerDetails.some(w => w.id === worker.id)
    );
    return foundLine ? foundLine.name : '-';
  };
  
  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
  <div className="space-y-6 ml-64 w-full mt-16">
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
            <span>Loading productivity data...</span>
          </div>
        </div>
      )}
      
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Productivity Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Line Performance Chart */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Line Performance Comparison</h3> */}
            <div className="">
              <LineWiseProductivity/>
            </div>
          </div>

          {/* Daily Production Trends */}
          <div className="">
            <div className="">
              <DailyTotalBarChart/>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Worker Performance Table */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Worker Performance</h3> */}
              <DailyEmployeesList/>
          </div>

          {/* Production Targets */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Production Targets vs Actual</h3> */}
            <div className="space-y-4">
              <ProductionTargets/>
              
              
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductivityPage;