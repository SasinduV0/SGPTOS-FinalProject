import React from "react";

function NavBar() {
  return (
    <nav className="bg-blue-600 h-12 flex justify-center gap-10">
      <button className="bg-green text-blue-600 px-4 h-10 rounded hover:bg-gray-200">
        Home
      </button>
      <button className="bg-white text-blue-600 px-4 h-10 rounded hover:bg-gray-200">
        About
      </button>
      <button className="bg-white text-blue-600 px-4 h-10 rounded hover:bg-gray-200">
        Contact
      </button>
    </nav>
  );
}

export default NavBar;
