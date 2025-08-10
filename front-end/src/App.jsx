import React from 'react'
import Login from './pages/login'
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Manager from './pages/Manager/Manager';
import SupervisorDashboard from './pages/Supervisor/SupervisorDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import QualityControl from './pages/QC/QualityControl';
import LiveDashboard from './pages/LiveDashboard';
import Navbar from './components/Navbar';
import UserProfile from './pages/Profile';
import EmployeeManagement from './pages/Manager/EmployeeManagement';

function AppWrapper() {
  const location = useLocation();

  // Check if current path is NOT /live-dashboard
  const hideNavbarPaths = [
  "/live-dashboard",
  "/",
];

const showNavbar = !hideNavbarPaths.includes(location.pathname);


  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Manager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/em"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qc"
          element={
            <ProtectedRoute allowedRoles={['qc']}>
              <QualityControl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-dashboard"
          element={
            <ProtectedRoute allowedRoles={['live-dashboard']}>
              <LiveDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
