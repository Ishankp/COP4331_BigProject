import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface FrontendEvent {
  title: string;
  start: Date; 
  end: Date;   
  location?: string;
  description?: string;
  days?: number[];
}


interface BackendEvent {
  UserID: number;
  event: string;
  desc: string;
  start: string; // Military time as a string, e.g., "1800"
  end: string;   // Military time as a string, e.g., "1900"
  days: number[];
}

const localizer = momentLocalizer(moment);

const WeeklyScheduler: React.FC = () => {
  const secondaryColor = '#ff6b6b';
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userID = userData.id; // Ensure UserID is obtained from localStorage

  const [events, setEvents] = useState<FrontendEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 'Sunday',
    startHour: '5',
    startMinute: '00',
    startAMPM: 'PM',
    endHour: '6',
    endMinute: '00',
    endAMPM: 'PM',
    location: '',
    description: '',
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      day: 'Sunday',
      startHour: '5',
      startMinute: '00',
      startAMPM: 'PM',
      endHour: '6',
      endMinute: '00',
      endAMPM: 'PM',
      location: '',
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const saveEventToBackend = async (event: BackendEvent) => {
    try {
      const response = await fetch('http://localhost:5000/api/addEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event), // Send full event object, including UserID
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  const addEvent = async () => {
    
    // Variables used in Frontend Event
    const selectedDay = moment().day(newEvent.day); 
    const startHour = parseInt(newEvent.startHour) + (newEvent.startAMPM === 'PM' ? 12 : 0);
    const endHour = parseInt(newEvent.endHour) + (newEvent.endAMPM === 'PM' ? 12 : 0);
    const startDate = selectedDay.clone().hour(startHour).minute(parseInt(newEvent.startMinute)).toDate();
    const endDate = selectedDay.clone().hour(endHour).minute(parseInt(newEvent.endMinute)).toDate();
    
    // Convert start and end times to military (24-hour) format strings
    const startHourMT = parseInt(newEvent.startHour) % 12 + (newEvent.startAMPM === 'PM' ? 12 : 0);
    const endHourMT = parseInt(newEvent.endHour) % 12 + (newEvent.endAMPM === 'PM' ? 12 : 0);

    // Format hours and minutes as two-digit strings for military time format
    const formattedStartHour = startHourMT.toString().padStart(2, '0');
    const formattedStartMinute = newEvent.startMinute.padStart(2, '0');
    const formattedEndHour = endHourMT.toString().padStart(2, '0');
    const formattedEndMinute = newEvent.endMinute.padStart(2, '0');

    // Create four-digit military time strings
    const startTime = `${formattedStartHour}${formattedStartMinute}`; // e.g., "1800" for 6:00 PM
    const endTime = `${formattedEndHour}${formattedEndMinute}`; // e.g., "1900" for 7:00 PM

    // Event to be displayed in frontend
    const event: FrontendEvent = {
      title: newEvent.title,
      start: startDate,
      end: endDate,
      location: newEvent.location,
      description: newEvent.description,
    };

    // Update local events state with FrontendEvent
    setEvents([...events, event]);

    // Convert to BackendEvent for backend API call
    const newBackendEvent: BackendEvent = {
      UserID: userID,  
      event: newEvent.title,
      desc: newEvent.description,
      start: startTime,
      end: endTime,
      days: [moment(newEvent.day, 'dddd').day()],
    };

    // Send the new event object to the backend
    await saveEventToBackend(newBackendEvent);
    closeModal();
  };

  const formats = {
    dayFormat: (date: Date) => moment(date).format('ddd'),
  };

  return (
    <div className="schedule-container" style={{ position: 'relative' }}>
      <div className="button-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="add-event-button" onClick={openModal}>
          Add Event
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['week']}
        formats={formats}
        toolbar={false}
        selectable={false}
        startAccessor="start"
        endAccessor="end"
        nowIndicator={false}
        style={{ height: 600 }}
      />

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Event</h2>
            <label>
              Event Name:
              <input type="text" name="title" value={newEvent.title} onChange={handleInputChange} />
            </label>
            <label>
              Day:
              <select name="day" value={newEvent.day} onChange={handleInputChange}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>
            <label>
              Time:
              <div className="time-container">
                <select name="startHour" value={newEvent.startHour} onChange={handleInputChange}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
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
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
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
              Location:
              <input type="text" name="location" value={newEvent.location} onChange={handleInputChange} />
            </label>
            <label>
              Description:
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} />
            </label>
            <div className="button-container">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={addEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduler;
