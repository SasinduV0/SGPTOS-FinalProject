import React, { Children } from 'react';
import { Plus } from 'lucide-react';


const Header = ({ title, icon, children }) => (
  <div className="flex items-center gap-3">
    {icon && (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        {icon}
      </div>
    )}
    <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    {children}
  </div>
);

export default Header;