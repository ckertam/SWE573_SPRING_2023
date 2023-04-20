import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate,useLocation  } from 'react-router-dom';
import styles from './StoryDetails.module.css';

function StoryDetails() {
  const [story, setStory] = useState(null);
  const [author, setAuthor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user/storyGet/${id}`);
        setStory(response.data);
        const authorResponse = await axios.get(`http://localhost:8000/user/usernamesbyId?user_ids[]=${response.data.author}`);
        setAuthor(authorResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchStory();
  }, [id]);

  const handleUserClick = async (id) => {
    navigate(`/user-profile/${id}`);
  }

  return (
    <div>
      {story && author ? (
        <>
          <h1>{story.title}</h1>
          <h3 className={styles.author} onClick={() => handleUserClick(story.author)}>
            {`author: ${author}`}
          </h3>
          <p>{`creation date: ${new Date(story.creation_date).toLocaleString()}`}</p>
          <p>{`location: ${story.location_ids.map(location => location.name).join(', ')}`}</p>
          <p>{`content: ${story.content}`}</p>
          <p>{`tags: ${story.story_tags}`}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default StoryDetails;
