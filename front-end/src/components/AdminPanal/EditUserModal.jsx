import React, { useState } from 'react'
import { X, Eye, EyeOff, Lock, Check, AlertCircle, Shield } from 'lucide-react';
import axios from 'axios';

const EditUserModal = ({ isOpen, user, onClose, onUpdate }) => {

    const [editingUser, setEditingUser] = useState(user || {});
    const [activeTab, setActiveTab] = useState('Profile');
    
    // Password states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    React.useEffect(()=>{
        if (user){
            setEditingUser({...user});
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setEditingUser(prev => ({...prev, [field]: value}))
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({...prev, [field]: value}));
        
        // Clear errors when user starts typing
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({...prev, [field]: ''}));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
    };

    const validatePassword = () => {
        const errors = {};
        
        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        
        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (passwordData.currentPassword === passwordData.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordUpdate = async () => {
        if (!validatePassword()) return;

        setIsUpdatingPassword(true);
        try {
            const response = await axios.put(`http://localhost:8001/api/users/${editingUser._id}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            alert('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordErrors({});
        } catch (error) {
            console.error('Password update error:', error);
            if (error.response?.data?.message === 'Current password is incorrect') {
                setPasswordErrors({
                    currentPassword: 'Current password is incorrect'
                });
            } else {
                alert(error.response?.data?.message || 'Failed to update password');
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleUpdate = () => {
        onUpdate(editingUser);
        onClose();
    };

    const resetPasswordForm = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordErrors({});
    };

    if (!isOpen || !user) return null;

    return (
        <div className='fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50'> {/* FIXED: Added bg-black */}
            <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>

                {/*Modal Header*/}
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h2 className='text-xl font-semibold text-gray-900'>Edit User</h2>
                        <p className='text-sm text-gray-500'>User ID: {editingUser.userID}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors duration-200'>
                        <X size={24}/>
                    </button>
                </div>

                {/*Tabs*/}
                <div className='flex space-x-8 mb-6 border-b'>
                    <button
                        onClick={() => setActiveTab('Profile')}
                        className={`pb-2 text-sm font-medium transition-colors duration-200 ${
                            activeTab === 'Profile'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        Profile
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('Security');
                            resetPasswordForm();
                        }}
                        className={`pb-2 text-sm font-medium transition-colors duration-200 ${
                            activeTab === 'Security'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        Security
                    </button>
                </div>

                {/*Form Content*/}
                {activeTab === 'Profile' && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/*Personal Information*/}
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Personal Information</h3>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>First Name*</label>
                                    <input
                                        type='text'
                                        value={editingUser.firstname || ''}
                                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name*</label>
                                    <input
                                        type='text'
                                        value={editingUser.lastname || ''}
                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                                    <input
                                        type='text'
                                        value={editingUser.phoneNumber || ''}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address*</label>
                                    <input
                                        type='email'
                                        value={editingUser.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>
                            </div>
                        </div>

                        {/*Work Information*/}
                        <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>Work Information</h3>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>User ID*</label>
                                    <input
                                        type='text'
                                        value={editingUser.userID || ''}
                                        onChange={(e) => handleInputChange('userID', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Username*</label>
                                    <input
                                        type='text'
                                        value={editingUser.username || ''}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'/>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Department*</label>
                                    <select
                                        value={editingUser.department || ''}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'>
                                        <option value=''>Select Department</option>
                                        <option value='Cutting'>Cutting</option>
                                        <option value='Sewing'>Sewing</option>
                                        <option value='Quality Control'>Quality Control</option>
                                        <option value='Packing'>Packing</option>
                                        <option value='Finishing'>Finishing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Role*</label>
                                    <select
                                        value={editingUser.role || ''}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'>
                                        <option value=''>Select Role</option>
                                        <option value='admin'>Admin</option>
                                        <option value='manager'>Manager</option>
                                        <option value='supervisor'>Supervisor</option>
                                        <option value='qc'>Quality Control</option>
                                        <option value='live-dashboard'>Live Dashboard</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Security' && (
                    <div className='max-w-md mx-auto'>
                        <div className='text-center mb-6'>
                            <Lock className='mx-auto h-12 w-12 text-blue-500 mb-3' />
                            <h3 className='text-lg font-medium text-gray-900'>Change Password</h3>
                            <p className='text-sm text-gray-500 mt-1'>Update your account password</p>
                        </div>

                        <div className='space-y-4'>
                            {/* Current Password */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Current Password*
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                            passwordErrors.currentPassword 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center">
                                        <AlertCircle size={12} className="mr-1" />
                                        {passwordErrors.currentPassword}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    New Password*
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                            passwordErrors.newPassword 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center">
                                        <AlertCircle size={12} className="mr-1" />
                                        {passwordErrors.newPassword}
                                    </p>
                                )}
                                <div className="mt-1 text-xs text-gray-500">
                                    Password must be at least 6 characters long
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Confirm New Password*
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                            passwordErrors.confirmPassword 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                                            ? 'border-green-300 focus:ring-green-500'
                                            : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center">
                                        <AlertCircle size={12} className="mr-1" />
                                        {passwordErrors.confirmPassword}
                                    </p>
                                )}
                                {!passwordErrors.confirmPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                                    <p className="mt-1 text-xs text-green-600 flex items-center">
                                        <Check size={12} className="mr-1" />
                                        Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Password Update Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handlePasswordUpdate}
                                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || isUpdatingPassword}
                                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                                        passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword && !isUpdatingPassword
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                {activeTab === 'Profile' && (
                    <div className='flex justify-end space-x-4 mt-8 pt-4 border-t'>
                        <button
                            onClick={onClose}
                            className='px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200'>
                            Cancel
                        </button>

                        <button
                            onClick={handleUpdate}
                            className='px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200'>
                            Update User
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EditUserModal