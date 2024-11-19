import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


interface FrontendEvent {
  eventID: string;
  title: string;
  start: Date; 
  end: Date;   
  location?: string;
  description?: string;
  days?: number[];
}

interface BackendEvent {
  eventID: string;
  UserID: number;
  event: string;
  desc: string;
  start: string;
  end: string;
  days: number[];
}

interface UpdateEventPayload {
  eventID: string;
  UserID: number;
  newEvent: string;
  newDesc: string;
  newStart: string;
  newEnd: string;
  newDays: number[];
}


const localizer = momentLocalizer(moment);

const WeeklyScheduler: React.FC = () => {
  const secondaryColor = '#ff6b6b';
  const navigate = useNavigate(); // Initialize navigate function

  const app_name = 'wattareyoudoing.us';

  function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
      ? 'http://' + app_name + ':5000/' + route
      : 'http://localhost:5000/' + route;
  }

  const eventPropGetter = (/*event: FrontendEvent*/) => ({
    style: {
      backgroundColor: secondaryColor,
      color: 'white',
      borderRadius: '5px',
      border: 'none',
      opacity: 0.9,
    },
  });

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userID = userData.id;

  const [events, setEvents] = useState<FrontendEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FrontendEvent | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startHour: '5',
    startMinute: '00',
    startAMPM: 'PM',
    endHour: '6',
    endMinute: '00',
    endAMPM: 'PM',
    location: '',
    description: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(buildPath('api/viewEvent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserID: userID }),
      });
  
      const data = await response.json();
      if (data.events && data.events.length > 0) {
        const loadedEvents: FrontendEvent[] = data.events.flatMap((event: BackendEvent) => {
          const startHour = parseInt(event.start.slice(0, 2));
          const startMinute = parseInt(event.start.slice(2));
          const endHour = parseInt(event.end.slice(0, 2));
          const endMinute = parseInt(event.end.slice(2));
  
          return event.days.map(dayIndex => {
            const startDate = new Date(moment().day(dayIndex).hour(startHour).minute(startMinute).toISOString());
            const endDate = new Date(moment().day(dayIndex).hour(endHour).minute(endMinute).toISOString());
  
            return {
              eventID: event.eventID,
              title: event.event,
              start: startDate,
              end: endDate,
              location: event.desc,
              description: event.desc,
              days: event.days,
            };
          });
        });
        setEvents(loadedEvents);
      } else {
        console.error('No events found:', data.error);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      startHour: '5',
      startMinute: '00',
      startAMPM: 'PM',
      endHour: '6',
      endMinute: '00',
      endAMPM: 'PM',
      location: '',
      description: '',
    });
    setSelectedEvent(null);
    setSelectedDays([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prevDays =>
      prevDays.includes(dayIndex) ? prevDays.filter(day => day !== dayIndex) : [...prevDays, dayIndex]
    );
  };

  const saveEventToBackend = async (event: BackendEvent) => {
    try {
      const response = await fetch(buildPath('api/addEvent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEventInBackend = async (event: UpdateEventPayload) => {
    try {
      const response = await fetch(buildPath('api/updateEvent'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async () => {
    if (!selectedEvent) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete the event: ${selectedEvent.title}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(buildPath('api/deleteEvent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserID: userID, eventID: selectedEvent.eventID }),
      });
  
      const data = await response.json();
      if (data.success) {
        setEvents(events.filter(e => e.eventID !== selectedEvent.eventID));
        closeModal();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Server error. Could not delete event.');
    }
  };

  const onSelectEvent = (event: FrontendEvent) => {
    setSelectedEvent(event);
  
    // Convert start time to 12-hour format
    const startHour24 = moment(event.start).hour();
    const startMinute = moment(event.start).minute();
    const startAMPM = startHour24 >= 12 ? 'PM' : 'AM';
    const startHour12 = startHour24 % 12 === 0 ? 12 : startHour24 % 12; // Convert 0 to 12 for 12-hour format
  
    // Convert end time to 12-hour format
    const endHour24 = moment(event.end).hour();
    const endMinute = moment(event.end).minute();
    const endAMPM = endHour24 >= 12 ? 'PM' : 'AM';
    const endHour12 = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
  
    setNewEvent({
      title: event.title,
      startHour: startHour12.toString(),
      startMinute: startMinute.toString().padStart(2, '0'),
      startAMPM,
      endHour: endHour12.toString(),
      endMinute: endMinute.toString().padStart(2, '0'),
      endAMPM,
      location: event.location || '',
      description: event.description || '',
    });
  
    setSelectedDays(event.days || []);
    openModal();
  };
  

  const addOrUpdateEvent = async () => {
    const startHour = parseInt(newEvent.startHour) % 12 + (newEvent.startAMPM === 'PM' ? 12 : 0);
    const endHour = parseInt(newEvent.endHour) % 12 + (newEvent.endAMPM === 'PM' ? 12 : 0);
    const startTime = `${startHour.toString().padStart(2, '0')}${newEvent.startMinute.padStart(2, '0')}`;
    const endTime = `${endHour.toString().padStart(2, '0')}${newEvent.endMinute.padStart(2, '0')}`;
  
    if (selectedEvent) {
      // Update each selected day's event individually
      const updatePromises = selectedDays.map(async (day) => {
        const updateEventData: UpdateEventPayload = {
          eventID: selectedEvent.eventID,
          UserID: userID,
          newEvent: newEvent.title,
          newDesc: newEvent.description,
          newStart: startTime,
          newEnd: endTime,
          newDays: [day],
        };
  
        try {
          const response = await updateEventInBackend(updateEventData);
          if (!response.success) {
            console.error(`Failed to update event for day ${day}:`, response.error);
            return false;
          }
          return true;
        } catch (error) {
          console.error('Error updating event:', error);
          return false;
        }
      });
  
      const results = await Promise.all(updatePromises);
      if (results.every(success => success)) {
        console.log('All events updated successfully.');
        loadEvents();
        closeModal();
      } else {
        alert('Some events failed to update. Please check the console for details.');
      }
    } else {
      // Create a separate event for each selected day
      const createPromises = selectedDays.map(async (day) => {
        const addEventData: BackendEvent = {
          eventID: uuidv4(), // New unique ID for each day/event
          UserID: userID,
          event: newEvent.title,
          desc: newEvent.description,
          start: startTime,
          end: endTime,
          days: [day], // Single day for each new event
        };
  
        try {
          const response = await saveEventToBackend(addEventData);
          if (!response.success) {
            console.error(`Failed to save event for day ${day}:`, response.error);
            return false;
          }
          return true;
        } catch (error) {
          console.error(`Error saving event for day ${day}:`, error);
          return false;
        }
      });
  
      const results = await Promise.all(createPromises);
      if (results.every(success => success)) {
        console.log('All events created successfully.');
        loadEvents();
        closeModal();
      } else {
        alert('Some events failed to save. Please check the console for details.');
      }
    }
  };
  
  
  

  const formats = {
    dayFormat: (date: Date) => moment(date).format('ddd'),
  };



  const handleFinish = () => {
    navigate('/dashboard'); // Redirect to the DashboardPage path
  };

  return (
    <div className="schedule-container" style={{ position: 'relative' }}>
      <h2 style={{color: secondaryColor, textAlign: 'left' }}>Create Your Schedule</h2>
      <div className="button-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="add-event-button" onClick={openModal} style={{ marginRight: '10px' }}>
          Add Event
        </button>
        <button
          className="finish-button"
          onClick={handleFinish}
          style={{
            backgroundColor: 'white', // White background
            color: secondaryColor, // Secondary color for text
            border: `2px solid ${secondaryColor}`, // Border in secondary color
            padding: '8px 16px', // Padding for a comfortable click area
            borderRadius: '5px', // Rounded corners
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Finish
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['week']}
        toolbar={false}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        formats={formats}
      />

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <label>
              Event Name:
              <input type="text" name="title" value={newEvent.title} onChange={handleInputChange} />
            </label>
            <label>
              Days:
              <div className="day-selection">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    className={`day-button ${selectedDays.includes(index) ? 'selected' : ''}`}
                    onClick={() => handleDayToggle(index)}
                    style={{
                      padding: '8px 12px',
                      margin: '4px',
                      borderRadius: '6px',
                      border: selectedDays.includes(index) ? '2px solid #ff6b6b' : '2px solid #ccc',
                      backgroundColor: selectedDays.includes(index) ? '#ff6b6b' : '#f0f0f0',
                      color: selectedDays.includes(index) ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.1s',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </label>
            <label>
              Time:
              <div className="time-container">
                <select name="startHour" value={newEvent.startHour} onChange={handleInputChange}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                :
                <select name="startMinute" value={newEvent.startMinute} onChange={handleInputChange}>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <select name="startAMPM" value={newEvent.startAMPM} onChange={handleInputChange}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                -
                <select name="endHour" value={newEvent.endHour} onChange={handleInputChange}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                :
                <select name="endMinute" value={newEvent.endMinute} onChange={handleInputChange}>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <select name="endAMPM" value={newEvent.endAMPM} onChange={handleInputChange}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </label>
            <label>
              Description:
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} />
            </label>
            <div className="button-container">
              <button onClick={closeModal}>Cancel</button>
              {selectedEvent && (
                <button onClick={deleteEvent} style={{ backgroundColor: 'red', color: 'white' }}>
                  Delete
                </button>
              )}
              <button onClick={addOrUpdateEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduler;
