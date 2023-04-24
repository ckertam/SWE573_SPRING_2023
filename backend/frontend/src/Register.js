import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== passwordAgain) {
      toast.error("Passwords don't match");
      return;
    }
    axios.post('http://localhost:8000/user/register', {
      username: username,
      email: email,
      password: password,
      password_again: passwordAgain
    }).then(response => {
      toast.success(response.data.message);
      navigate('/login');
    }).catch(error => {
      if (error.response && error.response.data) {
        if (error.response.data.username) {
          toast.error(`Username: ${error.response.data.username}`);
        }
        if (error.response.data.email) {
          toast.error(`Email: ${error.response.data.email}`);
        }
      } else {
        toast.error('An error occurred while registering');
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" className="form-control" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password Again:</label>
          <input type="password" className="form-control" onChange={(e) => setPasswordAgain(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <ToastContainer />
    </>
  );
}

export default Register;
