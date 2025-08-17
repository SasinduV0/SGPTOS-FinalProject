import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';

const Topbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const notifications = [
    { id: 1, message: "New worker assigned to Line 1", time: "2 mins ago", unread: true },
    { id: 2, message: "Operation A completed successfully", time: "15 mins ago", unread: true },
    { id: 3, message: "Line productivity report ready", time: "1 hour ago", unread: false },
    { id: 4, message: "Worker Name 3 clocked out", time: "2 hours ago", unread: false },
  ];

  return (
    <div className="bg-gray-200 h-12 flex items-center justify-end px-4 border-b border-gray-300">
      
      {/* Right Section - Notification, User, and Code */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="relative text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <Bell size={18} />
            {/* Red dot indicator for new notifications */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Notification Dropdown */}
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
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 text-center">
                <button className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="text-sm text-gray-700">
            Manager name
          </div>
        </div>

        {/* User Code */}
        <div className="bg-black text-white px-2 py-1 text-xs font-mono">
          -SGPTOS-
        </div>
      </div>
    </div>
  );
};

export default Topbar;


