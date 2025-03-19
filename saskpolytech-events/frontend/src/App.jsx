import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Events from './components/Events';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/events" /> : <Auth setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/events" element={isAuthenticated ? <Events setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
