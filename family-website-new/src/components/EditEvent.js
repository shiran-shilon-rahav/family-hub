import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditEvent.css';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    name: '',
    date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event data');
      }
      const data = await response.json();
      // וידוא שהתאריך הוא בפורמט הנכון ל-input מסוג datetime-local
      const date = new Date(data.date);
      const formattedDate = date.toISOString().slice(0, 16);
      setEvent({ ...data, date: formattedDate });
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('שגיאה בטעינת האירוע');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      navigate('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('שגיאה בעדכון האירוע');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
        
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('שגיאה במחיקת האירוע');
      }
    }
  };

  if (loading) {
    return <div className="loading">טוען...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate('/events')} className="cancel-button">
          חזור לרשימת האירועים
        </button>
      </div>
    );
  }

  return (
    <div className="edit-event-container">
      <h2>עריכת אירוע</h2>
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="form-group">
          <label>שם האירוע:</label>
          <input
            type="text"
            value={event.name}
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>תאריך:</label>
          <input
            type="datetime-local"
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="save-button">שמור שינויים</button>
          <button type="button" className="delete-button" onClick={handleDelete}>
            מחק אירוע
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate('/events')}>
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 