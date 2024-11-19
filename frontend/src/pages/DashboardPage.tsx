import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SchedulerView from '../components/SchedulerView.tsx'; 
import {buildPath} from "../helpers/HelperFunctions";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [ShareKey, setShareKey] = useState('');
  const [friendKey, setFriendKey] = useState('');

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const firstInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'P';



  useEffect(() => {
    if (userData?.ShareKey) {
      setShareKey(userData.ShareKey); // Set share key from local storage
    }
    fetchContacts();
  }, []);



  const fetchContacts = async () => {
    try {
        const response = await fetch(buildPath('api/getContacts'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ UserID: userData.id }), // Send UserID in the body
        });
        const data = await response.json();
        setFriends(data.contacts || []); // Update the state with the contacts list
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
};



const handleAddFriend = async () => {
  try {
      const response = await fetch(buildPath('api/addContact'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ UserID: userData.id, ShareKey: friendKey }), // Use ShareKey instead of contactID
      });
      const data = await response.json();
      if (data.success) {
          alert('Friend added successfully!');
          fetchContacts(); // Refresh the contact list
          setFriendKey(''); // Clear the input field
      } else {
          alert(data.error || 'Failed to add friend.');
      }
  } catch (error) {
      console.error('Error adding friend:', error);
  }
};



const [selectedFriend, setSelectedFriend] = useState<any>(null); // Holds the selected friend's details
const [modalVisible, setModalVisible] = useState(false); // Toggles the modal visibility



const handleDeleteContact = async () => {
  if (!selectedFriend || !selectedFriend.ShareKey) {
    alert('Error: Contact ShareKey not found.');
    return;
  }

  try {
    const response = await fetch(buildPath('api/deleteContact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserID: userData.id, ShareKey: selectedFriend.ShareKey }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Contact deleted successfully!');
      fetchContacts(); // Refresh the list of friends
      setModalVisible(false); // Close the modal
    } else {
      alert(data.error || 'Failed to delete contact.');
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
};



const copyShareKey = async () => {
  try {
    if (ShareKey && ShareKey !== 'No Key' && ShareKey !== 'Error') {
      await navigator.clipboard.writeText(ShareKey);
      alert('Share key copied to clipboard!');
    } else {
      alert('No valid share key available to copy.');
    }
  } catch (error) {
    console.error('Failed to copy share key:', error);
    alert('Failed to copy share key. Please try again.');
  }
};



  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);



  const handleLogout = () => {
    localStorage.removeItem('user_data');
    navigate('/');
  };



  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background: '#f7f7f7',
          padding: '30px',
          borderRight: '1px solid #ddd',
          position: 'fixed',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          left: '0',
        }}
      >
        {/* Friends List Section */}
        <div style={{ overflowY: 'auto', flexGrow: 1}}>
          <h3>Friends</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {friends.length > 0 ? (
              friends.map((friend: any) => (
                <li
                  key={friend.UserID}
                  onClick={() => {
                    setSelectedFriend(friend);
                    setModalVisible(true);
                  }}
                  style={{
                    marginBottom: '10px',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#FF6B6B',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a44343')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
                >
                  {friend.Login}
                </li>
              ))
            ) : (
              <p style={{ fontStyle: 'italic', color: '#888' }}>No friends found.</p>
            )}
          </ul>
        </div>

        {/* Bottom Section for Adding Friends and Share Key */}
        <div style={{ paddingTop: '20px', borderRadius: '8px', border: '3px solid #ff6b6b', marginBottom: '20px' }}>
          <div>
            <h4>Add Friend</h4>
            <input
              type="text"
              value={friendKey}
              onChange={(e) => setFriendKey(e.target.value)}
              placeholder="Enter friend's share key"
              style={{
                width: '90%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
            <button
              onClick={handleAddFriend}
              style={{
                width: '75%',
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

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
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
              {ShareKey}
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
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingLeft: '0px', padding: '10px' }}>
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


      {modalVisible && selectedFriend && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              width: '400px',
              maxWidth: '90%', // Make it responsive
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              textAlign: 'center', // Center align text content
            }}
          >
            <h2 style={{ marginBottom: '10px', color: '#333' }}>
              {selectedFriend.firstName} {selectedFriend.lastName}
            </h2>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              <strong>Username:</strong> @{selectedFriend.Login}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              <strong>Share Key:</strong> {selectedFriend.ShareKey}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() =>
                  navigate('/comparing', {
                    state: { UserID: userData.id, FriendID: selectedFriend.UserID },
                  })
                }
                style={{
                  backgroundColor: '#FF6B6B',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: '1',
                  marginRight: '10px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a44343')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
              >
                Compare Schedules
              </button>
              <button
                onClick={handleDeleteContact}
                style={{
                  backgroundColor: '#FF6B6B',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: '1',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a44343')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
              >
                Delete Contact
              </button>
            </div>

            <button
              onClick={() => setModalVisible(false)}
              style={{
                marginTop: '20px',
                backgroundColor: 'gray',
                color: 'white',
                borderRadius: '5px',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}


    </div>
  );
};


export default DashboardPage;

