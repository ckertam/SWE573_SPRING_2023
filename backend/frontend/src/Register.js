import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/user/register', {
      username: username,
      email: email,
      password: password,
      password_again: passwordAgain
    }).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
    });
  }

  return (
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
  );
}

export default Register;
