// import React from 'react';
// import WeeklyScheduler from '../components/WeeklyScheduler'; // Adjust the path as necessary

// const ScheduleBuildPage: React.FC = () => {
//     return (
//         <div>
//             <div className="navbar">
//                 <h2 className="site-title">TimeLink</h2>
//                 <div className="auth-buttons">
//                     <button className="profile-button">P</button>
//                 </div>
//             </div>

//             <div className="schedule-content">
//                 <h1 className="page-title">Create Your Schedule</h1>
//             </div>    
//             <div className="schedule-builder">
//                 <WeeklyScheduler />
//             </div>


            
//         </div>
//     );
// }

// export default ScheduleBuildPage;

import React from 'react';
import WeeklyScheduler from '../components/WeeklyScheduler'; // Adjust the path as necessary

const ScheduleBuildPage: React.FC = () => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const firstInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'P';

    return (
        <div>
            <div className="navbar">
                <h2 className="site-title">TimeLink</h2>
                <div className="auth-buttons">
                    <button className="profile-button">{firstInitial}</button>
                </div>
            </div>

            <div className="schedule-content">
                <h1 className="page-title">Create Your Schedule</h1>
            </div>    
            <div className="schedule-builder">
                <WeeklyScheduler />
            </div>
        </div>
    );
}

export default ScheduleBuildPage;
