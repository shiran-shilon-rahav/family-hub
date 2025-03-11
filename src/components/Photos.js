import React, { useState, useRef } from 'react';
import { Image, Upload } from 'lucide-react';

// נתוני המשפחה
const familyMembers = [
  { id: 1, name: 'אבא', emoji: '👨', photos: [] },
  { id: 2, name: 'אמא', emoji: '👩', photos: [] },
  { id: 3, name: 'בן 1', emoji: '👦', photos: [] },
  { id: 4, name: 'בן 2', emoji: '👦', photos: [] },
  { id: 5, name: 'בן 3', emoji: '👦', photos: [] },
  { id: 6, name: 'בן 4', emoji: '👦', photos: [] }
];

const Photos = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // יצירת URLs זמניים לתמונות שנבחרו
    const newPhotos = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));

    // עדכון התמונות של בן המשפחה שנבחר
    const updatedMembers = familyMembers.map(member => {
      if (member.id === selectedMember.id) {
        return {
          ...member,
          photos: [...member.photos, ...newPhotos]
        };
      }
      return member;
    });

    // עדכון הסטייט
    const updatedMember = updatedMembers.find(m => m.id === selectedMember.id);
    setSelectedMember(updatedMember);
    
    // איפוס שדה הקובץ
    event.target.value = '';
  };

  return (
    <div className="p-6 bg-purple-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center">
        <Image className="mr-2" /> תמונות משפחתיות
      </h2>

      {/* אזור בחירת בן משפחה */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-purple-700">בחר בן משפחה</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`text-4xl p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                selectedMember?.id === member.id
                  ? 'bg-purple-200 shadow-lg scale-110'
                  : 'bg-white shadow-md'
              }`}
              title={member.name}
            >
              {member.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* אזור הצגת התמונות */}
      <div className="mt-6">
        {selectedMember ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-700">
                התמונות של {selectedMember.name}
              </h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Upload size={20} />
                העלאת תמונה
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
            
            {selectedMember.photos.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">אין עדיין תמונות ל{selectedMember.name}</p>
                <p className="text-sm text-gray-500 mt-2">לחץ על כפתור "העלאת תמונה" כדי להוסיף תמונות</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedMember.photos.map((photo, index) => (
                  <div key={index} className="bg-white p-2 rounded-lg shadow-md group relative">
                    <img
                      src={photo.url}
                      alt={`תמונה של ${selectedMember.name}`}
                      className="w-full h-48 object-cover rounded cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">בחר בן משפחה כדי לראות את התמונות שלו</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Photos; 