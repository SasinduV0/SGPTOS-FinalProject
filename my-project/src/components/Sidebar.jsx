import React, { useState } from "react";
import { Home, Users, BarChart3, LayoutDashboard, Settings } from "lucide-react";

const Sidebar = () => {
  const [active, setActive] = useState("Worker Assignment");

  const navItems = [
    { name: "Home", icon: Home },
    { name: "Worker Assignment", icon: Users },
    { name: "Line Productivity", icon: BarChart3 },
    { name: "Live Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col justify-between">
      {/* Top logo/name */}
      <div className="mt-6 text-center">
        <h1 className="text-xl font-bold border-b border-gray-600 inline-block pb-1">
          zigzag
        </h1>
      </div>

      {/* Navigation */}
      <nav className="mt-10 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => setActive(item.name)}
                  className={`w-full flex items-center gap-3 text-left px-6 py-3 text-sm font-medium rounded-lg transition cursor-pointer relative
                    ${
                      active === item.name
                        ? "text-cyan-300 border border-cyan-400 bg-gray-800 shadow-lg shadow-cyan-500/30"
                        : "hover:bg-gray-700"
                    }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom settings */}
      <div className="p-6">
        <button className="flex items-center gap-2 hover:text-gray-400 text-sm font-medium">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

