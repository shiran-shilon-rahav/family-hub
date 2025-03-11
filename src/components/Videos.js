import React from 'react';
import { Video } from 'lucide-react';

const Videos = () => {
  return (
    <div className="p-6 bg-red-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-red-800 flex items-center">
        <Video className="mr-2" /> סרטונים משפחתיים
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600">כאן יוצגו הסרטונים המשפחתיים</p>
        </div>
      </div>
    </div>
  );
};

export default Videos; 