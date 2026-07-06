import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Matches from './pages/Matches';
import MatchDetails from './pages/MatchDetails';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Teams from './pages/Teams';
import Register from './pages/Register';
import Friends from './pages/Friends';
import Trips from './pages/Trips';
import TripMap from './pages/TripMap';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/matches" replace />} />

          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/matches/:id" element={<ProtectedRoute><MatchDetails /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><TripMap /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;