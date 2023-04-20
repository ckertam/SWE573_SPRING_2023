import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfileOthers = () => {
  const [user, setUser] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const { id } = useParams();

  const navigate = useNavigate();

  const getCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/user', {
        headers: {},
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDetailsResponse = await axios.get(`http://localhost:8000/user/userDetails/${id}`, {
          headers: {},
          withCredentials: true,
        });
        setUser(userDetailsResponse.data);

        const profilePhotoResponse = await axios.get(`http://localhost:8000/user/profilePhoto/${id}`, {
          headers: {},
          withCredentials: true,
          responseType: 'arraybuffer',
        });
        const base64Image = Buffer.from(profilePhotoResponse.data, 'binary').toString('base64');

        const contentType = profilePhotoResponse.headers['content-type'];
        const dataUrlPrefix = contentType === 'image/jpeg' ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';

        setProfilePhotoUrl(`${dataUrlPrefix}${base64Image}`);
        
        const followersResponse = await axios.get(`http://localhost:8000/user/userFollowers/${id}`, {
        headers: {},
        withCredentials: true,
        });
        const currentUser = await getCurrentUser();

        const isCurrentUserFollowing = followersResponse.data.some(
            (follower) => follower.id === currentUser
        );
        setIsFollowing(isCurrentUserFollowing);

        setFollowerCount(userDetailsResponse.data.followers.length);

      } catch (error) {
        console.error('Error fetching user details and profile photo:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchUserStories();
  }, [currentPage]);

  const handleFollowClick = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/user/followByUser/${id}`, null, {
        headers: {},
        withCredentials: true,
      });
      if (response.data === "followed") {
        setIsFollowing(true);
        setFollowerCount((prevCount) => prevCount + 1);
      } else if (response.data === "unfollowed") {
        setIsFollowing(false);
        setFollowerCount((prevCount) => prevCount - 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const fetchUserStories = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/user/userStories/${id}?page=${currentPage}&size=5`, {
        withCredentials: true,
      });
      setStories(response.data.stories);
      setHasNextPage(response.data.has_next);
      setHasPrevPage(response.data.has_prev);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching user stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (id) => {
    navigate(`/story/${id}`);
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      {profilePhotoUrl && (
        <img
          src={profilePhotoUrl}
          alt={`${user.username}'s profile`}
          className="profile-photo"
        />
      )}
      {/* <p>ID: {user.id}</p>
      <p>Email: {user.email}</p> */}
      <p>Biography: {user.biography}</p>
      <p>Followers: {followerCount}</p>
      <button onClick={handleFollowClick}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      <h2>Stories</h2>
      {loading ? (
        <p>Loading stories...</p>
      ) : stories.length === 0 ? (
        <p>No stories found.</p>
      ) : (
        <div>
          {stories.map(story => (
            <div key={story.id}>
              <h3 className="story-title" onClick={() => handleStoryClick(story.id)}>{story.title}</h3>
              <p>Creation Date: {new Date(story.creation_date).toLocaleString()}</p>
            </div>
          ))}
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevPage}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={index + 1 === currentPage ? 'active' : null}
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
      )}
    </div>
  );
};

export default UserProfileOthers;
