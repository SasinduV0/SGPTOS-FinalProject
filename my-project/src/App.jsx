import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./components/Home";
import WAssignment from "./components/WAssignment";
import LineProd from "./components/LineProd";


const App = () => {
  const [activePage, setActivePage] = useState("Home");

  const renderActivePage = () => {
    switch (activePage) {
      case "Home": return <Home />;
      case "Worker Assignment": return <WAssignment />;
      case "Line Productivity": return <LineProd />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={activePage} setActive={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto">{renderActivePage()}</main>
      </div>
    </div>
  );
};

export default App;
