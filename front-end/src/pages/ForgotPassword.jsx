import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/api/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error sending email");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                    Send Reset Email
                </button>
                {message && <p className="mt-4 text-green-600">{message}</p>}
            </form>
        </div>
    );
};

export default ForgotPassword;
