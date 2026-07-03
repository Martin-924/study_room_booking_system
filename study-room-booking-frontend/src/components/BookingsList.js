import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState({});

  const BOOKINGS_API = 'http://localhost:8081/api/bookings';
  const ROOMS_API = 'http://localhost:8081/api/rooms';

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(BOOKINGS_API);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(ROOMS_API);
      const roomsMap = {};
      response.data.forEach(room => {
        roomsMap[room.id] = room.name;
      });
      setRooms(roomsMap);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.delete(`${BOOKINGS_API}/${id}`);
        alert('Booking cancelled successfully!');
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleRelease = async (id) => {
    if (window.confirm('Are you sure you want to release this booking?')) {
      try {
        await axios.put(`${BOOKINGS_API}/${id}`);
        alert('Booking released successfully!');
        fetchBookings();
      } catch (error) {
        console.error('Error releasing booking:', error);
        alert('Failed to release booking');
      }
    }
  };

  const containerStyle = {
    padding: '0',
    maxWidth: '100%',
    margin: '0'
  };

  const headerStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '25px 30px',
    marginBottom: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const thStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '16px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const tdStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0'
  };

  const buttonStyle = (color) => ({
    padding: '9px 18px',
    margin: '0 6px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    color: 'white',
    backgroundColor: color,
    fontSize: '13px',
    transition: 'opacity 0.3s'
  });

  const badgeStyle = (released) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: released ? '#95a5a6' : '#27ae60',
    color: 'white',
    display: 'inline-block'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{margin: 0, fontSize: '28px'}}>My Bookings</h1>
        <p style={{margin: '5px 0 0 0', opacity: 0.9}}>View and manage your room bookings</p>
      </div>
      
      {bookings.length === 0 ? (
        <div style={{backgroundColor: 'white', padding: '50px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
          <p style={{fontSize: '18px', color: '#7f8c8d', margin: 0}}>No bookings found</p>
          <p style={{fontSize: '14px', color: '#95a5a6', marginTop: '10px'}}>Start by booking a room!</p>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Student Name</th>
              <th style={thStyle}>Student ID</th>
              <th style={thStyle}>Room</th>
              <th style={thStyle}>Booking Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={tdStyle}>{booking.studentName}</td>
                <td style={tdStyle}>{booking.studentId}</td>
                <td style={tdStyle}>{rooms[booking.roomId] || 'Unknown Room'}</td>
                <td style={tdStyle}>{booking.bookingDate}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle(booking.released)}>
                    {booking.released ? 'Released' : 'Active'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {!booking.released && (
                    <>
                      <button
                        onClick={() => handleRelease(booking.id)}
                        style={buttonStyle('#27ae60')}
                      >
                        Release
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        style={buttonStyle('#e74c3c')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.released && (
                    <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BookingsList;
