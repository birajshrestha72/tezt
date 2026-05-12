import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';

const CustomerProfile = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">Customer Name</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">customer@example.com</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">+1 (555) 123-4567</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">123 Main Street, City, State 12345</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
