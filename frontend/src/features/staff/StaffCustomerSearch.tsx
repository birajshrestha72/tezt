import React, { useState } from 'react';
import { Search, Mail, Phone, MapPin } from 'lucide-react';

const StaffCustomerSearch = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Customer Search</h1>
        <p className="text-gray-600 mt-2">Find and interact with customers</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customer by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>

      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Search className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results</h3>
          <p className="text-gray-600">Start typing to search for customers</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Customer Search:</strong> Use this tool to quickly locate customer information while managing sales and service requests.
        </p>
      </div>
    </div>
  );
};

export default StaffCustomerSearch;
