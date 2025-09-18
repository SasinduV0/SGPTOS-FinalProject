import React, { useState, useEffect } from 'react';

function Greetings() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className='flex mt-5 ml-4 gap-2 '>
        <p className="text-gray-300 font-semibold text-sm">Time</p>
        <h1 className="text-white font-bold text-sm">{formatTime(dateTime)}</h1>
        <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
        <p className="text-gray-300 font-semibold text-sm">Date</p>
        <p className="text-sm font-bold text-white">{formatDate(dateTime)}</p>
    </div>
  );
}

export default Greetings;
