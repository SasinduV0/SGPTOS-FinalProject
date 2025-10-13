import React, { useEffect, useState } from "react";
import axios from "axios";

const TotalProduction = () => {
  const [totalProduction, setTotalProduction] = useState(0);

  // This effect fetches the total production count from the new backend endpoint.
  useEffect(() => {
    const fetchTotalProduction = async () => {
      try {
        // The /api/scan-count endpoint directly provides the total count of produced items.
        const response = await axios.get("http://localhost:8001/api/scan-count");
        if (response.data && typeof response.data.count === 'number') {
          setTotalProduction(response.data.count);
        }
      } catch (error) {
        console.error("❌ Error fetching total production:", error);
        // In case of an error, the component will retain the last known value.
      }
    };

    // Fetch the data as soon as the component mounts.
    fetchTotalProduction();

    // Set up a polling interval to refresh the data every 5 seconds for live updates.
    const intervalId = setInterval(fetchTotalProduction, 5000);

    // Clean up the interval when the component unmounts to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, []); // The empty dependency array ensures this runs only on mount and unmount.

  // The original JSX structure and styling are preserved as requested.
  return (
    <div className="">
      <div className="flex mt-5 ml-3 gap-1">
        <h3 className="text-xs font-semibold text-gray-300">Total Production</h3>
        <p className="text-xs font-bold text-white">{totalProduction} Pcs</p>
        <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
      </div>
    </div>
  );
};

export default TotalProduction;

