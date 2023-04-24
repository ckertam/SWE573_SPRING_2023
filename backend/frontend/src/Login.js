import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/user/login', {
      username: username,
      password: password
    },{ withCredentials: true }).then(response => {
      // TODO: handle success response

      if (response.status == 200) {
        toast.success('Login successful!');
        onLoginSuccess();
        navigate('/homepage');
        } else {
          toast.error('Invalid email or password');
        }
    }).catch(error => {
      console.log(error.response.data);
      // TODO: handle error response
    });
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" className="form-control" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <ToastContainer position="bottom-right" />
      </form>
    </div>
  );
}

export default Login;
