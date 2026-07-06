import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, MapPin, Calendar, Trophy, Clock, LogOut, Shield, Camera, Trash2, Award, Star, Compass, Car, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState({ totalMatches: 0, uniqueStadiums: 0, uniqueTeams: 0, totalDistance: 0 });
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (currentUser?.id) {
      Promise.all([
        axios.get(`http://localhost:8080/api/checkins/user/${currentUser.id}`),
        axios.get(`http://localhost:8080/api/achievements/${currentUser.id}`)
      ])
      .then(([historyRes, achRes]) => {
        setHistory(historyRes.data);
        setAchievements(achRes.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
    }
  }, [currentUser?.id]);

  const handleDeleteCheckIn = (e, checkInId) => {
    e.preventDefault(); 
    
    if (window.confirm("Czy na pewno chcesz usunąć to zameldowanie z historii?")) {
      axios.delete(`http://localhost:8080/api/checkins/${checkInId}`)
        .then(() => {
          setHistory(prevHistory => prevHistory.filter(item => item.id !== checkInId));
        })
        .catch(err => console.error(err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    window.location.href = '/login'; 
  };

  const getBadgeData = (type, count) => {
    if (type === 'matches') {
      if (count >= 50) return { name: "Weteran (Złoto)", level: 3, max: 50, color: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500/50" };
      if (count >= 10) return { name: "Stały Bywalec (Srebro)", level: 2, max: 50, color: "text-slate-300", bg: "bg-slate-300", border: "border-slate-400/50" };
      if (count >= 1) return { name: "Kibic (Brąz)", level: 1, max: 10, color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/50" };
      return { name: "Brak odznaki", level: 0, max: 1, color: "text-slate-600", bg: "bg-slate-600", border: "border-slate-800" };
    }
    if (type === 'stadiums') {
      if (count >= 20) return { name: "Groundhopper (Złoto)", level: 3, max: 20, color: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500/50" };
      if (count >= 5) return { name: "Podróżnik (Srebro)", level: 2, max: 20, color: "text-slate-300", bg: "bg-slate-300", border: "border-slate-400/50" };
      if (count >= 1) return { name: "Turysta (Brąz)", level: 1, max: 5, color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/50" };
      return { name: "Brak odznaki", level: 0, max: 1, color: "text-slate-600", bg: "bg-slate-600", border: "border-slate-800" };
    }
    if (type === 'teams') {
      if (count >= 30) return { name: "Scout (Złoto)", level: 3, max: 30, color: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500/50" };
      if (count >= 10) return { name: "Ekspert (Srebro)", level: 2, max: 30, color: "text-slate-300", bg: "bg-slate-300", border: "border-slate-400/50" };
      if (count >= 2) return { name: "Obserwator (Brąz)", level: 1, max: 10, color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/50" };
      return { name: "Brak odznaki", level: 0, max: 2, color: "text-slate-600", bg: "bg-slate-600", border: "border-slate-800" };
    }
  };

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Wczytywanie profilu... ⏳</div>;
  }

  const badgeMatches = getBadgeData('matches', achievements.totalMatches);
  const badgeStadiums = getBadgeData('stadiums', achievements.uniqueStadiums);
  const badgeTeams = getBadgeData('teams', achievements.uniqueTeams);
  
  // Zmienne do statystyk
  const totalMatches = history.length;
  const uniqueCities = new Set(history.map(item => item.city)).size;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
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

      {/* --- PRZYWRÓCONY MODUŁ STATYSTYK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="bg-blue-900/30 p-4 rounded-lg text-blue-500">
            <Trophy size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Mecze</p>
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
          <div className="bg-purple-900/30 p-4 rounded-lg text-purple-500">
            <Navigation size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Przejechane KM</p>
            <p className="text-3xl font-bold text-white">
              {currentUser.favoriteTeam ? `${Math.round(achievements.distanceTraveled || achievements.totalDistance || 0)} km` : '-'}
            </p>
            {!currentUser.favoriteTeam && <p className="text-[10px] text-slate-500 mt-1">Wybierz ulubioną drużynę</p>}
          </div>
        </div>
      </div>
      {/* ---------------------------------- */}

      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="text-yellow-500" /> System Osiągnięć i Odznak
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className={`bg-slate-900 border ${badgeMatches.border} rounded-2xl p-5 shadow-lg relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-2 h-full ${badgeMatches.bg}`}></div>
            <div className="pl-4">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-slate-950 p-2 rounded-lg"><Trophy className={badgeMatches.color} size={24} /></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Mecze</span>
              </div>
              <p className={`text-lg font-bold ${badgeMatches.color} mb-1`}>{badgeMatches.name}</p>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                <span>Postęp: {achievements.totalMatches}</span>
                <span>Cel: {badgeMatches.max}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${badgeMatches.bg}`} style={{ width: `${Math.min(100, (achievements.totalMatches / badgeMatches.max) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`bg-slate-900 border ${badgeStadiums.border} rounded-2xl p-5 shadow-lg relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-2 h-full ${badgeStadiums.bg}`}></div>
            <div className="pl-4">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-slate-950 p-2 rounded-lg"><Compass className={badgeStadiums.color} size={24} /></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Stadiony</span>
              </div>
              <p className={`text-lg font-bold ${badgeStadiums.color} mb-1`}>{badgeStadiums.name}</p>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                <span>Postęp: {achievements.uniqueStadiums}</span>
                <span>Cel: {badgeStadiums.max}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${badgeStadiums.bg}`} style={{ width: `${Math.min(100, (achievements.uniqueStadiums / badgeStadiums.max) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`bg-slate-900 border ${badgeTeams.border} rounded-2xl p-5 shadow-lg relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-2 h-full ${badgeTeams.bg}`}></div>
            <div className="pl-4">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-slate-950 p-2 rounded-lg"><Star className={badgeTeams.color} size={24} /></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Drużyny</span>
              </div>
              <p className={`text-lg font-bold ${badgeTeams.color} mb-1`}>{badgeTeams.name}</p>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                <span>Postęp: {achievements.uniqueTeams}</span>
                <span>Cel: {badgeTeams.max}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${badgeTeams.bg}`} style={{ width: `${Math.min(100, (achievements.uniqueTeams / badgeTeams.max) * 100)}%` }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="text-blue-500" /> Historia Obecności na Stadionach
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.length === 0 ? (
          <div className="col-span-full bg-slate-900 p-8 rounded-2xl text-center text-slate-500 border border-slate-800">
            Konto świeci pustkami. Czas ruszyć w trasę i zaliczyć pierwszy wyjazd!
          </div>
        ) : (
          history.map((item, index) => (
            <Link 
              key={item.id || index} 
              to={`/matches/${item.matchId}`} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition-all duration-300 shadow-lg flex flex-col group relative"
            >
              
              <div className="h-48 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800">
                {item.photoUrl ? (
                  <img 
                    src={`http://localhost:8080${item.photoUrl}`} 
                    alt="Zdjęcie z meczu" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900">
                    <Camera size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Brak zdjęcia</span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 text-xs font-bold text-slate-300 rounded-full border border-white/10 shadow-sm z-10">
                  {new Date(item.date).toLocaleDateString('pl-PL')}
                </div>

                <button 
                  onClick={(e) => handleDeleteCheckIn(e, item.id)}
                  title="Usuń zameldowanie z historii"
                  className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 text-red-500 hover:text-white bg-red-950/80 hover:bg-red-600 rounded-full border border-red-900/50 transition-colors z-20 backdrop-blur-sm shadow-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="text-xs text-blue-400 font-bold mb-2 uppercase tracking-wide">
                    Kolejka {item.round}
                  </div>
                  <div className="font-bold text-white text-lg leading-snug mb-4 text-center">
                    {item.matchTitle}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0" /> 
                    <span className="truncate max-w-[120px]">{item.city || "Nieznane"}</span>
                  </span>
                  <span className="text-blue-500 font-medium group-hover:text-blue-400 transition-colors shrink-0">
                    Szczegóły &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;