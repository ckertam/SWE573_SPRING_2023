import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate,useLocation  } from 'react-router-dom';
import styles from './StoryDetails.module.css';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';



function StoryDetails() {
  const [story, setStory] = useState(null);
  const [author, setAuthor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

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
  }, []);

  const fetchComments = async (page) => {
    try {
      const response = await axios.get(`http://localhost:8000/user/commentsByStory/${id}?page=${page}&size=3`);
      setComments(response.data.comments);
      setHasNextPage(response.data.has_next);
      setHasPrevPage(response.data.has_prev);
      setTotalPages(response.data.total_pages);
      console.log(totalPages)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  const handleUserClick = async (id) => {
    navigate(`/user-profile/${id}`);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/user/comment/${id}`,
        { text: commentText },
        { withCredentials: true }
      );
      setCommentText('');
      // if the new comment is on the current page, add it to the comments list
      if (currentPage === 1 && comments.length < 3) {
        setComments([...comments, response.data]);
      }
    } catch (error) {
      console.log(error);
    }
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
          <p>{`content: ${story.content}`}</p>
          <p>{`tags: ${story.story_tags}`}</p>

          {story.location_ids.length > 0 && (
            <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
              mapContainerStyle={{ height: '400px', width: '100%' }}
              zoom={12}
              center={{
                lat: parseFloat(story.location_ids[0].latitude),
                lng: parseFloat(story.location_ids[0].longitude),
              }}
            >
            {story.location_ids.map((location, index) => (
              <Marker
                key={index}
                position={{
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                }}
              />
            ))}
            </GoogleMap>
            </LoadScriptNext>
          )}
          <h2>Comments</h2>
          {comments &&
            comments.map((comment) => (
              <div key={comment.id}>
                <p>{`Comment by ${comment.comment_author} on ${new Date(comment.date).toLocaleString()}`}</p>
                <p>{comment.text}</p>
              </div>
            ))}
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevPage}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={index + 1 === currentPage ? styles.active : null}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNextPage}>
              Next
            </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
      <div>
        <label htmlFor="comment">Add a comment:</label>
        <textarea
          id="comment"
          name="comment"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <button onClick={handleCommentSubmit}>Submit</button>
      </div>
    </div>
  );
}


export default StoryDetails;
