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
import EmployeeEfficiency from './pages/Manager/EmployeeEfficiency';


import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppWrapper() {
  const location = useLocation();

  // Check if current path is NOT /live-dashboard
  const hideNavbarPaths = [
  "/live-dashboard",
  "/",

   "/forgot-password",      // hide on forgot password page
    /^\/reset-password\/.+$/ // hide on reset password page (regex for dynamic token)
];

const showNavbar = !hideNavbarPaths.includes(location.pathname);


  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />

         <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          path="/manager/ee"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <EmployeeEfficiency />
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
          path="/admin/*"
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
            // <ProtectedRoute allowedRoles={['live-dashboard']}>
            //   <LiveDashboard />
            // </ProtectedRoute>
            <LiveDashboard/>
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
