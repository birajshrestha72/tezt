import React from 'react';
import { Home, ShoppingCart, Calendar, AlertCircle, Zap } from 'lucide-react';

const CustomerHome = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome to Wrench Mob</h1>
        <p className="text-gray-600 mt-2">Your vehicle service and maintenance hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <ShoppingCart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">My Orders</h3>
          <p className="text-sm text-gray-600 mt-2">View your service history</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-600 mt-2">Schedule maintenance</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">Vehicle Health</h3>
          <p className="text-sm text-gray-600 mt-2">Check diagnostics</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Quick Info</h3>
            <p className="text-sm text-gray-700 mt-2">
              Welcome to your customer portal. Here you can manage your vehicle service orders, schedule appointments, and monitor your vehicle health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
