import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
   const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({
        id: '',
        username: '',
        userID: '',
        role: ''
    });
    
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const roleColors = {
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-purple-100 text-purple-800',
        supervisor: 'bg-blue-100 text-blue-800',
        qc: 'bg-green-100 text-green-800',
        'live-dashboard': 'bg-yellow-100 text-yellow-800'
    };

     const handleBack = () => {
    navigate(-1); // This will go back one step in the navigation history
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('http://localhost:8000/api/user/profile', {
            method: 'GET',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to fetch profile');
        }

        const data = await response.json();
        setCurrentUser(data.user);
        setFormData(prev => ({
            ...prev,
            username: data.user.username
        }));
    } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ 
            type: 'error', 
            text: error.message || 'Failed to load profile' 
        });
    } finally {
        setLoading(false);
    }
};


    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
        const token = localStorage.getItem('token');
        const updateData = {
            username: formData.username
        };

        if (showPasswordFields) {
            updateData.currentPassword = formData.currentPassword;
            updateData.newPassword = formData.newPassword;
        }

        const response = await fetch('http://localhost:8000/api/user/profile', {  // Updated URL
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token  // Added token header
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (response.ok) {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setCurrentUser(data.user);
            resetForm();
        } else {
            setMessage({ type: 'error', text: data.msg || 'Failed to update profile' });
        }
    } catch (error) {
        console.error('Update error:', error);
        setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
        setUpdating(false);
    }
};

    const resetForm = () => {
        setFormData({
            username: currentUser.username,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordFields(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (

          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 ml-60 pt-16">
    <div className="max-w-6xl mx-auto">
        {/* Enhanced Back Button */}
        <button
            onClick={handleBack}
            className="group mb-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 hover:bg-white/60 rounded-lg backdrop-blur-sm"
        >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
                <h1 className="text-3xl font-bold text-white">Profile Management</h1>
                <p className="text-blue-100 mt-2">Manage your account information and security settings</p>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced User Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Profile Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60 hover:shadow-md transition-all duration-200">
                                <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Username</label>
                                <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {currentUser.username}
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </p>
                            </div>

                            <div className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60 hover:shadow-md transition-all duration-200">
                                <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">User ID</label>
                                <p className="text-lg font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                                    {currentUser.userID}
                                </p>
                            </div>

                            <div className="group p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60 hover:shadow-md transition-all duration-200">
                                <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Role</label>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${roleColors[currentUser.role]}`}>
                                    <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                                    {currentUser.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Update Form Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Update Profile</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                                    New Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white/60 backdrop-blur-sm placeholder-slate-400 text-slate-800"
                                    placeholder="Enter new username"
                                />
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="group flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                                >
                                    <svg className={`w-4 h-4 transition-transform ${showPasswordFields ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
                                </button>
                            </div>

                            {showPasswordFields && (
                                <div className="space-y-4 p-4 bg-slate-50/80 rounded-xl border-2 border-dashed border-slate-200 backdrop-blur-sm">
                                    <div className="space-y-2">
                                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            )}

                            {message.text && (
                                <div className={`p-4 rounded-xl border-l-4 ${
                                    message.type === 'error' 
                                        ? 'bg-red-50 border-red-500 text-red-800' 
                                        : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {message.type === 'error' ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span className="font-medium">{message.text}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

        
    );
};

export default UserProfile;