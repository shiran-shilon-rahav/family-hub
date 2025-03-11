import React from 'react';
import { Award } from 'lucide-react';

const Certificates = () => {
  return (
    <div className="p-6 bg-indigo-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center">
        <Award className="mr-2" /> תעודות והצלחות
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600">כאן יוצגו התעודות וההצלחות</p>
        </div>
      </div>
    </div>
  );
};

export default Certificates; 