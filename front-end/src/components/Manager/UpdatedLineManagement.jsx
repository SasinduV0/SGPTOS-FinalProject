import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdatedLineManagement = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch specific employee data
  const fetchEmployee = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/line-management"); // get all
      const emp = res.data.find(e => e.employeeNo === "EMP009"); // filter for EMP009
      setEmployee(emp || null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();

    // Optional: refresh every 5 seconds
    const interval = setInterval(fetchEmployee, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!employee) return <p>Employee EMP009 not found.</p>;

  return (
    <div className="bg-white p-4 rounded shadow max-w-md">
      <h2 className="text-lg font-semibold mb-3">Employee EMP009 Details</h2>
      <div className="flex justify-between border-b py-2">
        <span className="font-medium">Unit:</span>
        <span>{employee.unit}</span>
      </div>
      <div className="flex justify-between border-b py-2">
        <span className="font-medium">Line No:</span>
        <span>{employee.lineNo}</span>
      </div>
    </div>
  );
};

export default UpdatedLineManagement;
