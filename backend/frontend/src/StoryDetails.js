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
  };

  const formatDate = () => {
    // format the date based on the date_type of the story
    switch (story.date_type) {
      case 'season':
        return story.season_name;
      case 'decade':
        return `${story.year}s`;
      case 'normal_date':
        return new Date(story.date).toLocaleString();
      case 'interval_date':
        const startDate = new Date(story.start_date).toLocaleDateString();
        const endDate = new Date(story.end_date).toLocaleDateString();
        return `${startDate} to ${endDate}`;
      default:
        return '';
    }
  };

  return (
    <div>
      {story && author ? (
        <>
          <h1>{story.title}</h1>
          <h3 className={styles.author} onClick={() => handleUserClick(story.author)}>
            {`author: ${author}`}
          </h3>
          <p>{`creation date: ${new Date(story.creation_date).toLocaleDateString()}`}</p>
          <p>{`Time: ${formatDate()}`}</p>
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
