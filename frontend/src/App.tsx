import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import WelcomePage from './pages/WelcomePage';
import ScheduleBuildPage from './pages/ScheduleBuildPage';
import DashboardPage from './pages/DashboardPage'; // Import the DashboardPage
import ComparingPage from "./pages/ComparingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/schedulebuilder" element={<ScheduleBuildPage />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* Add the DashboardPage route */}
        <Route path="/comparing" element={<ComparingPage />} /> {/* Add the DashboardPage route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
