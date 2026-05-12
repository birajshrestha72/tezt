import React, { useState } from 'react';
import { ShoppingCart, DollarSign, User } from 'lucide-react';

const StaffSales = () => {
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    items: '1'
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">New Sale</h1>
        <p className="text-gray-600 mt-2">Record a new customer sale or transaction</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={formData.customer}
              onChange={(e) => setFormData({...formData, customer: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Number of Items
            </label>
            <input
              type="number"
              placeholder="1"
              value={formData.items}
              onChange={(e) => setFormData({...formData, items: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Sale Amount
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="submit" className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
            Record Sale
          </button>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>New Sale:</strong> Use this form to quickly log sales transactions. Sales data is aggregated into your dashboard and performance metrics.
        </p>
      </div>
    </div>
  );
};

export default StaffSales;
