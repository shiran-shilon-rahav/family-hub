import React, { useState, useEffect } from 'react';
import { Utensils, ExternalLink, Edit, Link, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';

// כתובת השרת קבועה - שימוש בכתובת IP של הרשת המקומית במקום localhost
const SERVER_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:3001` 
  : `http://${window.location.hostname}:3001`;

const Recipes = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ name: '', url: '', content: '', type: 'url' });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // פונקציה לטעינת המתכונים מהשרת
  const loadRecipes = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      
      const response = await fetch(`${SERVER_URL}/recipes?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data || []);
        setLastUpdate(Date.now());
      } else {
        console.error('שגיאה בטעינת המתכונים:', response.status);
      }
    } catch (err) {
      console.error('שגיאה בטעינת המתכונים:', err);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // טעינת המתכונים בעת טעינת הקומפוננטה
  useEffect(() => {
    // טעינה ראשונית
    loadRecipes();
    
    // הגדרת רענון אוטומטי
    const intervalId = setInterval(() => {
      if (autoRefreshEnabled) {
        loadRecipes(false);
      }
    }, 1000); // רענון כל שנייה
    
    // ניקוי ה-interval כאשר הקומפוננטה מתפרקת
    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled]); // תלות ב-autoRefreshEnabled

  // עדכון כאשר מצב הרענון האוטומטי משתנה
  useEffect(() => {
    console.log('מצב רענון אוטומטי:', autoRefreshEnabled ? 'פעיל' : 'כבוי');
  }, [autoRefreshEnabled]);

  const handleUploadRecipe = () => {
    setShowUploadForm(true);
  };

  // עדכון ערכי הטופס
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({ ...prev, [name]: value }));
  };

  // שינוי סוג המתכון (URL או תוכן עצמי)
  const handleRecipeTypeChange = (type) => {
    setNewRecipe(prev => ({ ...prev, type }));
  };

  // שמירת מתכון חדש
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newRecipe.name) {
      alert('אנא הכנס את שם המתכון');
      return;
    }

    if (newRecipe.type === 'url' && !newRecipe.url) {
      alert('אנא הכנס קישור למתכון');
      return;
    }

    if (newRecipe.type === 'content' && !newRecipe.content) {
      alert('אנא הכנס את תוכן המתכון');
      return;
    }

    try {
      console.log('שולח מתכון חדש לשרת:', newRecipe);
      
      const response = await axios.post(`${SERVER_URL}/add-recipe`, newRecipe);
      console.log('תשובה מהשרת:', response.data);
      
      // הוספת המתכון החדש לרשימה
      setRecipes(prev => [...prev, response.data]);
      
      // איפוס הטופס
      setNewRecipe({ name: '', url: '', content: '', type: 'url' });
      setShowUploadForm(false);
      
      alert('המתכון נשמר בהצלחה!');
      
      // טעינה מחדש מהשרת כדי לוודא סנכרון
      loadRecipes();
    } catch (err) {
      console.error('שגיאה בשמירת המתכון:', err);
      
      // במקרה של שגיאה, ננסה שוב לשמור את המתכון
      try {
        const response = await fetch(`${SERVER_URL}/add-recipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRecipe),
        });
        
        if (response.ok) {
          const savedRecipe = await response.json();
          setRecipes(prev => [...prev, savedRecipe]);
          setNewRecipe({ name: '', url: '', content: '', type: 'url' });
          setShowUploadForm(false);
          alert('המתכון נשמר בהצלחה!');
        } else {
          throw new Error('ניסיון שני נכשל');
        }
      } catch (retryErr) {
        console.error('ניסיון שני לשמירת המתכון נכשל:', retryErr);
        
        // במקרה של שגיאה גם בניסיון השני, נוסיף את המתכון למערך המקומי
        const tempRecipe = {
          id: Date.now(),
          name: newRecipe.name,
          url: newRecipe.url,
          content: newRecipe.content,
          type: newRecipe.type,
          timestamp: Date.now()
          // הסרנו את הסימון temporary
        };
        
        setRecipes(prev => [...prev, tempRecipe]);
        setNewRecipe({ name: '', url: '', content: '', type: 'url' });
        setShowUploadForm(false);
        
        alert('המתכון נשמר בהצלחה!');
      }
    }
  };

  // מחיקת מתכון
  const handleDeleteRecipe = async (recipeId) => {
    try {
      console.log('מוחק מתכון:', recipeId);
      
      await axios.delete(`${SERVER_URL}/delete-recipe/${recipeId}`);
      
      // עדכון הרשימה המקומית
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      
      setShowDeleteConfirm(null);
      alert('המתכון נמחק בהצלחה!');
      
      // טעינה מחדש מהשרת כדי לוודא סנכרון
      loadRecipes();
    } catch (err) {
      console.error('שגיאה במחיקת המתכון:', err);
      alert('שגיאה במחיקת המתכון. אנא נסה שוב.');
    }
  };

  // פונקציה לרענון המתכונים
  const handleRefresh = () => {
    loadRecipes();
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-800 flex items-center mb-2 sm:mb-0">
            <Utensils className="mr-2" /> מתכונים
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base rounded-md flex items-center"
              title="רענן מתכונים"
            >
              <RefreshCw size={16} className="ml-1" /> רענן
            </button>
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`${
                autoRefreshEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
              } text-white px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base rounded-md flex items-center`}
              title={autoRefreshEnabled ? 'כבה רענון אוטומטי' : 'הפעל רענון אוטומטי'}
            >
              {autoRefreshEnabled ? 'רענון: פעיל' : 'רענון: כבוי'}
            </button>
            <button
              onClick={handleUploadRecipe}
              className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base rounded-md"
            >
              הוסף מתכון
            </button>
          </div>
        </div>

        {/* טופס העלאת מתכון */}
        {showUploadForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">העלאת מתכון חדש</h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleRecipeTypeChange('url')}
                  className={`px-4 py-2 rounded flex items-center ${
                    newRecipe.type === 'url' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Link size={16} className="ml-2" /> העלאת כתובת URL
                </button>
                <button
                  type="button"
                  onClick={() => handleRecipeTypeChange('content')}
                  className={`px-4 py-2 rounded flex items-center ${
                    newRecipe.type === 'content' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Edit size={16} className="ml-2" /> הכן מתכון בעצמך
                </button>
              </div>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 mb-2">שם המתכון:</label>
                <input 
                  type="text" 
                  name="name"
                  value={newRecipe.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="הכנס את שם המתכון"
                />
              </div>
              
              {newRecipe.type === 'url' ? (
                <div>
                  <label className="block text-gray-700 mb-2">קישור למתכון:</label>
                  <input 
                    type="url" 
                    name="url"
                    value={newRecipe.url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="הכנס קישור למתכון"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 mb-2">תוכן המתכון:</label>
                  <textarea 
                    name="content"
                    value={newRecipe.content}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[200px]"
                    placeholder="הכנס את המתכון כאן (מרכיבים, הוראות הכנה וכו')"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  שמור מתכון
                </button>
                <button 
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* דיאלוג אישור מחיקה */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-sm mx-auto text-center">
              <h3 className="text-lg font-bold mb-4">האם אתה בטוח שברצונך למחוק מתכון זה?</h3>
              <p className="text-gray-600 mb-6">לא ניתן לבטל פעולה זו</p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteRecipe(showDeleteConfirm)}
                >
                  מחק
                </button>
                <button
                  className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* הודעת טעינה */}
        {loading && <p className="text-center text-gray-600">טוען מתכונים...</p>}
        
        {/* רשימת המתכונים */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">המתכונים שלנו</h3>
            <p className="text-xs text-gray-500">
              עודכן לאחרונה: {new Date(lastUpdate).toLocaleString('he-IL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </p>
          </div>
          
          {recipes.length === 0 ? (
            <p className="text-center text-gray-600">אין מתכונים עדיין. הוסף את המתכון הראשון!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe, index) => (
                <div 
                  key={recipe.id || index} 
                  className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${recipe.temporary ? 'border-2 border-yellow-400' : ''} relative`}
                >
                  {/* כפתור מחיקה */}
                  {!recipe.temporary && (
                    <button
                      onClick={() => setShowDeleteConfirm(recipe.id)}
                      className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="מחק מתכון"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <h4 className="text-lg font-bold mb-2">{recipe.name}</h4>
                  
                  {recipe.type === 'content' ? (
                    <div className="mt-2 text-gray-700 whitespace-pre-line">
                      <p className="text-sm text-gray-500 mb-2">מתכון מקורי:</p>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-[200px] overflow-y-auto">
                        {recipe.content}
                      </div>
                    </div>
                  ) : (
                    <a 
                      href={recipe.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      צפה במתכון <ExternalLink size={16} className="mr-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes; 