import React from "react";

const LineTargetSum = () => {
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

  // Calculate total sum
  const total = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="flex gap-2 mt-5 ml-5">
        <h2 className="text-sm font-semibold text-gray-300">Total Line Target</h2>
        <p className="text-sm text-white font-bold ">{total} pcs</p>
        <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>

    </div>
  );
};

export default LineTargetSum;
