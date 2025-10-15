import React from "react";

const LineTargetSum = () => {
  const lineTargets = {
    1: 30,
    2: 30,
    3: 30,
    4: 30,
    5: 30,
    6: 30,
    7: 30,
    8: 30,
  };

  // Calculate total sum
  const total = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="flex gap-1 mt-5 ml-20">
        <h2 className="text-xs font-semibold text-gray-300">Total Line Target</h2>
        <p className="text-xs text-white font-bold ">{total} pcs</p>
        <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>

    </div>
  );
};

export default LineTargetSum;
