import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Register from './Register';
import Login from './Login';
import CreateStory from './CreateStory';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="navbar-nav">
            <Link to="/" className="nav-item nav-link">Home</Link>
            <Link to="/register" className="nav-item nav-link">Register</Link>
            <Link to="/login" className="nav-item nav-link">Login</Link>
            <Link to="/create-story" className="nav-item nav-link">Create Story</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<h1>Welcome to my app!</h1>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-story" element={<CreateStory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
