import React from 'react';
import axios from 'axios';

function LogoutButton() {
  const handleLogoutClick = async () => {
    try {
      const response = await axios.post('http://localhost:8000/user/logout',{}, { withCredentials: true });
      console.log('Request Headers:', response.config.headers);
      console.log('Response Headers:', response.headers);
      if (response.data.message === 'success') {
        // Clear any user-related data from your application state here if needed

        // Redirect to the home page or the login page after successful logout
        window.location.href = '/';
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <button onClick={handleLogoutClick} style={{ position: 'absolute', top: '10px', right: '10px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;