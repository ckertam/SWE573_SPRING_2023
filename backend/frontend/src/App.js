import React, { useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Register from './Register';
import Login from './Login';
import CreateStory from './CreateStory';
import StoriesByFollowingsUsers from './StoriesbyFollowingUsers';
import StoryDetails from './StoryDetails';
import LogoutButton from './Logout';
import UserProfile from './UserProfile';
import UserProfileOthers from './UserProfileOthers';
import AddPhotoToStory from './AddPhotoToStory';
import { LoadScriptNext } from "@react-google-maps/api";
import SearchUserResults from './SearchUserResults';
import StorySearch from './StorySearch';
import mainPhoto from './assets/images/homePage4.png'

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //const isLoggedIn = withAuth();

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/user', { withCredentials: true });
      if (response && response.data) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);


  // useEffect(() => {
  //   const loggedInUser = localStorage.getItem('token');
  //   if (loggedInUser) {
  //     setIsLoggedIn(true);
  //   }
  // }, []);
  // console.log(isLoggedIn)

  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
          {!isLoggedIn && (
            <>
            <Link to="/" className="nav-item nav-link">Home</Link>
            <Link to="/register" className="nav-item nav-link">Register</Link>
            <Link to="/login" className="nav-item nav-link">Login</Link>
            </>
            )}
            {isLoggedIn && (
            <>
            <Link to="/homepage" className="nav-item nav-link"><img
                src={mainPhoto}
                alt="Home Page"
                style={{ width: '50px', height: '50px' }}
              /></Link>
            <Link to="/story_search" className="nav-item nav-link">Search Stories</Link>
            <Link to="/create-story" className="nav-item nav-link">Create Story</Link>
            <Link to="/user-profile" className="nav-item nav-link">User Profile</Link>
            </>
            )}
          </div>
        </nav>
        {isLoggedIn && (
        <LogoutButton />
        )}
        <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
          <Routes>
          {!isLoggedIn && (
              <>
            <Route path="/" element={
                  <div className="home-container">
                    <img
                      src={mainPhoto}
                      alt="Memories"
                      style={{ width: '1000px', height: 'auto' }}
                    />
                  </div>
                } />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
            </>
            )}
            
            {isLoggedIn && (
              <>
            <Route path="/homepage" element={<StoriesByFollowingsUsers />} />
            <Route path="/create-story" element={<CreateStory />} />
            <Route path="/create-story/add-photo/:story_id" element={<AddPhotoToStory />} />
            <Route path="/story/:id" element={<StoryDetails />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/user-profile/:id" element={<UserProfileOthers />} />
            <Route path="/SearchUserResults/:searchQuery" element={<SearchUserResults />} />
            <Route path="/story_search" element={<StorySearch />} />
            </>
            )}
          </Routes>
        </LoadScriptNext>
      </div>
    </Router>
  );
}

export default App;