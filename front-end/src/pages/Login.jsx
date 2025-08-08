import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaChartLine, FaCogs } from 'react-icons/fa';

const Login = () => {

    const [form, setForm] = useState({ userID: '', password: '', role:'' });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true); // start loading
  try {
    const res = await axios.post('http://localhost:8000/api/auth/login', form);
    const token = res.data.token;

    localStorage.setItem('token', token);

    const decoded = jwtDecode(token);

    // redirect by role
    switch (decoded.user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'manager':
        navigate('/manager');
        break;
      case 'supervisor':
        navigate('/supervisor');
        break;
      case 'qc':
        navigate('/qc');
        break;
      case 'live-dashboard':
        navigate('/live-dashboard');
        break;
      default:
        alert('Unknown role');
    }
  } catch (err) {
    alert('Login failed');
    console.error(err);
  } finally {
    setLoading(false); // stop loading
  }
};

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 sm:p-2 absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900">
      
      <div className="absolute top-20 left-20 w-16 h-24 bg-blue-400 bg-opacity-20 rounded-t-full blur-sm transform rotate-12"></div>
        <div className="absolute top-32 right-32 w-20 h-16 bg-indigo-400 bg-opacity-25 rounded-lg blur-sm transform -rotate-45"></div>
        <div className="absolute bottom-40 left-40 w-24 h-20 bg-slate-400 bg-opacity-20 rounded-full blur-md transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-18 h-32 bg-blue-300 bg-opacity-30 rounded-b-full blur-sm transform -rotate-12"></div>
        
      <div className="flex w-full max-w-5xl bg-white shadow-3xl rounded-3xl overflow-hidden">


        {/* Left Side - Enhanced Brand & Feature Showcase */}
        <div className="w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 px-14 flex flex-col justify-center text-white">
          <div className="flex flex-col space-y-12">
            <h2 className="text-4xl font-extrabold flex px-1  leading-tight">
              Smart Garment Production Tracking & Optimizing System
            </h2>
            <p className="text-blue-200 text-xl leading-relaxed">
              Empower your production line with real-time insights and data-driven decisions.
            </p>
          </div>
          <ul className="space-y-6 mt-10">
            <li className="flex items-center space-x-4">
              <FaTachometerAlt className="text-2xl text-blue-300" />
              <span className="font-medium text-lg">Live production status monitoring</span>
            </li>
            <li className="flex items-center space-x-4">
              <FaChartLine className="text-2xl text-blue-300" />
              <span className="font-medium text-lg">Efficiency and quality metric tracking</span>
            </li>
            <li className="flex items-center space-x-4">
              <FaCogs className="text-2xl text-blue-300" />
              <span className="font-medium text-lg">Smart analytics for workflow optimization</span>
            </li>
          </ul>
        </div>

        {/* Right Side - Sleek Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-lg text-gray-500">
              Log in to manage your garment operations.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="userID">
                User ID
              </label>
              <input
                name="userID"
                type="text"
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your user ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter Your Password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="role">
                Select Your Role
              </label>
              <select
                name="role"
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="" disabled>Choose your role...</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="qc">Quality Control</option>
                <option value="live-dashboard">Live Dashboard</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;