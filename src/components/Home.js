import React from 'react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
      <h1 className="text-4xl font-bold text-purple-800 mb-6">!ברוכים הבאים</h1>
      <p className="text-xl text-gray-700 mb-8">
        אתר המשפחה שלנו - מקום לשתף, לחגוג ולתכנן יחד
      </p>
      <div className="bg-white p-12 rounded-full shadow-lg border-2 border-purple-200 text-9xl hover:shadow-2xl transition-shadow duration-300">
        👨‍👩‍👧‍👦
      </div>
    </div>
  );
};

export default Home; 