import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({ id: '', username: '', userID: '', role: '' });
    const [formData, setFormData] = useState({ username: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    // Dark-themed role colors with smaller text
    const roleColors = {
        admin: 'bg-red-900/50 text-red-300 border border-red-700/50',
        manager: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
        supervisor: 'bg-sky-900/50 text-sky-300 border border-sky-700/50',
        qc: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
        'live-dashboard': 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
    };
    
    const handleBack = () => navigate(-1);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const response = await fetch('http://localhost:8000/api/user/profile', {
                    headers: { 'x-auth-token': token }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'Failed to fetch profile');
                }

                const data = await response.json();
                setCurrentUser(data.user);
                setFormData(prev => ({ ...prev, username: data.user.username }));
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: error.message || 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const updateData = { username: formData.username };
            if (showPasswordFields) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await fetch('http://localhost:8000/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
                setCurrentUser(data.user);
                resetForm(data.user.username);
            } else {
                setMessage({ type: 'error', text: data.msg || 'Update failed.' });
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setUpdating(false);
        }
    };

    const resetForm = (newUsername = currentUser.username) => {
        setFormData({
            username: newUsername,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordFields(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-300 py-6 px-4 ml-60 pt-30 font-sans">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={handleBack}
                    className="group mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 transition-all duration-200 hover:bg-slate-700/50 rounded-md"
                >
                    <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                </button>

                <div className="bg-slate-800/60 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-700/50 overflow-hidden">
                    <div className="bg-slate-900/70 px-6 py-4 border-b border-slate-700">
                        <h1 className="text-xl font-bold text-slate-100">User Profile</h1>
                        <p className="text-xs text-slate-400 mt-1">Manage account details and security settings.</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* User Info Section */}
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Profile Information</h2>
                                <div className="p-3 rounded-md bg-slate-700/40 border border-slate-700">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                                    <p className="text-base font-semibold text-slate-100">{currentUser.username}</p>
                                </div>
                                <div className="p-3 rounded-md bg-slate-700/40 border border-slate-700">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">User ID</label>
                                    <p className="text-sm font-mono text-slate-300">{currentUser.userID}</p>
                                </div>
                                <div className="p-3 rounded-md bg-slate-700/40 border border-slate-700">
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Role</label>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[currentUser.role]}`}>
                                        {currentUser.role}
                                    </span>
                                </div>
                            </div>

                            {/* Update Form Section */}
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Update Details</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="username" className="block text-xs font-medium text-slate-400 mb-1">New Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full text-sm px-3 py-2 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all duration-200 bg-slate-700/50 placeholder-slate-500 text-slate-200"
                                            placeholder="Enter new username"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                                        className="text-xs text-sky-400 hover:text-sky-300 font-medium transition"
                                    >
                                        {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                                    </button>

                                    {showPasswordFields && (
                                        <div className="space-y-3 pt-2">
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full text-sm px-3 py-2 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition bg-slate-700/50 placeholder-slate-400"
                                                placeholder="Current Password"
                                            />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full text-sm px-3 py-2 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition bg-slate-700/50 placeholder-slate-400"
                                                placeholder="New Password"
                                            />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full text-sm px-3 py-2 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition bg-slate-700/50 placeholder-slate-400"
                                                placeholder="Confirm New Password"
                                            />
                                        </div>
                                    )}

                                    {message.text && (
                                        <div className={`p-2.5 rounded-md text-xs font-medium border ${
                                            message.type === 'error' 
                                                ? 'bg-red-900/50 border-red-700/60 text-red-300' 
                                                : 'bg-emerald-900/50 border-emerald-700/60 text-emerald-300'
                                        }`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => resetForm()}
                                            className="px-4 py-2 text-xs font-bold border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            {updating ? 'Updating...' : 'Save Changes'}
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