import React, { useState, useEffect } from "react";

function RemainingTimeBottom() {
  const [remaining, setRemaining] = useState("");
  const [shiftName, setShiftName] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      updateRemainingTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateRemainingTime = (currentTime) => {
    const hour = currentTime.getHours();

    // Define shift timings
    const dayStart = 8;
    const dayEnd = 18;
    const nightStart = 19;
    const nightEnd = 6;

    let startTime = new Date(currentTime);
    let endTime = new Date(currentTime);

    // Determine which shift we are in
    if (hour >= dayStart && hour < dayEnd) {
      setShiftName("Day Shift");
      startTime.setHours(dayStart, 0, 0, 0);
      endTime.setHours(dayEnd, 0, 0, 0);
    } else if (hour >= nightStart || hour < nightEnd) {
      setShiftName("Night Shift");
      startTime.setHours(nightStart, 0, 0, 0);
      endTime.setHours(nightEnd, 0, 0, 0);

      // Adjust for next day when crossing midnight
      if (hour < nightEnd) {
        startTime.setDate(startTime.getDate() - 1);
      } else {
        endTime.setDate(endTime.getDate() + 1);
      }
    } else {
      setShiftName("No Active Shift");
      setRemaining("Shift hasn't started yet");
      return;
    }

    // Calculate remaining time
    let diff = endTime - currentTime;
    if (diff <= 0) {
      setRemaining("Shift is over");
      return;
    }

    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setRemaining(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`
    );
  };

  return (
    <div className="flex mt-5 ml-4 gap-2">
    <p className="text-gray-300 font-semibold text-xs">Shift</p>
      <p className="text-white font-bold text-xs">{shiftName}</p>
      <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
      <p className=" text-gray-300 font-semibold text-xs">Remaining Time</p>
      <p className=" text-white font-bold text-xs"> {remaining}</p>
      <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
}

export default RemainingTimeBottom;
