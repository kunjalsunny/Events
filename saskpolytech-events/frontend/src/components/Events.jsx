import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Events = ({ setIsAuthenticated }) => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role'); // Get user role from localStorage

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get('http://localhost:5000/events');
    setEvents(res.data);
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5000/events',
        { title, date, venue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
      setTitle('');
      setDate('');
      setVenue('');
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  const approveEvent = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/events/${id}/approve`,
      { status: 'Approved' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchEvents();
  };

  const rejectEvent = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/events/${id}/approve`,
      { status: 'Rejected' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchEvents();
  };

  return (
    <div>
      <h1>Saskpolytech Events</h1>
      <button onClick={handleLogout} style={{ float: 'right', marginBottom: '10px' }}>Logout</button>

      {userRole === 'student' && (
        <>
          <h2>Create an Event</h2>
          <form onSubmit={submitEvent}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" required />
            <button type="submit">Submit Event</button>
          </form>
        </>
      )}

      <h2>Event List</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.title} - {event.venue} ({new Date(event.date).toLocaleDateString()}) [{event.status}]
            {userRole === 'admin' && event.status === 'Pending' && (
              <>
                <button onClick={() => approveEvent(event.id)}>Approve</button>
                <button onClick={() => rejectEvent(event.id)}>Reject</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
