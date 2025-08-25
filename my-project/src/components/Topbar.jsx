import React, { useState } from "react";
import { Bell, User } from "lucide-react";

const Topbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notifications = [
    { id: 1, message: "Worker Mark requested break - Line 2", time: "2 mins ago", unread: true, priority: "normal" },
    { id: 2, message: "Quality check passed for Batch #247", time: "15 mins ago", unread: true, priority: "low" },
    { id: 3, message: "Machine calibration needed - Station 3", time: "45 mins ago", unread: false, priority: "high" },
    { id: 4, message: "Shift handover notes updated", time: "1 hour ago", unread: false, priority: "normal" },
  ];

  return (
    <div className="bg-gray-200 h-12 flex items-center justify-between px-4 border-b border-gray-300">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Shift:</span> Morning (06:00-14:00)
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="text-sm text-gray-700">Line Supervisor</div>
        </div>

        <div className="bg-green-600 text-white px-2 py-1 text-xs font-mono rounded">
          ON-DUTY
        </div>
      </div>
    </div>
  );
};

export default Topbar;



