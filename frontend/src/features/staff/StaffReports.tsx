import React from 'react';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';

const StaffReports = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Staff Reports</h1>
          <p className="text-gray-600 mt-2">Your personal performance and sales analytics</p>
        </div>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Monthly Sales</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">—</div>
          <p className="text-sm text-gray-600 mt-2">Total sales this month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Average Deal Value</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">—</div>
          <p className="text-sm text-gray-600 mt-2">Per transaction average</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Report Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                  No sales data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Staff Reports:</strong> View your personal sales performance, trends, and generate monthly reports for management review.
        </p>
      </div>
    </div>
  );
};

export default StaffReports;
