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
    <div className='flex justify-between items-center px-8'>
      <div>
        <h1 className="text-gray-800 text-3xl font-bold tracking-wide w-[130px]">{formatTime(dateTime)}</h1>
        <p className="text-gray-800 text-sm flex items-center justify-center">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
}

export default Greetings;
