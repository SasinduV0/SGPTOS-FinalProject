// components/ForgotPassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState(''); // Correctly use 'email' in state
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send the email to the backend
            const res = await axios.post('http://localhost:8000/api/auth/forgotpassword', { email });
            setMessage(res.data.msg);
        } catch (err) {
            // Handle specific error messages from the backend
            if (err.response && err.response.data.msg) {
                setMessage(err.response.data.msg);
            } else {
                setMessage('Failed to send reset email. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900">Forgot Your Password?</h2>
                <p className="text-center text-gray-600">
                    Enter your email address to receive a password reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                {message && <p className={`text-center text-sm mt-4 ${message.includes("sent") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
                <div className="text-center text-sm mt-4">
                    <Link to="/" className="text-blue-600 hover:text-blue-500">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;