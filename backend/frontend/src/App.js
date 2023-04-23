import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
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


function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            <Link to="/" className="nav-item nav-link">Home</Link>
            <Link to="/register" className="nav-item nav-link">Register</Link>
            <Link to="/login" className="nav-item nav-link">Login</Link>
            <Link to="/homepage" className="nav-item nav-link">Home Page</Link>
            <Link to="/story_search" className="nav-item nav-link">Search Stories</Link>
            <Link to="/create-story" className="nav-item nav-link">Create Story</Link>
            <Link to="/user-profile" className="nav-item nav-link">User Profile</Link>
          </div>
        </nav>
        <LogoutButton />
        <LoadScriptNext googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
          <Routes>
            <Route path="/" element={<h1>Welcome to my app!</h1>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/homepage" element={<StoriesByFollowingsUsers />} />
            <Route path="/create-story" element={<CreateStory />} />
            <Route path="/create-story/add-photo/:story_id/:story_title" element={<AddPhotoToStory />} />
            <Route path="/story/:id" element={<StoryDetails />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/user-profile/:id" element={<UserProfileOthers />} />
            <Route path="/SearchUserResults/:searchQuery" element={<SearchUserResults />} />
            <Route path="/story_search" element={<StorySearch />} />
          </Routes>
        </LoadScriptNext>
      </div>
    </Router>
  );
}

export default App;