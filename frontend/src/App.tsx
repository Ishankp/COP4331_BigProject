import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ScheduleBuildPage from './pages/ScheduleBuildPage';
import DashboardPage from './pages/DashboardPage'; // Import the DashboardPage

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/schedulebuilder" element={<ScheduleBuildPage />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* Add the DashboardPage route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
