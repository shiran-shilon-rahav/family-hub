import React from 'react';
import { Utensils } from 'lucide-react';

const Recipes = () => {
  return (
    <div className="p-6 bg-orange-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center">
        <Utensils className="mr-2" /> מתכונים משפחתיים
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600">כאן יוצגו המתכונים המשפחתיים</p>
        </div>
      </div>
    </div>
  );
};

export default Recipes; 