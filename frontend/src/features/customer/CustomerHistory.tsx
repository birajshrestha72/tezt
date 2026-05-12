import React from 'react';
import { ShoppingCart, Calendar } from 'lucide-react';

const CustomerHistory = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">My Order History</h1>
        <p className="text-gray-600 mt-2">View past service orders and transactions</p>
      </div>

      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">You haven't placed any service orders yet</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Order History:</strong> All your service orders will appear here. You can track status, view details, and manage follow-up services.
        </p>
      </div>
    </div>
  );
};

export default CustomerHistory;
