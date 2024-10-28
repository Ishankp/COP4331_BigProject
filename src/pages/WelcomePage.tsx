// import React from 'react';

// const WelcomePage = () => {
//   return (
//       <div className="full-height">
//           <div className="navbar">
//               <h2 className="site-title">TimeLink</h2>
//               <div className="auth-buttons">
//                   <button className="login-button">Login</button>
//                   <button className="signup-button">Sign Up</button>
//               </div>
//           </div>

//           <div className="welcome-content">
//               <h1>Welcome to TimeLink!</h1>
//               <p>Connect with friends and find the best times to meet by comparing your schedules in real time.</p>
//               <button className="get-started-button">Get Started</button>
//           </div>
//       </div>
//   );
// }

// export default WelcomePage;
import React, { useState } from 'react';
import Login from '../components/Login'; // Make sure the path to Login.tsx is correct

const WelcomePage = () => {
  const [showLogin, setShowLogin] = useState(false);

  // Function to handle the login button click
  const handleLoginClick = () => {
    setShowLogin(true); // Set showLogin to true to display the Login component
  };

  return (
    <div>
      <div className="navbar">
        <h2 className="site-title">TimeLink</h2>
        <div className="auth-buttons">
          <button className="login-button" onClick={handleLoginClick}>Login</button>
          <button className="signup-button">Sign Up</button>
        </div>
      </div>

      {/* Conditionally render the Welcome content or Login component */}
      {!showLogin ? (
        <div className="welcome-content">
          <h1>Welcome to TimeLink!</h1>
          <p>Connect with friends and find the best times to meet by comparing your schedules in real time.</p>
          <button className="get-started-button">Get Started</button>
        </div>
      ) : (
        <Login /> // Render the Login component when showLogin is true
      )}
    </div>
  );
};

export default WelcomePage;


