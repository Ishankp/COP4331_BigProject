import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register'; 

const WelcomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
        <h2 className="site-title" onClick={redirectToWelcome}>TimeLink</h2>
        <div className="auth-buttons">
          <button className="login-button" onClick={handleLoginClick}>Login</button>
          <button className="signup-button" onClick={handleRegisterClick}>Sign Up</button>
        </div>
      </div>

      {!showLogin && !showRegister ? (
        <div className="welcome-content">
          <h1 style={{ fontSize: '70px', fontWeight: 'bold', marginBottom: '20px' }}>Welcome to TimeLink!</h1>
          <p
            style={{
              fontSize: '18px',
              color: '#555',
              maxWidth: '600px',
              marginBottom: '30px',
              lineHeight: '1.6',
            }}
          >
            The ultimate tool for effortless weekly schedule comparisons! Whether you're coordinating plans with friends,
            family, or colleagues, our platform makes it simple to share and compare schedules. Build your schedule,
            connect with others, and find the perfect time to meet!
          </p>
          <button className="get-started-button" onClick={handleRegisterClick}>Get Started</button>
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

