import React from 'react';
import { Calendar, Plus } from 'lucide-react';

const CustomerAppointments = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">Schedule and manage service appointments</p>
        </div>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Calendar className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments</h3>
          <p className="text-gray-600">You don't have any scheduled appointments</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Appointments:</strong> Schedule maintenance, inspections, or repairs. You'll receive confirmation and reminders for each appointment.
        </p>
      </div>
    </div>
  );
};

export default CustomerAppointments;
