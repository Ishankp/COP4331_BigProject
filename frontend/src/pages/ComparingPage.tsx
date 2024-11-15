import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ScheduleComp from '../components/ScheduleComp.tsx';

const ComparingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { UserID, FriendID } = location.state || {}; // Destructure safely

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const firstInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'P';

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    navigate('/');
  };

  // Fallback if UserID or FriendID is not provided
  if (!UserID || !FriendID) {
    return <p>Error: Missing user or friend data. Please try again from the Dashboard.</p>;
  }

  // Convert UserID and FriendID to numbers (if necessary)
  const userID = parseInt(UserID, 10);
  const friendID = parseInt(FriendID, 10);

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <h2 className="site-title">TimeLink</h2>
        <div className="auth-buttons">
          <button className="profile-button" onClick={toggleDropdown}>
            {firstInitial}
          </button>
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Comparison View */}
      <div className="schedule-compare">
        <ScheduleComp userID={userID} friendID={friendID} />
      </div>
    </div>
  );
};

export default ComparingPage;

