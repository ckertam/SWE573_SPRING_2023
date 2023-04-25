import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/user/passwordReset', {
      email: email,
    }).then(response => {
      toast.success('Password reset email sent.');
      navigate('/enter-reset-code');
    }).catch(error => {
      console.log(error.response.data);
    });
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Send Code</button>
        <ToastContainer position="bottom-right" />
      </form>
    </div>
  );
}

export default ResetPasswordRequest;
