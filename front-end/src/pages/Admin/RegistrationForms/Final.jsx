import React from 'react';
import { CheckCircle, User, Mail, ArrowRight } from 'lucide-react';

function Final({ formData }) {
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
      <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
            <User className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Employee Name</p>
              <p className="font-medium text-gray-800">
                {formData?.firstname} {formData?.lastname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm">
            <Mail className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-800">{formData?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button className="px-6 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2">
          Back
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Final;