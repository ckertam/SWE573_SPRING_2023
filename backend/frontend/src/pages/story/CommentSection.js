import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate  } from 'react-router-dom';
import './CommentSection.css'
import { Button, TextField, Box } from '@mui/material';

const COMMENTS_PER_PAGE = 5;

function CommentSection({ comments, setComments}) {
  const { id } = useParams();
  const [commentText, setCommentText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [profilePhotos, setProfilePhotos] = useState({});

  const navigate = useNavigate();


  const fetchComments = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/user/commentsByStory/${id}?page=${page}&size=${COMMENTS_PER_PAGE}`
      );
      setComments(response.data.comments);
      setHasNextPage(response.data.has_next);
      setHasPrevPage(response.data.has_prev);
      setTotalPages(response.data.total_pages);
      

      const newProfilePhotos = { ...profilePhotos };
      for (const comment of response.data.comments) {
        console.log(comment)
        if (!newProfilePhotos[comment.comment_author_id]) {
            newProfilePhotos[comment.comment_author_id] = await fetchProfilePhoto(comment.comment_author_id);
        }
      }
      setProfilePhotos(newProfilePhotos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/user/comment/${id}`,
        { text: commentText },
        { withCredentials: true }
      );
      setCommentText('');
      if (comments.length === COMMENTS_PER_PAGE) {
        setCurrentPage(totalPages + 1);
      } else {
        fetchComments(currentPage);
      }
    //   if (currentPage === 1 && comments.length < 3) {
    //     setComments([...comments, response.data]);
    //   }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfilePhoto = async (userId) => {
    try {
      const profilePhotoResponse = await axios.get(`http://localhost:8000/user/profilePhoto/${userId}`, {
        headers: {},
        withCredentials: true,
        responseType: 'arraybuffer',
      });
      const base64Image = Buffer.from(profilePhotoResponse.data, 'binary').toString('base64');
  
      const contentType = profilePhotoResponse.headers['content-type'];
      const dataUrlPrefix = contentType === 'image/jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
  
      return `${dataUrlPrefix}${base64Image}`;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Profile photo not found, do nothing
      } else {
        console.error('Error fetching profile photo:', error);
      }
    }
  };

  const handlePhotoClick = async (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Shadows Into Light, cursive' }}>Comments</h2>
      {comments &&
        comments.map((comment) => (
          <div key={comment.id} className="comment-container" style={{ fontFamily: 'Shadows Into Light, cursive' }}>
                <img
                className="comment-photo"
                src={profilePhotos[comment.comment_author_id]}
                alt={`${comment.comment_author}'s profile`}
                onClick={() => handlePhotoClick(comment.comment_author_id)}
                />
                <div className="comment-content">
                <span
                    className="comment-author-name"
                    onClick={() => handlePhotoClick(comment.comment_author_id)}
                >
                    {comment.comment_author}
                </span>
                <p className="comment-text">{comment.text}</p>
                <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>
            </div>
          </div>
        ))}
      <div className="pagination">
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
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start',
      }}
    >
      <TextField
        sx={{
          '& .MuiInputBase-input': {
        fontFamily: 'Shadows Into Light, cursive',
          },
          '& .MuiInputLabel-root': {
            fontFamily: 'Shadows Into Light, cursive',
          },
        }}
        id="comment"
        name="comment"
        label="Add a comment"
        multiline
        rows={4}
        value={commentText}
        onChange={(event) => setCommentText(event.target.value)}
        variant="outlined"
        fullWidth
      />
      <Button
        onClick={handleCommentSubmit}
        variant="contained"
        color="primary"
        sx={{ fontFamily: 'Shadows Into Light, cursive' }}

      >
        Submit
      </Button>
    </Box>
    </div>
  );
}

export default CommentSection;