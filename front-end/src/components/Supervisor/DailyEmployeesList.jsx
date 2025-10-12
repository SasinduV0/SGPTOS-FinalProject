import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:8001", { transports: ["websocket"] });
const DAILY_TARGET = 120;

const DailyEmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLine, setSelectedLine] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/employees");
        processData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      processData(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  const processData = (employeesData) => {
    if (!employeesData.length) return;

    const uniqueDates = [
      ...new Set(
        employeesData.map((emp) =>
          new Date(emp.createdAt).toLocaleDateString()
        )
      ),
    ].sort((a, b) => new Date(b) - new Date(a));

    setDates(uniqueDates);

    if (!selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }

    setEmployees(employeesData);
  };

  const getEmployeesByDate = () => {
    if (!selectedDate) return [];
    const filteredEmployees = employees
      .filter(
        (emp) =>
          new Date(emp.createdAt).toLocaleDateString() === selectedDate
      )
      .map((emp, index) => ({
        id: emp._id || `EMP-${index}`,
        workerId: emp.workerId || `SW-${(index + 1).toString().padStart(3, "0")}`,
        name: emp.name,
        line: emp.line,
        pcs: emp.pcs || 0, // Added pcs data
        efficiency: (((emp.pcs || 0) / DAILY_TARGET) * 100).toFixed(0),
      }));
    
    console.log("Employees by date:", filteredEmployees.map(emp => ({ name: emp.name, line: emp.line, lineType: typeof emp.line })));
    return filteredEmployees;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  let todaysEmployees = getEmployeesByDate();

  // Collect unique lines for dropdown
  const uniqueLines = ["All", ...new Set(todaysEmployees.map((emp) => String(emp.line)))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return Number(a) - Number(b);
  });

  // Apply line filter
  if (selectedLine !== "All") {
    todaysEmployees = todaysEmployees.filter((emp) => String(emp.line) === String(selectedLine));
  }

  // Sort by line number
  todaysEmployees.sort((a, b) => Number(a.line) - Number(b.line));

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Individual Worker Performance ({selectedDate})
        </h2>
        <div className="flex gap-2">
          {/* Date filter */}
          <select
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {dates.map((date, idx) => (
              <option key={idx} value={date}>
                {date}
              </option>
            ))}
          </select>

          {/* Line filter */}
          <select
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            {uniqueLines.map((line, idx) => (
              <option key={idx} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="p-2 border-b">Worker ID</th>
              <th className="p-2 border-b">Worker</th>
              <th className="p-2 border-b">Line</th>
              <th className="p-2 border-b">Pieces</th>
              <th className="p-2 border-b">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {todaysEmployees.length > 0 ? (
              todaysEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50 text-sm text-gray-700"
                >
                  <td className="p-2 border-b text-blue-600">{emp.workerId}</td>
                  <td className="p-2 border-b">{emp.name}</td>
                  <td className="p-2 border-b">{emp.line}</td>
                  <td className="p-2 border-b font-medium text-gray-800">{emp.pcs}</td>
                  <td
                    className={`p-2 border-b font-semibold ${
                      emp.efficiency >= 85
                        ? "text-green-600"
                        : emp.efficiency >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {emp.efficiency}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyEmployeesList;
