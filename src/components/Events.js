import React from 'react';
import { Calendar } from 'lucide-react';

const Events = () => {
  const upcomingEvents = [
    { id: 1, title: 'אירוע משפחתי', date: '15 ביולי 2025', location: 'בית המשפחה' },
    { id: 2, title: 'מפגש משפחתי', date: '22 באוגוסט 2025', location: 'בית המשפחה' },
    { id: 3, title: 'נסיעה משפחתית', date: '10-15 בספטמבר 2025', location: 'יעד משפחתי' }
  ];

  return (
    <div className="p-6 bg-green-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center">
        <Calendar className="mr-2" /> אירועים קרובים
      </h2>
      {upcomingEvents.map(event => (
        <div key={event.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold text-lg">{event.title}</h3>
          <p className="text-gray-600">תאריך: {event.date}</p>
          <p className="text-gray-600">מיקום: {event.location}</p>
        </div>
      ))}
    </div>
  );
};

export default Events; 