import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';

    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, formData);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        setIsAuthenticated(true);
        navigate('/events');
      } else {
        alert('Signup successful, you can now log in');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {!isLogin && <input name="name" placeholder="Name" onChange={handleChange} required />}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        {!isLogin && (
          <select name="role" onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Signup' : 'Have an account? Login'}
      </button>
    </div>
  );
};

export default Auth;
