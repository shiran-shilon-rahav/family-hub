import React, { useState, useEffect, useRef } from 'react';
import { Palette, UploadIcon, X, Trash2, Package, Blocks, PaintBucket, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import axios from 'axios';

// כתובת השרת קבועה
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-server.com' 
  : 'http://localhost:3001';

// קטגוריות היצירות
const CREATION_CATEGORIES = [
  { id: '3d', name: 'יצירות תלת-מימד', icon: <Package className="w-6 h-6" /> },
  { id: 'lego', name: 'יצירות לגו', icon: <Blocks className="w-6 h-6" /> },
  { id: 'drawings', name: 'ציורים', icon: <PaintBucket className="w-6 h-6" /> },
  { id: 'technoda', name: 'יצירות טכנודע', icon: <Lightbulb className="w-6 h-6" /> }
];

const Creations = () => {
  const [selectedCategory, setSelectedCategory] = useState('3d');
  const [creations, setCreations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [creationToDelete, setCreationToDelete] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && selectedCategory) {
      intervalId = setInterval(() => {
        loadCreations(selectedCategory);
      }, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedCategory, autoRefresh]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const loadCreations = async (category) => {
    try {
      const response = await fetch(`${SERVER_URL}/creations/${category}`);
      if (response.ok) {
        const data = await response.json();
        setCreations(data || []);
      }
    } catch (error) {
      console.error('שגיאה בטעינת היצירות:', error);
      setCreations([]);
    }
  };

  const handleFileUpload = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        alert('אנא בחר תמונה');
        return;
      }

      if (!selectedCategory) {
        alert('אנא בחר קטגוריה לפני העלאת תמונה');
        return;
      }

      const file = event.target.files[0];
      
      // בדיקת גודל הקובץ
      if (file.size > 50 * 1024 * 1024) {
        const confirmLargeFile = window.confirm('הקובץ גדול מ-50MB. העלאה עלולה להיכשל. האם להמשיך?');
        if (!confirmLargeFile) {
          return;
        }
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', selectedCategory);

      alert('מעלה תמונה... אנא המתן');
      
      const response = await fetch(`${SERVER_URL}/upload-creation`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`שגיאת שרת: ${response.status}`);
      }

      const data = await response.json();
      setCreations(prev => [...prev, data]);
      
      if (event.target) {
        event.target.value = '';
      }

      alert('התמונה הועלתה בהצלחה!');
    } catch (error) {
      console.error('שגיאה בהעלאת התמונה:', error);
      alert('שגיאה בהעלאת התמונה: ' + error.message);
    }
  };

  const handleDeleteCreation = async (creationId) => {
    try {
      const response = await fetch(`${SERVER_URL}/creations/${creationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCreations(prev => prev.filter(creation => creation.id !== creationId));
        setSelectedImage(null);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('שגיאה במחיקת היצירה:', error);
      alert('שגיאה במחיקת היצירה');
    }
  };

  // פונקציה לפתיחת תמונה במסך מלא
  const openImageViewer = (creation) => {
    setViewingImage(creation);
  };

  // פונקציה לסגירת תצוגת התמונה
  const closeImageViewer = () => {
    setViewingImage(null);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-yellow-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-800 flex items-center">
            <Palette className="mr-2" /> יצירות משפחתיות
          </h2>
          <button
            onClick={toggleAutoRefresh}
            className={`px-4 py-2 rounded-lg ${
              autoRefresh 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            רענון אוטומטי {autoRefresh ? 'פעיל' : 'כבוי'}
          </button>
        </div>

        {/* בחירת קטגוריה */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {CREATION_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-yellow-500 text-white shadow-lg transform -translate-y-1'
                  : 'bg-white hover:bg-yellow-100'
              }`}
            >
              {category.icon}
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* כפתור העלאה */}
        {selectedCategory && (
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UploadIcon className="w-5 h-5" />
              העלאת יצירה חדשה
            </button>
          </div>
        )}

        {/* תצוגת היצירות */}
        {selectedCategory && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creations.length > 0 ? (
              creations.map(creation => (
                <div
                  key={creation.id}
                  className="relative group aspect-square bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={`${SERVER_URL}${creation.url}`}
                    alt={`יצירה ${creation.id}`}
                    className="w-full h-full object-cover"
                    onClick={() => openImageViewer(creation)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => {
                        setCreationToDelete(creation);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-8 bg-white rounded-lg">
                <p className="text-gray-600">אין יצירות בקטגוריה זו עדיין. העלה את היצירה הראשונה!</p>
              </div>
            )}
          </div>
        )}

        {/* תצוגת תמונה במסך מלא */}
        {viewingImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeImageViewer}
          >
            <div className="relative max-w-4xl w-full">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={closeImageViewer}
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={`${SERVER_URL}${viewingImage.url}`}
                alt={`יצירה ${viewingImage.id}`}
                className="w-full h-auto rounded-lg"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* דיאלוג אישור מחיקה */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
              <h3 className="text-lg font-bold mb-4">האם אתה בטוח שברצונך למחוק יצירה זו?</h3>
              <p className="text-gray-600 mb-6">לא ניתן לבטל פעולה זו</p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => {
                    handleDeleteCreation(creationToDelete.id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  מחק
                </button>
                <button
                  className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCreationToDelete(null);
                  }}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creations; 