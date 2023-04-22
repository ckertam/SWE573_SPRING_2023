import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StoriesByFollowingsUsers.module.css';
import withAuth from './authCheck';

function StoriesByFollowingsUsers() {
  const [stories, setStories] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storiesResponse = await axios.get(`http://localhost:8000/user/userStories?page=${currentPage}&size=10`, { withCredentials: true });
        setStories(storiesResponse.data.stories);
        setHasNextPage(storiesResponse.data.has_next);
        setHasPrevPage(storiesResponse.data.has_prev);
        setTotalPages(storiesResponse.data.total_pages);

        const authorIds = storiesResponse.data.stories.map(story => story.author);
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
  }, [currentPage]);

  const handleStoryClick = async (id) => {
    navigate(`/story/${id}`);
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
    </div>
  );
}

export default withAuth(StoriesByFollowingsUsers);
