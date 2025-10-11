import React from 'react';
import { CheckCircle, User, Mail, IdCard, Shield } from 'lucide-react';
import axios from 'axios';

function Final({ formData, handleBack, setFormData }) {

  const handleSubmit = async () => {
    console.log('Sending data:', formData);
    try {
      const response = await axios.post('http://localhost:8001/api/auth/signup', formData);

      alert(response.data.message);

      // Reset form after success
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        userID: '',
        username: '',
        department: '',
        role: '',
        password: '',
        confirmPassword: '',
      });

      handleBack(); // Go back to step 1
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">

      {/* Success Message */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Registration Complete!</h2>
        <p className="text-lg text-gray-600">
          The employee account has been successfully created
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Summary</h3>

        {/* Full Name */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
          <User className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-gray-800">
              {formData?.firstname} {formData?.lastname}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
          <Mail className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-medium text-gray-800">{formData?.email}</p>
          </div>
        </div>

        {/* User ID */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
          <IdCard className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-medium text-gray-800">{formData?.userID}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
          <Shield className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium text-gray-800">{formData?.role}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between max-w-3xl mx-auto">
        {/* Complete Registration */}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
        >
          Complete Registration
        </button>

        {/* Cancel Registration */}
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
        >
          Cancel Registration
        </button>
      </div>
    </div>
  );
}

export default Final;
