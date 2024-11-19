import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface CombinedEvent {
  eventID: string;
  event: string;
  desc: string;
  start: Date;
  end: Date;
  userID: number;
}

const localizer = momentLocalizer(moment);

interface ScheduleCompProps {
  userID: number; // Current user's ID
  friendID: number; // Friend's ID
}

const ScheduleComp: React.FC<ScheduleCompProps> = ({ userID, friendID }) => {
  const primaryColor = '#FF6B6B'; // Current user's color
  const secondaryColor = '#4ECDC4'; // Friend's color
  const navigate = useNavigate(); // Use navigate for routing

  const app_name = 'wattareyoudoing.us';

  function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
      ? 'http://' + app_name + ':5000/' + route
      : 'http://localhost:5000/' + route;
  }

  const [events, setEvents] = useState<CombinedEvent[]>([]);
  const [friendUsername, setFriendUsername] = useState<string>(''); // Friend's username

  useEffect(() => {
    fetchEvents();
    fetchFriendUsername();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(buildPath('api/getCombinedEvents'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userID, FriendID: friendID }),
      });

      const data = await response.json();
      if (data.events) {
        const formattedEvents = data.events.flatMap((event: any) =>
          event.days.map((day: number) => ({
            eventID: event.eventID,
            title: event.event,
            start: convertToDateTime(event.start, day),
            end: convertToDateTime(event.end, day),
            description: event.desc,
            userID: event.userID,
          }))
        );
        setEvents(formattedEvents);
      } else {
        console.error('No events found:', data.error);
      }
    } catch (error) {
      console.error('Error fetching combined events:', error);
    }
  };

  const fetchFriendUsername = async () => {
    try {
      const response = await fetch(buildPath('api/getContacts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userID }),
      });

      const data = await response.json();
      if (data.contacts) {
        const friend = data.contacts.find((contact: any) => contact.UserID === friendID);
        if (friend) {
          setFriendUsername(friend.Login); // Set the friend's username
        } else {
          console.error('Friend not found in contacts.');
        }
      } else {
        console.error('Failed to fetch contacts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const convertToDateTime = (time: string, day: number): Date => {
    const hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(2));
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + day);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const eventPropGetter = (event: CombinedEvent) => {
    const backgroundColor = event.userID === friendID ? secondaryColor : primaryColor;
    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        border: 'none',
        opacity: 0.9,
      },
    };
  };

  const formats = {
    dayFormat: (date: Date) => moment(date).format('ddd'),
  };

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Dynamic Title */}
      <h2>Comparing Schedules with {friendUsername || 'your friend'}</h2>

      {/* Done Button */}
      <button
        onClick={() => navigate('/dashboard')} // Redirect to DashboardPage
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'white', // White background
          color: primaryColor, // Secondary color for text
          border: `3px solid ${primaryColor}`, // Border in secondary color
          padding: '8px 16px', // Padding for a comfortable click area
          borderRadius: '5px', // Rounded corners
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Done
      </button>

      {/* Color Key */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: primaryColor,
              borderRadius: '50%',
              marginRight: '8px',
            }}
          ></div>
          <span>Your Schedule</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: secondaryColor,
              borderRadius: '50%',
              marginRight: '8px',
            }}
          ></div>
          <span>{friendUsername || "Friend's Schedule"}</span>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['week']}
        toolbar={false}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 520 }}
        eventPropGetter={eventPropGetter}
        formats={formats}
      />
    </div>
  );
};

export default ScheduleComp;


