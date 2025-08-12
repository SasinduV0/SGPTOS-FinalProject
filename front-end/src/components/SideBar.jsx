import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const SideBar = ({ title, links }) => {
  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white shadow-lg flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold p-6 border-b border-gray-700">
          {title}
        </div>
        <nav className="flex flex-col p-4 space-y-4">
           {links.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 hover:bg-red-600 p-2 rounded w-full">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
