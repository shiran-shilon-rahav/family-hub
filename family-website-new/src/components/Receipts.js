import React from 'react';
import { Receipt } from 'lucide-react';

const Receipts = () => {
  return (
    <div className="p-6 bg-teal-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-teal-800 flex items-center">
        <Receipt className="mr-2" /> קבלות ומסמכים
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600">כאן יוצגו הקבלות והמסמכים</p>
        </div>
      </div>
    </div>
  );
};

export default Receipts; 