import React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import WAssignment from "./components/WAssignment";

function App() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="p-6 bg-gray-100 flex-1">
          {/* WAssignment*/}
          < WAssignment />
        </div>
      </div>
    </div>
  );
}

export default App;
