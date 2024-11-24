import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchedulerView from "../components/SchedulerView.tsx";

const app_name = "wattareyoudoing.us";

function buildPath(route: string): string {
  return process.env.NODE_ENV !== "development"
    ? "http://" + app_name + ":5000/" + route
    : "http://localhost:5000/" + route;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [shareKey, setShareKey] = useState("");
  const [friendKey, setFriendKey] = useState("");

  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
  const firstInitial = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase()
    : "P";

  useEffect(() => {
    fetchShareKey();
    fetchContacts();
  }, []);

  const fetchShareKey = async () => {
    try {
      const response = await fetch(
        buildPath(`api/getShareKey?UserID=${userData.id}`)
      );
      const data = await response.json();
      setShareKey(data.shareKey || "No Key");
    } catch (error) {
      console.error("Error fetching share key:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(buildPath("api/getContacts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: userData.id }), // Send UserID in the body
      });
      const data = await response.json();
      setFriends(data.contacts || []); // Update the state with the contacts list
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await fetch(buildPath("api/addContact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: userData.id, ShareKey: friendKey }), // Use ShareKey instead of contactID
      });
      const data = await response.json();
      if (data.success) {
        alert("Friend added successfully!");
        fetchContacts(); // Refresh the contact list
        setFriendKey(""); // Clear the input field
      } else {
        alert(data.error || "Failed to add friend.");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const [selectedFriend, setSelectedFriend] = useState<any>(null); // Holds the selected friend's details
  const [modalVisible, setModalVisible] = useState(false); // Toggles the modal visibility

  const handleDeleteContact = async () => {
    if (!selectedFriend || !selectedFriend.ShareKey) {
      alert("Error: Contact ShareKey not found.");
      return;
    }

    try {
      const response = await fetch(buildPath("api/deleteContact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID: userData.id,
          ShareKey: selectedFriend.ShareKey,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Contact deleted successfully!");
        fetchContacts(); // Refresh the list of friends
        setModalVisible(false); // Close the modal
      } else {
        alert(data.error || "Failed to delete contact.");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const copyShareKey = () => {
    navigator.clipboard.writeText(shareKey).then(() => {
      alert("Share key copied to clipboard!");
    });
  };

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    navigate("/");
  };

  // Function to redirect to the welcome page
  const redirectToDash = () => {
    navigate("wattareyoudoing.us/dashboard"); // Navigate to the welcome page route
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#f7f7f7",
          padding: "20px",
          borderRight: "1px solid #ddd",
          position: "fixed", // Fix the sidebar to the left
          height: "100vh",
          left: 0,
        }}
      >
        <div>
          <h3>Friends</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {friends.length > 0 ? (
              friends.map((friend: any) => (
                <li
                  key={friend.UserID}
                  onClick={() => {
                    console.log("Selected Friend:", friend); // Debug log
                    setSelectedFriend(friend); // Ensure ShareKey is part of the friend object
                    setModalVisible(true);
                  }}
                  style={{
                    marginBottom: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: "#f7f7f7",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0e0e0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f7f7f7")
                  }
                >
                  {friend.Login}
                </li>
              ))
            ) : (
              <p style={{ fontStyle: "italic", color: "#888" }}>
                No friends found.
              </p>
            )}
          </ul>
        </div>

        <div>
          <h4>Add Friend</h4>
          <input
            type="text"
            value={friendKey}
            onChange={(e) => setFriendKey(e.target.value)}
            placeholder="Enter friend's share key"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleAddFriend}
            style={{
              width: "100%",
              background: "#ff6b6b",
              color: "#fff",
              padding: "8px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Friend
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4>Your Share Key</h4>
          <p
            style={{
              background: "#f0f0f0",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "14px",
              overflowWrap: "break-word",
            }}
          >
            {shareKey}
          </p>
          <button
            onClick={copyShareKey}
            style={{
              background: "#ff6b6b",
              color: "#fff",
              padding: "8px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Copy Share Key
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingLeft: "270px", padding: "20px" }}>
        <div className="navbar">
          <div className="site-title" onClick={redirectToDash}>
            TimeLink
          </div>
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
        <div className="modal">
          <div className="modal-content">
            <h2>
              {selectedFriend.firstName} {selectedFriend.lastName}
            </h2>
            <p>Username: @{selectedFriend.Login}</p>
            <p>Share Key: {selectedFriend.ShareKey}</p> {/* Debugging */}
            <div style={{ display: "flex", gap: "100px", marginTop: "20px" }}>
              <button
                onClick={() =>
                  navigate("/comparing", {
                    state: {
                      UserID: userData.id,
                      FriendID: selectedFriend.UserID,
                    },
                  })
                }
              >
                Compare Schedules
              </button>
              <button onClick={handleDeleteContact}>Delete Contact</button>
            </div>
            <button
              onClick={() => setModalVisible(false)}
              style={{
                marginTop: "20px",
                backgroundColor: "gray",
                color: "white",
                borderRadius: "4px",
                padding: "8px",
                border: "none",
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
