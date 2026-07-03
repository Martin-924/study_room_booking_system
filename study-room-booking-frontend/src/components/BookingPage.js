import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookingPage() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    roomId: '',
    bookingDate: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const ROOMS_API = 'http://localhost:8081/api/rooms';
  const BOOKINGS_API = 'http://localhost:8081/api/bookings';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(ROOMS_API);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        studentName: formData.studentName,
        studentId: formData.studentId,
        roomId: formData.roomId,
        bookingDate: formData.bookingDate,
        released: false
      };

      await axios.post(BOOKINGS_API, bookingData);
      setMessage({ text: 'Booking created successfully!', type: 'success' });
      setFormData({
        studentName: '',
        studentId: '',
        roomId: '',
        bookingDate: ''
      });
      fetchRooms();
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response && error.response.status === 409) {
        const errorMsg = error.response.data || 'Room is already booked for this date!';
        setMessage({ text: errorMsg, type: 'error' });
      } else {
        setMessage({ text: 'Failed to create booking', type: 'error' });
      }
    }
  };

  const containerStyle = {
    padding: '0',
    maxWidth: '700px',
    margin: '0 auto'
  };

  const headerStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '25px 30px',
    marginBottom: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '35px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    marginBottom: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '15px 40px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 'bold',
    width: '100%'
  };

  const messageStyle = {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '25px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '15px',
    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
    color: message.type === 'success' ? '#155724' : '#721c24',
    border: `2px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{margin: 0, fontSize: '28px'}}>Book a Room</h1>
        <p style={{margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px'}}>Fill in the details to book your room</p>
      </div>
      
      {message.text && (
        <div style={messageStyle}>
          {message.text}
        </div>
      )}

      <div style={formStyle}>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Student Name</label>
            <input
              type="text"
              name="studentName"
              placeholder="Enter your full name"
              value={formData.studentName}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="Enter your student ID"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Select Room</label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleInputChange}
              required
              style={inputStyle}
              onFocus={fetchRooms}
            >
              <option value="">-- Select a Room --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.location} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Booking Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle}>Book Room</button>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;
