import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchEvents();

    // הגדרת רענון אוטומטי כל 2 שניות
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchEvents, 2000);
    }

    // ניקוי כשהקומפוננטה מתפרקת
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data || []); // אם אין נתונים, נשתמש במערך ריק
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // במקרה של שגיאה, נשתמש במערך ריק
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleAddEvent = () => {
    const newEvent = {
      name: '', // שם ריק כברירת מחדל
      date: new Date().toISOString()
    };

    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })
    .then(response => response.json())
    .then(data => {
      navigate(`/edit-event/${data.id}`);
    })
    .catch(error => {
      console.error('Error creating event:', error);
    });
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>אירועים</h2>
        <div className="events-controls">
          <button 
            className="refresh-toggle"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'כבה רענון אוטומטי' : 'הפעל רענון אוטומטי'}
          </button>
          <button 
            className="add-button"
            onClick={handleAddEvent}
          >
            הוסף אירוע חדש
          </button>
        </div>
      </div>
      <div className="events-list">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-info">
                <h3>{event.name || 'אירוע ללא שם'}</h3>
                <p>{new Date(event.date).toLocaleString('he-IL')}</p>
              </div>
              <button 
                className="edit-button"
                onClick={() => handleEdit(event.id)}
              >
                עריכה
              </button>
            </div>
          ))
        ) : (
          <div className="no-events">
            <p>אין אירועים להצגה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 