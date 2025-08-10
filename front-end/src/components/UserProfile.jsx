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

          <div className="max-w-4xl mx-auto p-6 mt-10">
            {/* Add Back Button */}
            <button
                onClick={handleBack}
                className="mb-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
            >
                <span>← Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Info Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Username</label>
                            <p className="text-lg font-semibold text-gray-900">{currentUser.username}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">User ID</label>
                            <p className="text-lg font-semibold text-gray-900">{currentUser.userID}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Role</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${roleColors[currentUser.role]}`}>
                                {currentUser.role}
                            </span>
                        </div>
                    </div>

                    {/* Update Form Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Profile</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    New Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {showPasswordFields ? '- Hide Password Fields' : '+ Change Password'}
                                </button>
                            </div>

                            {showPasswordFields && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {message.text && (
                                <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Profile'}
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