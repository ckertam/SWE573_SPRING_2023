import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function StoryDetails() {
  const [story, setStory] = useState(null);
  const [author, setAuthor] = useState(null);
  const { id } = useParams();

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

  return (
    <div>
      {story && author ? (
        <>
          <h1>{story.title}</h1>
          <p>Author: {author || 'Unknown'}</p>
          {/* Add more story details as needed */}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default StoryDetails;
