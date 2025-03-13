import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, UploadIcon, X, Trash2 } from 'lucide-react';
import axios from 'axios';

// כתובת השרת קבועה - שימוש בכתובת IP של הרשת המקומית במקום localhost
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-server.com' 
  : 'http://localhost:3001';

// נתוני המשפחה ההתחלתיים
const initialFamilyMembers = [
  { id: 1, name: 'אבא', emoji: '👨', photos: [] },
  { id: 2, name: 'אמא', emoji: '👩', photos: [] },
  { id: 3, name: 'אלירן', emoji: '👦', photos: [] },
  { id: 4, name: 'עילי', emoji: '👦', photos: [] },
  { id: 5, name: 'שיראן', emoji: '👦', photos: [] },
  { id: 6, name: 'ליעוז', emoji: '👦', photos: [] },
  { id: 7, name: 'משפחה', emoji: '👨‍👩‍👦‍👦', photos: [] }
];

const Photos = () => {
  const loadSavedData = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/family-members`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setFamilyMembers(data);
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // טעינת המידע בעת טעינת הקומפוננטה
  useEffect(() => {
    // הגדר את נתוני ברירת המחדל מיד כדי שיהיה מה להציג
    console.log('מגדיר נתוני ברירת מחדל:', initialFamilyMembers);
    setFamilyMembers(initialFamilyMembers);
    
    // נסה לטעון נתונים מהשרת
    loadSavedData()
      .then(data => {
        console.log('נתונים מהשרת:', data);
        if (data && data.length > 0) {
          setFamilyMembers(data);
        }
      })
      .catch(error => {
        console.error('שגיאה בטעינת נתונים מהשרת:', error);
        // במקרה של שגיאה, נשאר עם נתוני ברירת המחדל
      });
  }, []);

  const handleFileUpload = async (event) => {
    try {
      console.log('התחלת העלאת תמונה');
      console.log('אירוע:', event);
      
      if (!event.target.files || event.target.files.length === 0) {
        console.log('לא נבחרו קבצים');
        alert('אנא בחר תמונה');
        return;
      }

      if (selectedMembers.length === 0) {
        console.log('לא נבחר בן משפחה');
        alert('אנא בחר בן משפחה לפני העלאת תמונה');
        return;
      }

      const file = event.target.files[0];
      console.log('מעלה קובץ:', file.name);
      console.log('גודל הקובץ:', file.size, 'bytes');
      console.log('סוג הקובץ:', file.type);
      console.log('מזהה בן משפחה:', selectedMembers[0].id);

      // בדיקת גודל הקובץ
      if (file.size > 5 * 1024 * 1024) {
        alert('הקובץ גדול מדי. הגודל המקסימלי הוא 5MB');
        return;
      }

      // בדיקה שהקובץ הוא תמונה או שהמשתמש מאשר להמשיך
      let isImage = file.type.startsWith('image/') || file.type.includes('image');
      if (!isImage) {
        console.warn('סוג קובץ לא מזוהה כתמונה:', file.type);
        const confirmUpload = window.confirm('הקובץ שנבחר אינו מזוהה כתמונה. האם להמשיך בכל זאת?');
        if (!confirmUpload) {
          return;
        }
      }

      // יצירת FormData לשליחה לשרת
      const formData = new FormData();
      formData.append('file', file);
      formData.append('memberId', selectedMembers[0].id);

      console.log('שולח בקשה לשרת:', `${SERVER_URL}/upload-photo`);
      
      // הצגת הודעת טעינה
      alert('מעלה תמונה... אנא המתן');
      
      try {
        // שליחת הבקשה לשרת
        const response = await axios.post(`${SERVER_URL}/upload-photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('התקדמות העלאה:', percentCompleted + '%');
          }
        });

        console.log('תשובה מהשרת:', response.data);

        // עדכון ה-state עם התמונה החדשה
        const updatedMembers = familyMembers.map(member => {
          if (member.id === selectedMembers[0].id) {
            const photoWithFullUrl = {
              ...response.data,
              url: `${SERVER_URL}${response.data.url}`
            };
            console.log('URL מלא של התמונה:', photoWithFullUrl.url);
            return {
              ...member,
              photos: [...(member.photos || []), photoWithFullUrl]
            };
          }
          return member;
        });

        setFamilyMembers(updatedMembers);
        setSelectedMembers([updatedMembers.find(m => m.id === selectedMembers[0].id)]);
        
        // איפוס שדה הקלט
        if (event.target) {
          event.target.value = '';
        }
        
        console.log('העלאה הושלמה בהצלחה');
        alert('התמונה הועלתה בהצלחה!');
      } catch (error) {
        console.error('שגיאה בשליחת הבקשה לשרת:', error);
        alert('שגיאה בהעלאת התמונה: ' + (error.response?.data?.error || error.message));
      }
    } catch (error) {
      console.error('שגיאה בהעלאת התמונה:', error);
      console.error('פרטי השגיאה:', error.response?.data || error.message);
      alert('שגיאה בהעלאת התמונה: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeletePhoto = async (memberId, photoIndex) => {
    try {
      const response = await fetch(`${SERVER_URL}/delete-photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, photoIndex }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  };

  const handleMemberSelect = (member) => {
    console.log('נבחר בן משפחה:', member);
    console.log('התמונות של בן המשפחה:', member.photos || []);
    
    setSelectedMembers(prev => {
      // אם הבן משפחה כבר נבחר, נבטל את הבחירה
      if (prev.some(m => m.id === member.id)) {
        return [];
      }
      // אחרת, נבחר רק אותו
      return [member];
    });
  };

  const handleImageClick = (photo) => {
    setSelectedImage(photo);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  const handleDeleteImage = async (member, photoIndex) => {
    try {
      console.log('מתחיל תהליך מחיקה...');
      
      // שליחת בקשת מחיקה לשרת
      await axios.delete(`${SERVER_URL}/delete-photo`, {
        data: {
          memberId: member.id,
          photoIndex: photoIndex
        }
      });

      // עדכון ה-state
      const updatedMembers = familyMembers.map(m => {
        if (m.id === member.id) {
          const updatedPhotos = m.photos.filter((_, idx) => idx !== photoIndex);
          return { ...m, photos: updatedPhotos };
        }
        return m;
      });

      setFamilyMembers(updatedMembers);
      const updatedMember = updatedMembers.find(m => m.id === member.id);
      setSelectedMembers([updatedMember]);
      setSelectedImage(null);
      setShowDeleteConfirm(false);
      
      console.log('מחיקה הושלמה בהצלחה');
    } catch (error) {
      console.error('שגיאה במחיקת התמונה:', error);
      alert('שגיאה במחיקת התמונה. אנא נסה שוב.');
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-purple-50 min-h-screen">
      {/* תצוגת תמונה במסך מלא */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={closeFullscreen}
        >
          {/* כפתורי פעולה במסך מלא */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button 
              className="text-white hover:text-red-500 transition-colors p-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            >
              {React.createElement(Trash2, { size: 24, className: "sm:w-8 sm:h-8" })}
            </button>
            <button 
              className="text-white hover:text-gray-300 transition-colors p-2"
              onClick={closeFullscreen}
            >
              {React.createElement(X, { size: 24, className: "sm:w-8 sm:h-8" })}
            </button>
          </div>

          {/* דיאלוג אישור מחיקה */}
          {showDeleteConfirm && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-[90%] max-w-sm mx-auto text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">האם אתה בטוח שברצונך למחוק תמונה זו?</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">לא ניתן לבטל פעולה זו</p>
                <div className="flex justify-center gap-2 sm:gap-4">
                  <button
                    className="px-4 sm:px-6 py-2 bg-red-500 text-white text-sm sm:text-base rounded hover:bg-red-600 transition-colors"
                    onClick={() => {
                      const member = selectedMembers[0];
                      const photoIndex = member.photos.findIndex(p => p.url === selectedImage.url);
                      handleDeleteImage(member, photoIndex);
                    }}
                  >
                    מחק
                  </button>
                  <button
                    className="px-4 sm:px-6 py-2 bg-gray-200 text-sm sm:text-base rounded hover:bg-gray-300 transition-colors"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}

          <img
            src={selectedImage.url}
            alt={selectedImage.name}
            className="max-h-[85vh] max-w-[95vw] sm:max-h-[90vh] sm:max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-800 flex items-center justify-center sm:justify-start">
        {React.createElement(ImageIcon, { className: "mr-2 w-5 h-5 sm:w-6 sm:h-6" })} תמונות משפחתיות
      </h2>

      {/* בחירת בן משפחה */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-purple-800">בחר בן משפחה:</h3>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 bg-white p-3 rounded-lg shadow-sm">
          {familyMembers.length > 0 ? (
            familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className={`px-3 py-2 rounded-full flex items-center flex-shrink-0 ${
                  selectedMembers.some(m => m.id === member.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-purple-100'
                }`}
              >
                <span className="mr-2">{member.emoji}</span>
                {member.name}
                {member.photos && member.photos.length > 0 && (
                  <span className="ml-1 bg-purple-200 text-purple-800 text-xs px-1 rounded-full">
                    {member.photos.length}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="text-gray-500">טוען בני משפחה...</p>
          )}
        </div>
      </div>

      {/* כפתור העלאת תמונה */}
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => {
            console.log('לחיצה על כפתור העלאת תמונה');
            if (fileInputRef.current) {
              fileInputRef.current.click();
            } else {
              console.error('fileInputRef לא קיים');
              alert('שגיאה בפתיחת חלון בחירת קבצים. נסה שוב.');
            }
          }}
          disabled={selectedMembers.length === 0}
          className={`w-full md:w-auto px-4 py-3 rounded-lg flex items-center justify-center ${
            selectedMembers.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {React.createElement(UploadIcon, { className: "mr-2", size: 20 })}
          העלאת תמונה
        </button>
        {selectedMembers.length === 0 && (
          <p className="text-sm text-red-600 mt-1 text-center">אנא בחר בן משפחה לפני העלאת תמונה</p>
        )}
      </div>

      {/* הצגת התמונות של בן המשפחה הנבחר */}
      {selectedMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">
            התמונות של {selectedMembers[0].name}:
          </h3>
          
          {/* בדיקה אם יש תמונות */}
          {selectedMembers[0].photos && selectedMembers[0].photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedMembers[0].photos.map((photo, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative group cursor-pointer"
                  onClick={() => handleImageClick(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.name || `תמונה ${index + 1}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      console.error('שגיאה בטעינת תמונה:', photo.url);
                      e.target.src = 'https://via.placeholder.com/150?text=תמונה+לא+זמינה';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      className="p-2 bg-white rounded-full text-purple-600 hover:text-purple-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(photo);
                      }}
                    >
                      {React.createElement(ImageIcon, { size: 24 })}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">אין תמונות עדיין. העלה את התמונה הראשונה!</p>
          )}
        </div>
      )}

      {/* הצגת כל התמונות */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-purple-800">כל התמונות:</h3>
        
        {/* בדיקה אם יש תמונות לאחד מבני המשפחה */}
        {familyMembers.some(member => member.photos && member.photos.length > 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {familyMembers.flatMap(member => 
              (member.photos || []).map((photo, photoIndex) => (
                <div
                  key={`${member.id}-${photoIndex}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative group cursor-pointer"
                  onClick={() => {
                    setSelectedMembers([member]);
                    handleImageClick(photo);
                  }}
                >
                  <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-75 px-2 py-1 rounded-full text-sm flex items-center">
                    <span className="mr-1">{member.emoji}</span>
                    {member.name}
                  </div>
                  <img
                    src={photo.url}
                    alt={photo.name || `תמונה ${photoIndex + 1}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      console.error('שגיאה בטעינת תמונה:', photo.url);
                      e.target.src = 'https://via.placeholder.com/150?text=תמונה+לא+זמינה';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      className="p-2 bg-white rounded-full text-purple-600 hover:text-purple-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMembers([member]);
                        handleImageClick(photo);
                      }}
                    >
                      {React.createElement(ImageIcon, { size: 24 })}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="text-gray-600 col-span-full text-center py-8 bg-white rounded-lg shadow-sm">
            אין תמונות עדיין. העלה את התמונה הראשונה!
          </p>
        )}
      </div>
      
      {/* דיבאג אינפורמציה */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer">מידע דיבאג</summary>
          <pre className="mt-2 overflow-auto max-h-40">
            בני משפחה: {JSON.stringify(familyMembers, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default Photos; 