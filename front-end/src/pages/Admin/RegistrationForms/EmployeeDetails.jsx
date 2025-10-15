import React, { useState } from 'react';
import { User, Mail, Phone, Building, IdCard, Shield } from 'lucide-react'; // Import icons

function EmployeeDetails({formData, setFormData}) {
  return (
    <div className="w-full py-2">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
          <p className="text-gray-500">Enter the employee's basic details</p>
        </div>

        {/*Input field*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/*First name*/}

          <div className="relative">
            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={e => setFormData({ ...formData, firstname: e.target.value})}  
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter first name"
              />
            </div>
          </div>

          {/*Last name*/}

          <div className="relative">

            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={e => setFormData({ ...formData, lastname: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/*Email*/}

          <div className="relative">

            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/*Phone number*/}

          <div className="relative">

            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work Information Section */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Work Information</h2>
          <p className="text-gray-500">Assign department and employee details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/*Username*/}
          <div className="relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/*Role*/}
          <div className="relative">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              User Role
            </label>

            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
              >
                <option value="" disabled>Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="qc">Quality Control</option>
              </select>
            </div>
          </div>

          {/*Departments*/}

          <div className="relative">

            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>

            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="department"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
              >
                <option value="" disabled>Select Department</option>
                <option value="Sawing">Sawing</option>
                <option value="Quality Control">Quality Control</option>
              </select>
            </div>
          </div>

          {/*Employee ID*/}

          <div className="relative">
            <label htmlFor="userID" className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="userID"
                value={formData.userID}
                onChange={e => setFormData({ ...formData, userID: e.target.value})}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="EX: E96c"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;