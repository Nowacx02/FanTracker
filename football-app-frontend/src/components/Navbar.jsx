import { Link } from 'react-router-dom';
import { Trophy, Calendar, User, MapPin, LogIn, Shield} from 'lucide-react';

const Navbar = () => {
  const user = localStorage.getItem('user');

  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <MapPin className="text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              FanTracker
            </span>
          </Link>

          {/* Linki warunkowe - pokazujemy je tylko, jeśli user istnieje */}
          {user ? (
            <div className="flex gap-6">
              <Link to="/teams" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <Shield size={18} /> Drużyny
              </Link>
              <Link to="/matches" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <Calendar size={18} /> Terminarz
              </Link>
              <Link to="/ranking" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                < Trophy size={18} /> Ranking
              </Link>
              <Link to="/profile" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <User size={18} /> Profil
              </Link>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <LogIn size={18} /> Zaloguj się
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;