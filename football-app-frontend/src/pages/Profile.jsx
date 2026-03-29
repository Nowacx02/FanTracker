import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, MapPin, Calendar, Trophy, Clock, LogOut, Shield } from 'lucide-react'; // Dodano Shield!

const Profile = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get(`http://localhost:8080/api/checkins/user/${currentUser.id}`)
      .then(response => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Błąd pobierania historii:", error);
        setLoading(false);
      });
  }, [currentUser.id]);

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Wczytywanie profilu... ⏳</div>;
  }

  const totalMatches = history.length;
  const uniqueCities = new Set(history.map(item => item.city)).size;

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    window.location.href = '/login'; 
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* Karta z Nagłówkiem Profilu */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* LEWA STRONA: Awatar, dane, wylogowanie */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 text-center sm:text-left">
          <div className="bg-slate-800 p-4 rounded-full border border-slate-700 shrink-0">
            <User size={64} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">{currentUser.username}</h2>
            <p className="text-slate-400 mt-1 mb-4">ID Kibica w bazie: #{currentUser.id}</p>

            <button 
                onClick={handleLogout}
                className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-red-900/40 hover:bg-red-600 text-red-500 hover:text-white border border-red-800/50 hover:border-red-600 rounded-xl font-medium transition-all w-full sm:w-auto">
                <LogOut size={18} /> Wyloguj się
            </button>
          </div>
        </div>

        {/* PRAWA STRONA: Ulubiona drużyna */}
        {currentUser.favoriteTeam && (
          <div className="flex items-center gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 w-full md:w-auto justify-center md:justify-end shrink-0 shadow-inner">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-2">Ulubiona drużyna</p>
              <p className="text-xl font-bold text-white leading-tight max-w-[150px] md:max-w-[200px] break-words">
                {currentUser.favoriteTeam.name}
              </p>
            </div>
            {currentUser.favoriteTeam.badgeUrl ? (
              <img src={currentUser.favoriteTeam.badgeUrl} alt="Herb" className="w-16 h-16 object-contain drop-shadow-lg shrink-0" />
            ) : (
               <Shield className="text-blue-500 w-14 h-14 shrink-0" />
            )}
          </div>
        )}
      </div>

      {/* Karty ze Statystykami */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ... Zawartość bez zmian ... */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="bg-blue-900/30 p-4 rounded-lg text-blue-500">
            <Trophy size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Zaliczone Wyjazdy</p>
            <p className="text-3xl font-bold text-white">{totalMatches}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="bg-green-900/30 p-4 rounded-lg text-green-500">
            <MapPin size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Odwiedzone Miasta</p>
            <p className="text-3xl font-bold text-white">{uniqueCities}</p>
          </div>
        </div>
      </div>

      {/* Sekcja: Historia Wyjazdów (Oś Czasu) */}
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="text-blue-500" /> Historia Obecności na Stadionach
      </h3>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-slate-900 p-6 rounded-xl text-center text-slate-500 border border-slate-800">
            Konto świeci pustkami. Czas ruszyć w trasę i zaliczyć pierwszy wyjazd!
          </div>
        ) : (
          history.map((item, index) => (
            <div 
              key={index} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-500/50 transition-colors shadow-sm"
            >
              <div>
                <div className="text-sm text-blue-400 font-bold mb-1 uppercase tracking-wide">
                  Kolejka {item.round}
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {item.matchTitle}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {item.city}</span>
                </div>
              </div>
              
              <div className="text-right border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Data zameldowania</div>
                <div className="flex items-center justify-end gap-1 text-slate-300">
                  <Clock size={16} /> 
                  {new Date(item.date).toLocaleString('pl-PL', {
                    day: '2-digit', month: '2-digit', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;