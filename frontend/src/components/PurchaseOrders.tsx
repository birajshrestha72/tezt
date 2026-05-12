import React, { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';

const PurchaseOrdersView = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">Manage supplier purchase orders and procurement</p>
        </div>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2">
          <Package className="w-4 h-4" />
          New Purchase Order
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by PO number, supplier, or part..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Purchase Orders</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first purchase order</p>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Purchase Orders:</strong> Track all supplier orders, delivery dates, and inventory replenishment. 
          This module integrates with your vendor management and inventory systems.
        </p>
      </div>
    </div>
  );
};

export default PurchaseOrdersView;
