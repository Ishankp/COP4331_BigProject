import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Login from "../components/Login";
import Register from "../components/Register";

const WelcomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  // Function to handle the login button click
  const handleLoginClick = () => {
    setShowLogin(true);
    setShowRegister(false); // Ensure only login is shown
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowLogin(false); // Ensure only register is shown
  };

  // Function to redirect to the welcome page
  const redirectToWelcome = () => {
    setShowLogin(false);
    setShowRegister(false); // Navigate to the welcome page route
  };

  return (
    <div>
      <div className="navbar">
        <div className="site-title" onClick={redirectToWelcome}>
          TimeLink
        </div>
        <div className="auth-buttons">
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
          <button className="signup-button" onClick={handleRegisterClick}>
            Sign Up
          </button>
        </div>
      </div>

      {!showLogin && !showRegister ? (
        <div className="welcome-content">
          <h1>Welcome to TimeLink!</h1>
          <p>
            Connect with friends and find the best times to meet by comparing
            your schedules in real time.
          </p>
          <button className="get-started-button">Get Started</button>
        </div>
      ) : showLogin ? (
        <Login /> // Render the Login component when showLogin is true
      ) : (
        <Register /> // Render the Register component when showRegister is true
      )}
    </div>
  );
};

export default WelcomePage;
