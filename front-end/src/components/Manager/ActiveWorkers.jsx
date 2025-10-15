import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Users } from "lucide-react"; // 👥 workers icon

const socket = io("http://localhost:8001", { transports: ["websocket"] });

const ActiveWorkers = () => {
  const [activeWorkers, setActiveWorkers] = useState(0);

  const calculateWorkers = (employees) => {
    setActiveWorkers(employees.length);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await axios.get("http://localhost:8001/api/employees");
      calculateWorkers(data);
    };
    fetchEmployees();

    socket.on("leadingLineUpdate", calculateWorkers);
    return () => socket.off("leadingLineUpdate", calculateWorkers);
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-82">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Active Workers</h3>
          <p className="text-2xl font-bold text-blue-600">{activeWorkers}</p>
        </div>

        {/* Right side (icon) */}
        <Users className="w-12 h-12 text-blue-600 bg-blue-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default ActiveWorkers;
