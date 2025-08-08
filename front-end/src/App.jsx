import React from 'react'
import Login from './pages/login'
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Manager from './pages/Manager';
import SupervisorDashboard from './pages/SupervisorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QualityControl from './pages/QualityControl';
import LiveDashboard from './pages/LiveDashboard';
import Navbar from './components/Navbar';


function App() {
  return (
    <Router>
      <Navbar/>
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
      </Routes>
    </Router>
  )
}

export default App