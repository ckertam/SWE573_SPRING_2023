import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfileOthers = () => {
  const [user, setUser] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchUserDetails();
    fetchProfilePhoto(); 
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/user/userDetails/${id}`, {
        headers: {
        },
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchProfilePhoto = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/user/profilePhoto/${id}`, {
        headers: {
        },
        withCredentials: true,
        responseType: 'arraybuffer',
      });
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
  
      // Determine the data URL prefix based on the file extension
      const contentType = response.headers['content-type'];
      const dataUrlPrefix = contentType === 'image/jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
  
      setProfilePhotoUrl(`${dataUrlPrefix}${base64Image}`);
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      {profilePhotoUrl && (
        <img
            src={profilePhotoUrl}
            alt={`${user.username}'s profile`}
            className="profile-photo" 
        />
        )}
      {/* <p>ID: {user.id}</p>
      <p>Email: {user.email}</p> */}
      <p>Biography: {user.biography}</p>
      <p>Followers: {user.followers.length}</p>
      
    </div>
  );
};

export default UserProfileOthers;
