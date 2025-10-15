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
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState(false);

  // Get today's date in the same format as used in the app
  const getTodaysDate = () => {
    return new Date().toLocaleDateString();
  };

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
      const todaysDate = getTodaysDate();
      // Set today's date as default if it exists in the data, otherwise use the most recent date
      const defaultDate = uniqueDates.includes(todaysDate) ? todaysDate : uniqueDates[0];
      setSelectedDate(defaultDate);
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
        station: emp.station || `Station ${(index % 10) + 1}`, // Generate station if not available
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

  // Always show all possible lines (1-8) in the dropdown
  const uniqueLines = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

  // Apply line filter
  if (selectedLine !== "All") {
    todaysEmployees = todaysEmployees.filter((emp) => String(emp.line) === String(selectedLine));
  }

  // Sort by line number
  todaysEmployees.sort((a, b) => Number(a.line) - Number(b.line));

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full max-w-3xl h-126">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Date: {selectedDate}
        </div>
        <div className="flex gap-2">
          {/* Date filter */}
          <div className="relative">
            <select
              className="border border-gray-300 rounded-md px-2 py-1 pr-8 text-sm appearance-none bg-white cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDateDropdownOpen(false), 150)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='${isDateDropdownOpen ? 'M6 8l4-4 4 4' : 'M6 8l4 4 4-4'}'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1rem'
              }}
            >
              {dates.map((date, idx) => (
                <option key={idx} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-h-85 overflow-y-auto mt-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="p-2 border-b">Worker ID</th>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Station</th>
              <th className="p-2 border-b">
                <div className="flex items-center gap-2">
                  <span>Line</span>
                  <div className="relative">
                    <select
                      className="border border-gray-300 rounded-md px-1 py-0.5 pr-5 text-xs bg-white appearance-none cursor-pointer"
                      value={selectedLine}
                      onChange={(e) => setSelectedLine(e.target.value)}
                      onClick={() => setIsLineDropdownOpen(!isLineDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsLineDropdownOpen(false), 150)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='${isLineDropdownOpen ? 'M6 8l4-4 4 4' : 'M6 8l4 4 4-4'}'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.25rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '0.75rem'
                      }}
                    >
                      {uniqueLines.map((line, idx) => (
                        <option key={idx} value={line}>
                          {line}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </th>
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
                  <td className="p-2 border-b text-gray-600">{emp.station}</td>
                  <td className="p-2 border-b font-medium">Line {emp.line}</td>
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
