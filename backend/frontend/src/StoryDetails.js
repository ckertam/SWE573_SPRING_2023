import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate  } from 'react-router-dom';
import styles from './StoryDetails.module.css';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import withAuth from './authCheck';



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
  const [photos, setPhotos] = useState([]);
  const [currentPhotoPage, setCurrentPhotoPage] = useState(1);
  const [hasPrevPhotoPage, setHasPrevPhotoPage] = useState(false);
  const [hasNextPhotoPage, setHasNextPhotoPage] = useState(false);
  const [totalPhotoPages, setTotalPhotoPages] = useState(0);
  const [numLikes, setNumLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState(null);




  const PHOTOS_PER_PAGE = 3;


  const fetchUserDetails = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/user', { withCredentials: true });
      setUserId(response.data);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    const fetchStory = async () => {
      try {
        await fetchUserDetails(); // Get the current user ID
        const response = await axios.get(`http://localhost:8000/user/storyGet/${id}`, { withCredentials: true });
        setStory(response.data);
        setNumLikes(response.data.likes.length);
        const authorResponse = await axios.get(`http://localhost:8000/user/usernamesbyId?user_ids[]=${response.data.author}`);
        setAuthor(authorResponse.data);
  
        // Check if the user has liked the story and set the 'liked' state accordingly
        if (userId && response.data.likes.includes(userId)) {
          setLiked(true);
        } else {
          setLiked(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchStory();
  }, [userId]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user/storyPhoto/${id}?page=${currentPhotoPage}&size=3`, { withCredentials: true });
        setPhotos(response.data.photos.map(item => item.photo_for_story));
        setHasNextPhotoPage(response.data.has_next);
        setHasPrevPhotoPage(response.data.has_prev);
        setTotalPhotoPages(response.data.total_pages);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPhotos(currentPhotoPage);
  }, [id, currentPhotoPage]);

  const handlePhotoPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPhotoPages) {
      setCurrentPhotoPage(newPage);
    }
  };

  const fetchComments = async (page) => {
    try {
      const response = await axios.get(`http://localhost:8000/user/commentsByStory/${id}?page=${page}&size=${PHOTOS_PER_PAGE}`);
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

  function StoryMarkers({ locations }) {
    const markers = locations.map((location, index) => (
      <Marker
        key={index}
        position={{
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude),
        }}
      />
    ));
  
    return <>{markers}</>;
  }

  const handleLikeDislike = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/user/like/${id}`, {}, { withCredentials: true });
      if (response.data.message === 'Like added successfully.') {
        setNumLikes(numLikes + 1);
        setLiked(true);
      } else {
        setNumLikes(numLikes - 1);
        setLiked(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {story && author ? (
        <>
          <h1>{story.title}</h1>
          <p>
            author:{' '}
            <span className={styles.author} onClick={() => handleUserClick(story.author)}>
              {author}
            </span>
          </p>
          <p>{`creation date: ${new Date(story.creation_date).toLocaleDateString()}`}</p>
          <p>{`Time: ${formatDate()}`}</p>
          <p>{`content: ${story.content}`}</p>
          <p>{`tags: ${story.story_tags}`}</p>
          <div>
          <span>{numLikes} </span>
          <button
            className={`heart-button${liked ? ' liked' : ''}`}
            onClick={handleLikeDislike}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={liked ? 'red' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21c-.24 0-.48-.05-.7-.15L2.5 15.5C1.5 14.8 1 13.5 1 12c0-3.3 2.7-6 6-6 2.2 0 4.4 1.7 5 4 .6-2.3 2.8-4 5-4 3.3 0 6 2.7 6 6 0 1.5-.5 2.8-1.5 3.5l-8.8 5.3c-.3.2-.7.2-1 .2z" />
            </svg>
          </button>
        </div>
          <div>
            {photos &&
              photos
                .slice((currentPhotoPage - 1) * PHOTOS_PER_PAGE, currentPhotoPage * PHOTOS_PER_PAGE)
                .map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`story photo ${index}`}
                    width={100}
                    height={100}
                  />
                ))}
          </div>
          <div className={styles.pagination}>
          {hasPrevPhotoPage && (
              <button onClick={() => handlePhotoPageChange(currentPhotoPage - 1)} disabled={!hasPrevPhotoPage}>
                Previous
              </button>
            )}
            {Array.from({ length: totalPhotoPages }, (_, index) => (
              <button
                key={index}
                className={index + 1 === currentPhotoPage ? styles.active : null}
                onClick={() => handlePhotoPageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            {hasNextPhotoPage && (
              <button onClick={() => handlePhotoPageChange(currentPhotoPage + 1)} disabled={!hasNextPhotoPage}>
                Next
              </button>
            )}
          </div>
          {story.location_ids.length > 0 && (
              <>
                <div style={{ width: '100%', height: '400px' }}>
                  <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    zoom={12}
                    center={{
                      lat: parseFloat(story.location_ids[0].latitude),
                      lng: parseFloat(story.location_ids[0].longitude),
                    }}
                  >
                    <StoryMarkers locations={story.location_ids} />
                  </GoogleMap>
                </div>
              </>
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
          {hasPrevPage && (
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevPage}>
                Previous
              </button>
            )}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={index + 1 === currentPage ? styles.active : null}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            {hasNextPage && (
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNextPage}>
                Next
              </button>
            )}
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

export default withAuth(StoryDetails);

