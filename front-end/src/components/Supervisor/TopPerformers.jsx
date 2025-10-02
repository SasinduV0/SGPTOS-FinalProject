import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:8001", { transports: ["websocket"] });
const DAILY_TARGET = 120;

const DailyEmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
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

    // Extract unique dates
    const uniqueDates = [
      ...new Set(
        employeesData.map((emp) =>
          new Date(emp.createdAt).toLocaleDateString()
        )
      ),
    ].sort((a, b) => new Date(b) - new Date(a)); // latest first

    setDates(uniqueDates);

    // Default select = latest
    if (!selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }

    setEmployees(employeesData);
  };

  const getEmployeesByDate = () => {
    if (!selectedDate) return [];
    return employees
      .filter(
        (emp) =>
          new Date(emp.createdAt).toLocaleDateString() === selectedDate
      )
      .map((emp, index) => ({
        id: emp._id || `EMP-${index}`,
        name: emp.name,
        line: emp.line,
        station: emp.station || Math.floor(Math.random() * 10) + 1,
        pcs: emp.pcs || 0,
        efficiency: (((emp.pcs || 0) / DAILY_TARGET) * 100).toFixed(0),
      }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  const todaysEmployees = getEmployeesByDate();

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Employees - {selectedDate}
        </h2>
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
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {todaysEmployees.length > 0 ? (
          todaysEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
            >
              <div>
                <div className="font-semibold text-gray-700">
                  {emp.name} - Line {emp.line}, Station {emp.station}
                </div>
                <div className="text-xs text-gray-400">{emp.pcs} pcs</div>
              </div>
              <div
                className={`font-semibold text-sm ${
                  emp.efficiency >= 85
                    ? "text-green-600"
                    : emp.efficiency >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {emp.efficiency}% Eff.
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm">
            No employees found for this date.
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyEmployeesList;
