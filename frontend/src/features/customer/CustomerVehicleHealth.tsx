import React from 'react';
import { Zap, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const CustomerVehicleHealth = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Vehicle Health</h1>
        <p className="text-gray-600 mt-2">AI-powered diagnostics and maintenance predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Overall Health</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">Good</div>
          <p className="text-sm text-gray-600 mt-2">No critical issues detected</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Last Scan</h3>
          </div>
          <div className="text-lg font-bold text-gray-900">Never</div>
          <p className="text-sm text-gray-600 mt-2">Run a diagnostic scan to get insights</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Diagnostics Performed</h3>
        <p className="text-gray-600 mb-6">Schedule a vehicle scan to get AI-powered health insights and maintenance recommendations</p>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
          Run Diagnostic Scan
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Vehicle Health:</strong> Our AI system analyzes your vehicle's performance data to predict maintenance needs and prevent costly repairs.
        </p>
      </div>
    </div>
  );
};

export default CustomerVehicleHealth;
