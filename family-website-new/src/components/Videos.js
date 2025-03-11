import React, { useState, useRef, useEffect } from 'react';
import { Video, UploadIcon, X, Trash2 } from 'lucide-react';
import axios from 'axios';

// כתובת השרת קבועה - שימוש בכתובת IP של הרשת המקומית במקום localhost
const SERVER_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:3001` 
  : `http://${window.location.hostname}:3001`;

// נתוני המשפחה ההתחלתיים
const initialFamilyMembers = [
  { id: 1, name: 'אבא', emoji: '👨', videos: [] },
  { id: 2, name: 'אמא', emoji: '👩', videos: [] },
  { id: 3, name: 'אלירן', emoji: '👦', videos: [] },
  { id: 4, name: 'עילי', emoji: '👦', videos: [] },
  { id: 5, name: 'שיראן', emoji: '👦', videos: [] },
  { id: 6, name: 'ליעוז', emoji: '👦', videos: [] },
  { id: 7, name: 'משפחה', emoji: '👨‍👩‍👦‍👦', videos: [] }
];

const Videos = () => {
  const loadSavedData = async () => {
    try {
      // טוען את כל המידע מהשרת
      const response = await axios.get(`${SERVER_URL}/family-members-videos`);
      // מוסיף את כתובת השרת לכל URL של סרטון
      const dataWithFullUrls = response.data.map(member => ({
        ...member,
        videos: member.videos.map(video => ({
          ...video,
          url: `${SERVER_URL}${video.url}`
        }))
      }));
      return dataWithFullUrls;
    } catch (error) {
      console.error('שגיאה בטעינת הנתונים:', error);
      return initialFamilyMembers;
    }
  };

  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      console.log('התחלת העלאת סרטון');
      console.log('אירוע:', event);
      
      if (!event.target.files || event.target.files.length === 0) {
        console.log('לא נבחרו קבצים');
        alert('אנא בחר סרטון');
        return;
      }

      if (selectedMembers.length === 0) {
        console.log('לא נבחר בן משפחה');
        alert('אנא בחר בן משפחה לפני העלאת סרטון');
        return;
      }

      const file = event.target.files[0];
      console.log('מעלה קובץ:', file.name);
      console.log('גודל הקובץ:', file.size, 'bytes');
      console.log('סוג הקובץ:', file.type);
      console.log('מזהה בן משפחה:', selectedMembers[0].id);

      // בדיקת גודל הקובץ
      if (file.size > 50 * 1024 * 1024) {
        const confirmLargeFile = window.confirm('הקובץ גדול מ-50MB. העלאה עלולה להיכשל. האם להמשיך?');
        if (!confirmLargeFile) {
          return;
        }
      }

      // בדיקה שהקובץ הוא סרטון או שהמשתמש מאשר להמשיך
      let isVideo = file.type.startsWith('video/') || file.type.includes('video');
      if (!isVideo) {
        console.warn('סוג קובץ לא מזוהה כסרטון:', file.type);
        const confirmUpload = window.confirm('הקובץ שנבחר אינו מזוהה כסרטון. האם להמשיך בכל זאת?');
        if (!confirmUpload) {
          return;
        }
      }

      // יצירת FormData לשליחה לשרת
      const formData = new FormData();
      formData.append('video', file);
      formData.append('memberId', selectedMembers[0].id);

      console.log('שולח בקשה לשרת:', `${SERVER_URL}/upload-video`);
      
      // הצגת הודעת טעינה
      alert('מעלה סרטון... אנא המתן');
      
      try {
        // שליחת הבקשה לשרת
        const response = await fetch(`${SERVER_URL}/upload-video`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('שגיאת שרת:', response.status, response.statusText, errorText);
          throw new Error(`שגיאת שרת: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('תשובה מהשרת:', data);

        // עדכון ה-state עם הסרטון החדש
        const updatedMembers = familyMembers.map(member => {
          if (member.id === selectedMembers[0].id) {
            const videoWithFullUrl = {
              ...data,
              url: `${SERVER_URL}${data.url}`
            };
            console.log('URL מלא של הסרטון:', videoWithFullUrl.url);
            return {
              ...member,
              videos: [...(member.videos || []), videoWithFullUrl]
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
        alert('הסרטון הועלה בהצלחה!');
      } catch (error) {
        console.error('שגיאה בשליחת הבקשה לשרת:', error);
        alert('שגיאה בהעלאת הסרטון: ' + error.message);
      }
    } catch (error) {
      console.error('שגיאה בהעלאת הסרטון:', error);
      console.error('פרטי השגיאה:', error.response?.data || error.message);
      alert('שגיאה בהעלאת הסרטון: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteVideo = async (memberId, videoUrl) => {
    try {
      // הצגת אישור מחיקה
      const confirmDelete = window.confirm('האם אתה בטוח שברצונך למחוק סרטון זה?');
      if (!confirmDelete) {
        setShowDeleteConfirm(false);
        return;
      }

      console.log('מוחק סרטון:', memberId, videoUrl);
      
      const response = await fetch(`${SERVER_URL}/delete-video-by-url`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          memberId, 
          videoUrl: videoUrl.split(SERVER_URL).pop() // שליחת רק החלק היחסי של ה-URL
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('שגיאת שרת:', response.status, response.statusText, errorText);
        throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('תוצאת המחיקה מהשרת:', result);

      // עדכון ה-state
      const updatedMembers = familyMembers.map(m => {
        if (m.id === memberId) {
          const updatedVideos = m.videos.filter(v => {
            // השוואת URL יחסי (ללא כתובת השרת)
            const currentVideoUrl = v.url.includes(SERVER_URL) ? 
              v.url.split(SERVER_URL).pop() : v.url;
            const targetVideoUrl = videoUrl.includes(SERVER_URL) ? 
              videoUrl.split(SERVER_URL).pop() : videoUrl;
            return currentVideoUrl !== targetVideoUrl;
          });
          console.log('סרטונים לאחר מחיקה:', updatedVideos);
          return { ...m, videos: updatedVideos };
        }
        return m;
      });

      setFamilyMembers(updatedMembers);
      const updatedMember = updatedMembers.find(m => m.id === memberId);
      if (updatedMember) {
        setSelectedMembers([updatedMember]);
      }
      setSelectedVideo(null);
      setShowDeleteConfirm(false);
      
      console.log('מחיקה הושלמה בהצלחה');
      alert('הסרטון נמחק בהצלחה');

      // טעינה מחדש של הנתונים מהשרת
      loadSavedData()
        .then(data => {
          console.log('נתונים מהשרת לאחר מחיקה:', data);
          if (data && data.length > 0) {
            setFamilyMembers(data);
            // עדכון בן המשפחה הנבחר
            const refreshedMember = data.find(m => m.id === memberId);
            if (refreshedMember) {
              setSelectedMembers([refreshedMember]);
            }
          }
        })
        .catch(error => {
          console.error('שגיאה בטעינת נתונים מהשרת לאחר מחיקה:', error);
        });
    } catch (error) {
      console.error('שגיאה במחיקת הסרטון:', error);
      alert('שגיאה במחיקת הסרטון. אנא נסה שוב.');
    }
  };

  const handleMemberSelect = (member) => {
    console.log('נבחר בן משפחה:', member);
    console.log('הסרטונים של בן המשפחה:', member.videos || []);
    
    setSelectedMembers(prev => {
      // אם הבן משפחה כבר נבחר, נבטל את הבחירה
      if (prev.some(m => m.id === member.id)) {
        return [];
      }
      // אחרת, נבחר רק אותו
      return [member];
    });
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeFullscreen = () => {
    setSelectedVideo(null);
    setShowDeleteConfirm(false);
  };

  const openDeleteConfirm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('פתיחת חלון אישור מחיקה');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const member = selectedMembers[0];
    if (!member || !selectedVideo) {
      console.error('לא נבחר בן משפחה או סרטון');
      setShowDeleteConfirm(false);
      return;
    }
    
    console.log('מחפש סרטון למחיקה:', selectedVideo);
    console.log('סרטונים של בן המשפחה:', member.videos);
    
    // מחיקה לפי URL במקום אינדקס
    handleDeleteVideo(member.id, selectedVideo.url);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-red-50 min-h-screen">
      {/* תצוגת סרטון במסך מלא */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-2 sm:p-4"
          onClick={closeFullscreen}
        >
          {/* כפתור סגירה */}
          <div className="absolute top-4 right-4 z-10">
            <button 
              className="bg-gray-800 text-white p-3 rounded-full shadow-lg"
              onClick={closeFullscreen}
              style={{ cursor: 'pointer !important' }}
            >
              <X size={24} className="sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* הסרטון עצמו */}
          <video
            src={selectedVideo.url}
            controls
            autoPlay
            className="max-h-[75vh] max-w-[95vw] sm:max-h-[80vh] sm:max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          />

          {/* כפתור מחיקה בתחתית המסך */}
          <div className="mt-4">
            <button
              className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 px-8 rounded-lg shadow-lg flex items-center"
              onClick={openDeleteConfirm}
              style={{ cursor: 'pointer !important' }}
            >
              <Trash2 size={24} className="mr-2" />
              מחק סרטון
            </button>
          </div>

          {/* דיאלוג אישור מחיקה */}
          {showDeleteConfirm && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-sm mx-auto text-center">
                <h3 className="text-xl font-bold mb-4">האם אתה בטוח שברצונך למחוק סרטון זה?</h3>
                <p className="text-gray-600 mb-6">לא ניתן לבטל פעולה זו</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 shadow-md"
                    onClick={confirmDelete}
                    style={{ cursor: 'pointer !important' }}
                  >
                    מחק
                  </button>
                  <button
                    className="px-8 py-4 bg-gray-300 text-gray-800 text-lg font-bold rounded-lg hover:bg-gray-400 shadow-md"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ cursor: 'pointer !important' }}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* בחירת בן משפחה */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-red-800">בחר בן משפחה:</h3>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 bg-white p-3 rounded-lg shadow-sm">
          {familyMembers.length > 0 ? (
            familyMembers.map(member => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className={`px-3 py-2 rounded-full flex items-center flex-shrink-0 ${
                  selectedMembers.some(m => m.id === member.id)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-red-100'
                }`}
              >
                <span className="mr-2">{member.emoji}</span>
                {member.name}
                {member.videos && member.videos.length > 0 && (
                  <span className="ml-1 bg-red-200 text-red-800 text-xs px-1 rounded-full">
                    {member.videos.length}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="text-gray-500">טוען בני משפחה...</p>
          )}
        </div>
      </div>

      {/* כפתור העלאת סרטון */}
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="video/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => {
            console.log('לחיצה על כפתור העלאת סרטון');
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
          <UploadIcon className="mr-2" size={20} />
          העלאת סרטון
        </button>
        {selectedMembers.length === 0 && (
          <p className="text-sm text-red-600 mt-1 text-center">אנא בחר בן משפחה לפני העלאת סרטון</p>
        )}
      </div>

      {/* תצוגת הסרטונים של בן המשפחה הנבחר */}
      {selectedMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-800">
            הסרטונים של {selectedMembers[0].name}:
          </h3>
          
          {/* בדיקה אם יש סרטונים */}
          {selectedMembers[0].videos && selectedMembers[0].videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedMembers[0].videos.map((video, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative group"
                >
                  <video
                    src={video.url}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                    onError={(e) => {
                      console.error('שגיאה בטעינת סרטון:', video.url);
                      e.target.poster = 'https://via.placeholder.com/150?text=סרטון+לא+זמין';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(video);
                        }}
                      >
                        <Video size={24} />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVideo(selectedMembers[0].id, video.url);
                        }}
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">אין סרטונים עדיין. העלה את הסרטון הראשון!</p>
          )}
        </div>
      )}

      {/* תצוגת כל הסרטונים */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-800">כל הסרטונים:</h3>
        
        {/* בדיקה אם יש סרטונים לאחד מבני המשפחה */}
        {familyMembers.some(member => member.videos && member.videos.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {familyMembers.flatMap(member => 
              (member.videos || []).map((video, videoIndex) => (
                <div
                  key={`${member.id}-${videoIndex}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative group"
                >
                  <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-75 px-2 py-1 rounded-full text-sm flex items-center">
                    <span className="mr-1">{member.emoji}</span>
                    {member.name}
                  </div>
                  <video
                    src={video.url}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedMembers([member]);
                      handleVideoClick(video);
                    }}
                    onError={(e) => {
                      console.error('שגיאה בטעינת סרטון:', video.url);
                      e.target.poster = 'https://via.placeholder.com/150?text=סרטון+לא+זמין';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMembers([member]);
                          handleVideoClick(video);
                        }}
                      >
                        <Video size={24} />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full text-red-600 hover:text-red-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVideo(member.id, video.url);
                        }}
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="text-gray-600 col-span-full text-center py-8 bg-white rounded-lg shadow-sm">
            אין סרטונים עדיין. העלה את הסרטון הראשון!
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

export default Videos; 