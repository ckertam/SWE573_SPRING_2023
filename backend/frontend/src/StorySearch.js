import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StorySearch.module.css'


const StorySearch = () => {
  const [titleSearch, setTitleSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [stories, setStories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  const handleStoryClick = async (id) => {
    navigate(`/story/${id}`);
  };
  
  const handleUserClick = async (id) => {
    navigate(`/user-profile/${id}`);
  };

  

  const handleSearch = async (e,pageNumber = 1) => {
    e.preventDefault();
  
    try {
      const response = await axios.get('http://localhost:8000/user/storySearch', {
        params: {
            title: titleSearch,
            author: authorSearch,
            page: pageNumber,
            size: pageSize,
          },
        withCredentials: true,
      });
      setStories(response.data.stories);
      setTotalPages(response.data.total_pages);
      setCurrentPage(pageNumber);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch({ preventDefault: () => {} }, newPage);
  };


  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? styles.activePage : ''}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };


  return (
    <div>
      <h2>Story Search</h2>
      <form onSubmit={handleSearch}>
        <label htmlFor="titleSearch">Search by title:</label>
        <input
          type="text"
          id="titleSearch"
          value={titleSearch}
          onChange={(e) => setTitleSearch(e.target.value)}
        />
        <br />
        <label htmlFor="authorSearch">Search by author username:</label>
        <input
          type="text"
          id="authorSearch"
          value={authorSearch}
          onChange={(e) => setAuthorSearch(e.target.value)}
        />
        <br />
        <button type="submit">Search</button>
      </form>

      {stories.length > 0 && (
        <>
          <h3>Search Results:</h3>
          <ul>
            {stories.map((story) => (
              <li key={story.id}>
                <h4 className={styles.title} onClick={() => handleStoryClick(story.id)}>{story.title}</h4>
                <p>
                author:{' '}
                <span className={styles.author} onClick={() => handleUserClick(story.author)}>
                {story.author_username}
                </span>
            </p>
              </li>
            ))}
          </ul>
        </>
      )}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StorySearch;
