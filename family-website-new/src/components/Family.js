import React from 'react';
import { Users } from 'lucide-react';

const Family = () => {
  const familyMembers = [
    { id: 1, name: 'אבא', role: 'שילון אנקורי', emoji: '👨‍💼' },
    { id: 2, name: 'אמא', role: 'ראש המשפחה', emoji: '👩‍👦' },
    { id: 3, name: 'אלירן', role: 'בן של אמא', emoji: '🏋️' },
    { id: 4, name: 'עילי', role: 'בן של אמא', emoji: '🤓' },
    { id: 5, name: 'שיראן', role: 'בן של אמא', emoji: '🤘' },
    { id: 6, name: 'ליעוז', role: 'בן של אמא', emoji: '🚀' }
  ];

  return (
    <div className="p-6 bg-blue-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center">
        {React.createElement(Users, { className: 'mr-2' })} בני המשפחה
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {familyMembers.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-2">{member.emoji}</div>
            <h3 className="font-bold text-lg">{member.name}</h3>
            <p className="text-gray-600">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Family; 