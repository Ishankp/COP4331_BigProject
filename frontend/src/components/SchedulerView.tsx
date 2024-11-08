// import React, { useState, useEffect } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// interface FrontendEvent {
//   eventID: string;
//   title: string;
//   start: Date;
//   end: Date;
//   location?: string;
//   description?: string;
//   days?: number[];
// }

// const localizer = momentLocalizer(moment);

// const SchedulerView: React.FC = () => {
//   const secondaryColor = '#ff6b6b';

//   const eventPropGetter = (event: FrontendEvent) => ({
//     style: {
//       backgroundColor: secondaryColor,
//       color: 'white',
//       borderRadius: '5px',
//       border: 'none',
//       opacity: 0.9,
//     },
//   });

//   const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
//   const userID = userData.id;

//   const [events, setEvents] = useState<FrontendEvent[]>([]);

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   const loadEvents = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/viewEvent', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ UserID: userID }),
//       });

//       const data = await response.json();
//       if (data.events && data.events.length > 0) {
//         const loadedEvents: FrontendEvent[] = data.events.flatMap((event: any) => {
//           const startHour = parseInt(event.start.slice(0, 2));
//           const startMinute = parseInt(event.start.slice(2));
//           const endHour = parseInt(event.end.slice(0, 2));
//           const endMinute = parseInt(event.end.slice(2));

//           return event.days.map((dayIndex: number) => {
//             const startDate = new Date(moment().day(dayIndex).hour(startHour).minute(startMinute).toISOString());
//             const endDate = new Date(moment().day(dayIndex).hour(endHour).minute(endMinute).toISOString());

//             return {
//               eventID: event.eventID,
//               title: event.event,
//               start: startDate,
//               end: endDate,
//               location: event.desc,
//               description: event.desc,
//               days: event.days,
//             };
//           });
//         });
//         setEvents(loadedEvents);
//       } else {
//         console.error('No events found:', data.error);
//       }
//     } catch (error) {
//       console.error('Error loading events:', error);
//     }
//   };

//   const formats = {
//     dayFormat: (date: Date) => moment(date).format('ddd'),
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <Calendar
//         localizer={localizer}
//         events={events}
//         defaultView="week"
//         views={['week']}
//         toolbar={false}
//         startAccessor="start"
//         endAccessor="end"
//         style={{ height: 500 }}
//         eventPropGetter={eventPropGetter}
//         formats={formats}
//       />
//     </div>
//   );
// };

// export default SchedulerView;


import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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

const localizer = momentLocalizer(moment);

const SchedulerView: React.FC = () => {
  const secondaryColor = '#ff6b6b';
  const navigate = useNavigate(); // Initialize navigate function

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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/viewEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserID: userID }),
      });

      const data = await response.json();
      if (data.events && data.events.length > 0) {
        const loadedEvents: FrontendEvent[] = data.events.flatMap((event: any) => {
          const startHour = parseInt(event.start.slice(0, 2));
          const startMinute = parseInt(event.start.slice(2));
          const endHour = parseInt(event.end.slice(0, 2));
          const endMinute = parseInt(event.end.slice(2));

          return event.days.map((dayIndex: number) => {
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

  const handleEditSchedule = () => {
    navigate('/schedule-build'); // Redirect to the ScheduleBuildPage
  };

  const formats = {
    dayFormat: (date: Date) => moment(date).format('ddd'),
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h2 style={{ margin: 0, color: secondaryColor }}>My Schedule</h2>
        <button
          onClick={handleEditSchedule}
          style={{
            backgroundColor: 'white',
            color: secondaryColor,
            border: `2px solid ${secondaryColor}`,
            padding: '8px 16px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Edit Schedule
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
        style={{ height: 450 }}
        eventPropGetter={eventPropGetter}
        formats={formats}
      />
    </div>
  );
};

export default SchedulerView;

