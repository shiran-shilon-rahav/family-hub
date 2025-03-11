import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Image, Video, Palette, Award, Utensils, Receipt, LogOut } from 'lucide-react';
import './App.css';

// Import components
import Login from './components/Login';
import Family from './components/Family';
import Events from './components/Events';
import Photos from './components/Photos';
import Videos from './components/Videos';
import Creations from './components/Creations';
import Certificates from './components/Certificates';
import Recipes from './components/Recipes';
import Receipts from './components/Receipts';
import EditEvent from './components/EditEvent';

const HomePage = () => (
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

const AppContent = () => {
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('familyWebsiteAuthenticated');
    window.location.reload();
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveSection('home');
    } else if (path.startsWith('/edit-event/')) {
      setActiveSection('events');
    } else {
      const section = path.slice(1);
      if (section) setActiveSection(section);
    }
  }, [location]);

  const handleNavigation = (section) => {
    setActiveSection(section);
    navigate(section === 'home' ? '/' : `/${section}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 font-sans" dir="rtl">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex flex-row-reverse flex-col md:flex-row-reverse justify-between items-center">
          <h1 className="text-4xl font-bold mb-6 md:mb-0 tracking-wide">
            <span className="text-yellow-300">ה</span>משפחה 
            <span className="text-yellow-300"> ש</span>לנו
          </h1>
          <nav className="flex flex-wrap justify-center gap-3">
            <button onClick={() => handleNavigation('home')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'home' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Home className="ml-2" /> בית
            </button>
            <button onClick={() => handleNavigation('family')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'family' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Users className="ml-2" /> משפחה
            </button>
            <button onClick={() => handleNavigation('events')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'events' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Calendar className="ml-2" /> אירועים
            </button>
            <button onClick={() => handleNavigation('photos')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'photos' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Image className="ml-2" /> תמונות
            </button>
            <button onClick={() => handleNavigation('videos')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'videos' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Video className="ml-2" /> סרטונים
            </button>
            <button onClick={() => handleNavigation('creations')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'creations' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Palette className="ml-2" /> יצירות
            </button>
            <button onClick={() => handleNavigation('certificates')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'certificates' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Award className="ml-2" /> תעודות
            </button>
            <button onClick={() => handleNavigation('recipes')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'recipes' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Utensils className="ml-2" /> מתכונים
            </button>
            <button onClick={() => handleNavigation('receipts')} 
              className={`transition-all duration-300 hover:bg-yellow-300 hover:text-purple-800 px-4 py-2 rounded-full flex items-center shadow-md ${activeSection === 'receipts' ? 'bg-yellow-300 text-purple-800' : 'bg-purple-500'}`}>
              <Receipt className="ml-2" /> קבלות
            </button>
            <button onClick={handleLogout} 
              className="transition-all duration-300 hover:bg-red-400 hover:text-white px-4 py-2 rounded-full flex items-center shadow-md bg-red-500 text-white">
              <LogOut className="ml-2" /> התנתק
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
          <Routes>
            <Route path="/edit-event/:eventId" element={<EditEvent />} />
            <Route path="/events" element={<Events />} />
            <Route path="/family" element={<Family />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/creations" element={<Creations />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const FamilyWebsite = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem('familyWebsiteAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default FamilyWebsite;
