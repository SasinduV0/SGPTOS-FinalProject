import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";import { RxDividerVertical } from "react-icons/rx";

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
    <div className="">
      <div className="flex mt-5 ml-3 gap-2">
          <h3 className="text-sm font-semibold text-gray-300">Total Production</h3>
          <p className="text-sm font-bold text-white">{totalProduction} Pcs</p>
           <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
     
      </div>
     
    </div>
  );
};

export default TotalProduction;
