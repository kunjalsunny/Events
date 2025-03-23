import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import Events from "./components/Events";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="w-full bg-primary text-primary-foreground">
          <div className="container mx-auto">
            <Navbar
              setIsAuthenticated={setIsAuthenticated}
              authenticated={isAuthenticated}
            />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="w-full flex items-center justify-center">
            <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden w-full md:max-w-4xl">
              <Routes>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/events" />
                    ) : (
                      <Auth setIsAuthenticated={setIsAuthenticated} />
                    )
                  }
                />
                <Route
                  path="/events"
                  element={isAuthenticated ? <Events /> : <Navigate to="/" />}
                />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
