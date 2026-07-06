import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, User, MapPin, LogIn, Shield, Users, Car, Map, Menu, X } from 'lucide-react';

const Navbar = () => {
  const user = localStorage.getItem('user');
  
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Zmieniono relative na sticky top-0
  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <MapPin className="text-blue-500" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-green-400">
              FanTracker
            </span>
          </Link>

          {/* Zmieniono md:hidden na lg:hidden */}
          <button 
            onClick={toggleMenu} 
            className="lg:hidden p-2 text-slate-300 hover:text-white focus:outline-none transition-colors"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Zmieniono z md:flex na lg:flex */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/teams" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Shield size={18} /> Drużyny
                </Link>
                <Link to="/matches" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Calendar size={18} /> Terminarz
                </Link>
                <Link to="/trips" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Car size={18} /> Wyjazdy
                </Link>
                <Link to="/map" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Map size={18} /> Mapa
                </Link>
                <Link to="/ranking" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Trophy size={18} /> Ranking
                </Link>
                <Link to="/friends" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Users size={18} /> Znajomi
                </Link>
                <Link to="/profile" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <User size={18} /> Profil
                </Link>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <LogIn size={18} /> Zaloguj się
                </Link>
                <Link to="/register" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700">
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Zmieniono md:hidden na lg:hidden */}
      {isOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 shadow-2xl absolute w-full left-0 top-16 z-40">
          {user ? (
            <div className="flex flex-col gap-4">
              <Link to="/teams" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Shield size={20} /> Drużyny
              </Link>
              <Link to="/matches" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Calendar size={20} /> Terminarz
              </Link>
              <Link to="/trips" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Car size={20} /> Wyjazdy
              </Link>
              <Link to="/map" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Map size={20} /> Mapa
              </Link>
              <Link to="/ranking" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Trophy size={20} /> Ranking
              </Link>
              <Link to="/friends" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <Users size={20} /> Znajomi
              </Link>
              <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 hover:text-blue-400 transition-colors py-2">
                <User size={20} /> Profil
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                <LogIn size={20} /> Zaloguj się
              </Link>
              <Link to="/register" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors border border-slate-700">
                Zarejestruj się
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;