import React from 'react'
import Login from './pages/login'
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Manager from './pages/Manager/Manager';
import HomePage from './pages/Supervisor/HomePage';
import { dashboardData } from './pages/Data/dashboardData';
import AdminDashboard from './pages/Admin/AdminDashboard';
import QualityControl from './pages/QC/QualityControl';
import LiveDashboard from './pages/LiveDashboard';
import Navbar from './components/Navbar';
import UserProfile from './pages/Profile';
import EmployeeManagement from './pages/Manager/EmployeeManagement';
import EmployeeEfficiency from './pages/Manager/EmployeeEfficiency';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AssignmentPage from './pages/Supervisor/AssignmentPage';
// import SupervisorAssignmentWrapper from './pages/Supervisor/SupervisorAssignmentWrapper';
import ProductivityPage from './pages/Supervisor/ProductivityPage';

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
          path="/manager/employee-management"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/production"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Production/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/report-analytics"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ReportAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Supervisor */}

        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <HomePage dashboardData={dashboardData} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/worker-assignment"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/lineProd"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <ProductivityPage dashboardData={dashboardData} />
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
