import React, { useState } from 'react';
import { Home, Calendar, Users, Image, Video, Palette, Award, Utensils, Receipt } from 'lucide-react';
import './App.css';

// Import components
import Family from './components/Family';
import Events from './components/Events';
import Photos from './components/Photos';
import Videos from './components/Videos';
import Creations from './components/Creations';
import Certificates from './components/Certificates';
import Recipes from './components/Recipes';
import Receipts from './components/Receipts';

const FamilyWebsite = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch(activeSection) {
      case 'family':
        return <Family />;
      case 'events':
        return <Events />;
      case 'photos':
        return <Photos />;
      case 'videos':
        return <Videos />;
      case 'creations':
        return <Creations />;
      case 'certificates':
        return <Certificates />;
      case 'recipes':
        return <Recipes />;
      case 'receipts':
        return <Receipts />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
            <h1 className="text-4xl font-bold text-purple-800 mb-6">!ברוכים הבאים</h1>
            <p className="text-xl text-gray-700 mb-8">
              אתר המשפחה שלנו - מקום לשתף, לחגוג ולתכנן יחד
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button 
                onClick={() => setActiveSection('family')} 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center text-lg hover:bg-blue-600 transition-colors"
              >
                <Users className="mr-2" /> משפחה
              </button>
              <button 
                onClick={() => setActiveSection('events')} 
                className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center text-lg hover:bg-green-600 transition-colors"
              >
                <Calendar className="mr-2" /> אירועים
              </button>
              <button 
                onClick={() => setActiveSection('photos')} 
                className="bg-purple-500 text-white px-6 py-3 rounded-lg flex items-center text-lg hover:bg-purple-600 transition-colors"
              >
                <Image className="mr-2" /> תמונות
              </button>
              <button 
                onClick={() => setActiveSection('videos')} 
                className="bg-red-500 text-white px-6 py-3 rounded-lg flex items-center text-lg hover:bg-red-600 transition-colors"
              >
                <Video className="mr-2" /> סרטונים
              </button>
            </div>
            <div className="bg-white p-12 rounded-full shadow-lg border-2 border-purple-200 text-9xl hover:shadow-2xl transition-shadow duration-300">
              👨‍👩‍👧‍👦
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 font-sans" dir="rtl">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <nav className="flex flex-wrap justify-center gap-3 order-2 md:order-1">
            <button 
              onClick={() => setActiveSection('home')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Home className="ml-2" /> בית
            </button>
            <button 
              onClick={() => setActiveSection('family')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Users className="ml-2" /> משפחה
            </button>
            <button 
              onClick={() => setActiveSection('events')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Calendar className="ml-2" /> אירועים
            </button>
            <button 
              onClick={() => setActiveSection('photos')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Image className="ml-2" /> תמונות
            </button>
            <button 
              onClick={() => setActiveSection('videos')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Video className="ml-2" /> סרטונים
            </button>
            <button 
              onClick={() => setActiveSection('creations')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Palette className="ml-2" /> יצירות
            </button>
            <button 
              onClick={() => setActiveSection('certificates')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Award className="ml-2" /> תעודות
            </button>
            <button 
              onClick={() => setActiveSection('recipes')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Utensils className="ml-2" /> מתכונים
            </button>
            <button 
              onClick={() => setActiveSection('receipts')} 
              className="transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md bg-purple-500"
            >
              <Receipt className="ml-2" /> קבלות
            </button>
          </nav>
          <h1 className="text-4xl font-bold mb-6 md:mb-0 tracking-wide order-1 md:order-2">
            <span className="text-yellow-300">ה</span>משפחה 
            <span className="text-yellow-300"> ש</span>לנו
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
          {renderSection()}
        </div>
      </main>
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center mt-8">
        <p>© {new Date().getFullYear()} המשפחה שלנו - כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};

export default FamilyWebsite; 