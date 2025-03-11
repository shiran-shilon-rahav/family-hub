import React, { useState } from 'react';
import { Lock, Key, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // רשימת המילים המורשות לכניסה
  const allowedWords = [
    'שיראן', 'אלירן', 'עילי', 'ליעוז', 'שחר', 'אנושקה',
    'shahar', 'shiran', 'eliran', 'lioz', 'ilay', 'annushka'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // בדיקה אם הסיסמה מכילה אחת מהמילים המורשות
    const isPasswordValid = allowedWords.some(word => 
      password.toLowerCase().includes(word.toLowerCase())
    );
    
    if (isPasswordValid) {
      // שמירת מצב הכניסה ב-localStorage כדי שהמשתמש לא יצטרך להתחבר שוב
      localStorage.setItem('familyWebsiteAuthenticated', 'true');
      onLogin();
    } else {
      setError('סיסמה שגויה. אנא נסה שוב.');
      setTimeout(() => setError(''), 3000); // מחיקת הודעת השגיאה אחרי 3 שניות
    }
  };

  // החלפת מצב הצגת הסיסמה
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-200 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Lock size={40} className="text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-purple-800">המשפחה שלנו</h1>
          <p className="text-gray-600 mt-2">אנא הזן סיסמה כדי להיכנס לאתר המשפחתי</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">סיסמה:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                placeholder="הזן את שמך"
                required
              />
              <Key className="absolute left-10 top-3 text-gray-400" size={20} />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors shadow-md"
          >
            כניסה
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>רמז: הזן את שמך</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 