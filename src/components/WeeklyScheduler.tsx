import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CustomEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}

const localizer = momentLocalizer(moment);

const initialEvents: CustomEvent[] = [];

const WeeklyScheduler: React.FC = () => {
  const secondaryColor = '#ff6b6b'; // Replace with your secondary color

  const eventStyleGetter = (event: any, start: any, end: any, isSelected: boolean) => {
    return {
      style: {
        backgroundColor: secondaryColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };


  const [events, setEvents] = useState<CustomEvent[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 'Sunday',
    startHour: '12',
    startMinute: '00',
    startAMPM: 'AM',
    endHour: '12',
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
  

  const addEvent = () => {
    const selectedDay = moment().day(newEvent.day); // Set to the selected day of the current week
    const startHour = parseInt(newEvent.startHour) + (newEvent.startAMPM === 'PM' ? 12 : 0);
    const endHour = parseInt(newEvent.endHour) + (newEvent.endAMPM === 'PM' ? 12 : 0);

    const startDate = selectedDay.clone().hour(startHour).minute(parseInt(newEvent.startMinute)).toDate();
    const endDate = selectedDay.clone().hour(endHour).minute(parseInt(newEvent.endMinute)).toDate();

    const event: CustomEvent = {
      title: newEvent.title,
      start: startDate,
      end: endDate,
      location: newEvent.location,
      description: newEvent.description,
    };

    setEvents([...events, event]);
    closeModal();
  };

  const formats = {
    dayFormat: (date: Date) => moment(date).format('ddd'), // Show day name only (e.g., "Sun")
  };

  return (
    <div className="schedule-container" style={{ position: 'relative' }}>
      {/* Add Event Button Container Above the Calendar */}
      <div className="button-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {/* <button
          onClick={openModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Event
        </button> */}
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
        eventPropGetter={eventStyleGetter} // Apply custom styles to events
      />

      {/* Modal for Adding Event */}
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

