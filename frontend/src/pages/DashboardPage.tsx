// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const DashboardPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [dropdownVisible, setDropdownVisible] = useState(false); // Track dropdown visibility

//   // Retrieve user data from localStorage
//   const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
//   const firstInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'P';

//   // Toggle dropdown visibility
//   const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('user_data'); // Clear user data from localStorage
//     navigate('/'); // Redirect to login page
//   };

//   return (
//     <div>
//       <div className="navbar">
//         <h2 className="site-title">TimeLink</h2>
//         <div className="auth-buttons">
//           <button className="profile-button" onClick={toggleDropdown}>
//             {firstInitial}
//           </button>
//           {dropdownVisible && (
//             <div className="dropdown-menu">
//               <button className="dropdown-item" onClick={handleLogout}>Logout</button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="schedule-content">
//         <h1 className="page-title">Dashboard</h1>
//       </div>
//       <div className="schedule-builder"></div>

//     </div>
//   );
// };

// export default DashboardPage;






import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SchedulerView from '../components/SchedulerView.tsx'; 
// import WeeklyScheduler from '../components/WeeklyScheduler.tsx'; 

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [shareKey, setShareKey] = useState('');
  const [friendKey, setFriendKey] = useState('');

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const firstInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'P';

  useEffect(() => {
    fetchShareKey();
    fetchFriends();
  }, []);

  const fetchShareKey = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getShareKey?UserID=${userData.id}`);
      const data = await response.json();
      setShareKey(data.shareKey || 'No Key');
    } catch (error) {
      console.error('Error fetching share key:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getFriends?UserID=${userData.id}`);
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/addContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userData.id, contactID: friendKey }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Friend added successfully!');
        fetchFriends();
        setFriendKey('');
      } else {
        alert(data.error || 'Failed to add friend.');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const copyShareKey = () => {
    navigator.clipboard.writeText(shareKey).then(() => {
      alert('Share key copied to clipboard!');
    });
  };

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background: '#f7f7f7',
          padding: '20px',
          borderRight: '1px solid #ddd',
          position: 'fixed', // Fix the sidebar to the left
          height: '100vh',
          left: 0,
        }}
      >
        <h3>Friends</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {friends.map((friend: any) => (
            <li key={friend.id} style={{ marginBottom: '10px' }}>
              {friend.name}
            </li>
          ))}
        </ul>

        <div>
          <h4>Add Friend</h4>
          <input
            type="text"
            value={friendKey}
            onChange={(e) => setFriendKey(e.target.value)}
            placeholder="Enter friend's share key"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={handleAddFriend}
            style={{
              width: '100%',
              background: '#ff6b6b',
              color: '#fff',
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Friend
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>Your Share Key</h4>
          <p
            style={{
              background: '#f0f0f0',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '14px',
              overflowWrap: 'break-word',
            }}
          >
            {shareKey}
          </p>
          <button
            onClick={copyShareKey}
            style={{
              background: '#ff6b6b',
              color: '#fff',
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Copy Share Key
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingLeft: '270px', padding: '20px' }}>
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


      </div>
      <div className="schedule-view">
          <SchedulerView />
      </div>
    </div>
  );
};

export default DashboardPage;
