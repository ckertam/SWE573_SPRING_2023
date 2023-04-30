import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate  } from 'react-router-dom';
import './StoryDetails.css';
import { GoogleMap, Marker } from '@react-google-maps/api';
import withAuth from '../../authCheck';
import Heart from "react-animated-heart";
import CommentSection from './CommentSection';

function StoryDetails() {
  const [story, setStory] = useState(null);
  //const [author, setAuthor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [numLikes, setNumLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  // const PHOTOS_PER_PAGE = 3;
  const COMMENTS_PER_PAGE = 5;

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/userDetails', { withCredentials: true });
      setUserId(response.data.id);
      setUsername(response.data.username);
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

  const handleUserClick = async (id) => {
    navigate(`/user-profile/${id}`);
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
    <div className="story-details-wrapper">
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
          <div className='story-content-container'>
          <div
              className="story-content"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
            </div>
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
          <CommentSection storyId={id} comments={comments} setComments={setComments} />
        </>
      ) : (
        <p>Loading...</p>
      )}

        
    </div>
  );
}

export default withAuth(StoryDetails);

