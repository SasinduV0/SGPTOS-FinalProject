import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Package } from "lucide-react"; // 📦 Production icon

const socket = io("http://localhost:8001", { transports: ["websocket"] });

const TotalProduction = () => {
  const [totalProduction, setTotalProduction] = useState(0);

  const calculateTotalProduction = (employees) => {
    const total = employees.reduce((sum, emp) => sum + (emp.pcs || 0), 0);
    setTotalProduction(total);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await axios.get("http://localhost:8001/api/employees");
      calculateTotalProduction(data);
    };
    fetchEmployees();

    socket.on("leadingLineUpdate", calculateTotalProduction);
    return () => socket.off("leadingLineUpdate", calculateTotalProduction);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-80">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Total Production</h3>
          <p className="text-3xl font-bold text-indigo-600">{totalProduction}</p>
        </div>

        {/* Right side (icon) */}
        <Package className="w-12 h-12 text-indigo-600 bg-violet-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default TotalProduction;
