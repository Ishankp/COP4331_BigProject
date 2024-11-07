import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

// import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ScheduleBuildPage from './pages/ScheduleBuildPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/cards" element={<ScheduleBuildPage />} />
      </Routes>
    </BrowserRouter>
      );
}

export default App;
