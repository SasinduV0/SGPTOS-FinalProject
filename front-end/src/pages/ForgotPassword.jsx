// components/ForgotPassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [userID, setUserID] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/auth/forgotpassword', { userID });
            setMessage(res.data.msg);
        } catch (err) {
            setMessage('Failed to send reset email. Please check your user ID.');
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center">Forgot Your Password?</h2>
                <p className="text-center text-gray-600">
                    Enter your User ID to receive a password reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="userID">
                            User ID
                        </label>
                        <input
                            type="text"
                            id="userID"
                            value={userID}
                            onChange={(e) => setUserID(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Send Reset Link
                    </button>
                </form>
                {message && <p className="text-center text-sm mt-4 text-green-600">{message}</p>}
                <div className="text-center text-sm mt-4">
                    <Link to="/" className="text-blue-600 hover:text-blue-500">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;