import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate  } from 'react-router-dom';
import './StoryDetails.css';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import withAuth from '../../authCheck';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import Heart from "react-animated-heart";





function StoryDetails() {
  const [story, setStory] = useState(null);
  //const [author, setAuthor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  // const [photos, setPhotos] = useState([]);
  // const [currentPhotoPage, setCurrentPhotoPage] = useState(1);
  // const [hasPrevPhotoPage, setHasPrevPhotoPage] = useState(false);
  // const [hasNextPhotoPage, setHasNextPhotoPage] = useState(false);
  // const [totalPhotoPages, setTotalPhotoPages] = useState(0);
  const [numLikes, setNumLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isClick, setClick] = useState(false);




  // const PHOTOS_PER_PAGE = 3;
  const COMMENTS_PER_PAGE = 5;

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
        // const authorResponse = await axios.get(`http://localhost:8000/user/usernamesbyId?user_ids[]=${response.data.author}`);
        // setAuthor(authorResponse.data);
  
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

  // useEffect(() => {
  //   const fetchPhotos = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:8000/user/storyPhoto/${id}?page=${currentPhotoPage}&size=3`, { withCredentials: true });
  //       setPhotos(response.data.photos.map(item => item.photo_for_story));
  //       setHasNextPhotoPage(response.data.has_next);
  //       setHasPrevPhotoPage(response.data.has_prev);
  //       setTotalPhotoPages(response.data.total_pages);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchPhotos(currentPhotoPage);
  // }, [id, currentPhotoPage]);

  // const handlePhotoPageChange = (newPage) => {
  //   if (newPage >= 1 && newPage <= totalPhotoPages) {
  //     setCurrentPhotoPage(newPage);
  //   }
  // };

  const fetchComments = async (page) => {
    try {
      const response = await axios.get(`http://localhost:8000/user/commentsByStory/${id}?page=${page}&size=${COMMENTS_PER_PAGE}`);
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
      case 'decade':
        return `Year: ${story.year}`;
      case 'year_interval':
        const startYear = story.start_year;
        const endYear = story.end_year;
        return `Start Year: ${startYear} \n End Year: ${endYear}`;
      case 'normal_date':
        const date = new Date(story.date).toLocaleString()
        return `Date: ${startYear}`;
      case 'interval_date':
        const startDate = new Date(story.start_date).toLocaleDateString();
        const endDate = new Date(story.end_date).toLocaleDateString();
        return `Start Date: ${startDate} \n End Date: ${endDate}`;
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
      {story ? (
        <>
          <h1>{story.title}</h1>
          
          <p>
            author:{' '}
            <span className='authorStoryDetail' onClick={() => handleUserClick(story.author)}>
              {story.author_username}
            </span>
          </p>
          <p>{`creation date: ${new Date(story.creation_date).toLocaleDateString()}`}</p>
          <p>{`${formatDate()}`}</p>
          <p>{story.season_name && `Season: ${(story.season_name)} `}</p>
          <div
              className="story-content"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          <p>{`tags: ${story.story_tags}`}</p>
          <div> 
          <button
            onClick={handleLikeDislike}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
             <Heart isClick={liked} onClick={() => setLiked(!liked)}/>
          </button>
          <br/>
          <span>{numLikes} </span>
        </div>

          {story.location_ids.length > 0 && (
              <>
                <div className='storydetail-story-map'>
                  <GoogleMap
                    mapContainerStyle={{ height: '400px', width: '400px' }}
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
          <div className= 'pagination'>
          {hasPrevPage && (
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevPage}>
                Previous
              </button>
            )}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={index + 1 === currentPage ? 'active' : null}
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

