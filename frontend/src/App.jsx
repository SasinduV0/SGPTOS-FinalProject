import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DefectDataProvider } from './context/DefectDataContext'; // Import the context provider
import Home from "./pages/Home"; // Home dashboard page
import DefectRate from "./pages/DefectRate"; // Import the DefectRate component
import EmpMng from "./pages/EmpMng"; // Import with correct filename

function App() {
  return (
    <DefectDataProvider> {/* Wrap everything with DefectDataProvider */}
      <Router>
        <Routes>
          {/* Default route loads Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Defect Rate page route */}
          <Route path="/defect-rate" element={<DefectRate />} />
          
          {/* Employee Management page route */}
          <Route path="/employee-management" element={<EmpMng />} />
        </Routes>
      </Router>
    </DefectDataProvider>
  );
}

export default App;