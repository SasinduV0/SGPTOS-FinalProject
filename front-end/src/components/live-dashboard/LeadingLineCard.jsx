import React from "react";
import { leadingLineData } from "../../pages/Data/LiveDashboardData";
import { FaUser } from "react-icons/fa";

const LeadingLineCard = () => {
  return (
    <div className="p-4">
      {leadingLineData.map((line, index) => (
        <div
          key={index}
          className="text-white"
        >
          <h2 className="text-lg font-bold text-center">Leading Line</h2>
          <p className="text-center">{line.lineName} : {line.target}</p>

          <div className="mt-3 space-y-2 p-2">
            {line.employees.map((emp, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <FaUser />
                  <span>{emp.name}</span>
                </div>
                <span>{emp.pcs} Pcs</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadingLineCard;
