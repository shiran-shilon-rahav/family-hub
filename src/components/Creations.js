import React from 'react';
import { Palette } from 'lucide-react';

const Creations = () => {
  return (
    <div className="p-6 bg-yellow-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-800 flex items-center">
        <Palette className="mr-2" /> יצירות משפחתיות
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600">כאן יוצגו היצירות המשפחתיות</p>
        </div>
      </div>
    </div>
  );
};

export default Creations; 