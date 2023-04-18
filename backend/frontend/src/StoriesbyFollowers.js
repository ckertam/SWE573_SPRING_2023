import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StoriesByFollowingsUsers.module.css';

function StoriesByFollowingsUsers() {
  const [stories, setStories] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storiesResponse = await axios.get('http://localhost:8000/user/userStories', { withCredentials: true });
        setStories(storiesResponse.data);
        const authorIds = storiesResponse.data.map(story => story.author);
        if (authorIds.length > 0) {
          const usernamesPromises = authorIds.map(id =>
            axios.get(`http://localhost:8000/user/usernamesbyId?user_ids[]=${id}`)
          );
          const usernamesResponses = await Promise.all(usernamesPromises);
          const newusernames = usernamesResponses.reduce((obj, response, index) => {
            obj[authorIds[index]] = response.data;
            return obj;
          }, {});
          setUsernames(newusernames);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStoryClick = async (id) => {
    navigate(`/story/${id}`);
  }

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        stories.map(story => (
          <div key={story.id}>
            <h3 className={styles.title} onClick={() => handleStoryClick(story.id)}>{story.title}</h3>
            <p>Author: {usernames[story.author] || 'Unknown'}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default StoriesByFollowingsUsers;
