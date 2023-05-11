import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate  } from 'react-router-dom';
import './StoryDetails.css';
import { GoogleMap, Marker } from '@react-google-maps/api';
import withAuth from '../../authCheck';
import Heart from "react-animated-heart";
import CommentSection from './CommentSection';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Chip from '@mui/material/Chip';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const PHOTOS_PER_PAGE = 3;
  const COMMENTS_PER_PAGE = 5;
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  

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

  // useEffect(()=>{
  //   console.log(story,"story")
  // },[story])

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
        const date = new Date(story.date).toLocaleDateString()
        return `Date: ${date}`;
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

  const handleEditButtonClick = () => {
    setIsEditMode(true);
    setOpen(true)
    setEditedContent(story.content);
    console.log(story,"story")
  };

  const handleSaveButtonClick = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/user/storyUpdate/${id}`,
        { content: editedContent },
        { withCredentials: true }
      );
      setIsEditMode(false);
      setStory({ ...story, content: editedContent });
    } catch (error) {
      console.log(error);
    }
    setOpen(false)
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"]
    ]
  };


  return (
    <div className="story-details-wrapper">
      {story ? (
        <>
       <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center', // Center the elements
        marginTop: '16px', // Add margin to the top
      }}
    >
      <Typography variant="h4">
        {story.title}
      </Typography>

      <Typography variant="body1">
        Author:{' '}
        <Chip
          label={story.author_username}
          onClick={() => handleUserClick(story.author)}
          color="primary"
          variant="outlined"
        />
      </Typography>
      <Typography variant="body1">
        {`Creation date: ${new Date(story.creation_date).toLocaleDateString()}`}
      </Typography>
      <Typography variant="body1">
        {`${formatDate()}`}
      </Typography>
      {story.season_name && (
        <Typography variant="body1">
          {`Season: ${story.season_name}`}
        </Typography>
      )}
    </Box>
          {userId === story.author && (
                <Button onClick={handleEditButtonClick}>Edit</Button>
          )}
          <div className='quill-container'>
              
              
                <ReactQuill
                className="story-content"
                value={story.content}
                readOnly={true}
                modules={{ toolbar: false }}
              />
      
              

<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
  <ReactQuill
                className="story-content"
                value={editedContent}
                readOnly={false}
                onChange={setEditedContent}
                modules={modules}
              />
                              <Button onClick={handleSaveButtonClick}>Save</Button>

  </Box>
</Modal>
            
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

