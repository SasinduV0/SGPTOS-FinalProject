import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { TrendingUp } from "lucide-react"; // 📈 Efficiency icon

const socket = io("http://localhost:8001", { transports: ["websocket"] });

const lineTargets = {
  1: 1000,
  2: 800,
  3: 900,
  4: 1100,
  5: 950,
  6: 1050,
  7: 700,
  8: 850,
};

const EfficiencyRate = () => {
  const [efficiency, setEfficiency] = useState(0);

  const calculateEfficiency = (employees) => {
    const totalProduction = employees.reduce((sum, emp) => sum + (emp.pcs || 0), 0);
    const totalTarget = Object.values(lineTargets).reduce((sum, t) => sum + t, 0);
    const rate = totalTarget > 0 ? ((totalProduction / totalTarget) * 100).toFixed(2) : 0;
    setEfficiency(rate);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await axios.get("http://localhost:8001/api/employees");
      calculateEfficiency(data);
    };
    fetchEmployees();

    socket.on("leadingLineUpdate", calculateEfficiency);
    return () => socket.off("leadingLineUpdate", calculateEfficiency);
  }, []);

  return (
    <div className="flex mt-5 ml-4 gap-1">
        <h3 className="text-gray-300 font-semibold text-xs">Overall Efficiency</h3>
        <p className="text-xs font-bold text-white">{efficiency}%</p>
        <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
};

export default EfficiencyRate;
