import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    available: true
  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = 'http://localhost:8081/api/rooms';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(API_URL);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, {
          ...formData,
          capacity: parseInt(formData.capacity)
        });
        alert('Room updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(API_URL, {
          ...formData,
          capacity: parseInt(formData.capacity)
        });
        alert('Room added successfully!');
      }
      setFormData({ name: '', capacity: '', location: '', available: true });
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      available: room.available
    });
    setEditingId(room.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        alert('Room deleted successfully!');
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: '', location: '', available: true });
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

  const formStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '18px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s'
  };

  const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '14px 35px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
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

  const badgeStyle = (available) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: available ? '#4caf50' : '#f44336',
    color: 'white',
    display: 'inline-block'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{margin: 0, fontSize: '28px'}}>Room Management</h1>
        <p style={{margin: '5px 0 0 0', opacity: 0.9}}>Add, edit, and manage campus rooms</p>
      </div>
      
      <div style={formStyle}>
        <h2 style={{marginTop: 0, color: '#1a237e'}}>{editingId ? '✏️ Edit Room' : '➕ Add New Room'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Room Name (e.g., Library Room A)"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., Building A, Floor 2)"
            value={formData.location}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <label style={{ display: 'block', marginBottom: '15px' }}>
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleInputChange}
              style={{ marginRight: '8px' }}
            />
            Available
          </label>
          <button type="submit" style={buttonStyle}>
            {editingId ? 'Update Room' : 'Add Room'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              style={{...buttonStyle, backgroundColor: '#95a5a6', marginLeft: '10px'}}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2 style={{color: '#2c3e50', marginBottom: '20px'}}>All Rooms</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Room Name</th>
            <th style={thStyle}>Capacity</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td style={tdStyle}>{room.name}</td>
              <td style={tdStyle}>{room.capacity} students</td>
              <td style={tdStyle}>{room.location}</td>
              <td style={tdStyle}>
                <span style={badgeStyle(room.available)}>
                  {room.available ? 'Available' : 'Booked'}
                </span>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleEdit(room)}
                  style={{...buttonStyle, padding: '8px 16px', fontSize: '13px', backgroundColor: '#3498db', marginRight: '8px'}}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  style={{...buttonStyle, padding: '8px 16px', fontSize: '13px', backgroundColor: '#e74c3c'}}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoomsPage;
