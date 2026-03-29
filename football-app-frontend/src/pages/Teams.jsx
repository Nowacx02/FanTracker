import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Filter, Star } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [message, setMessage] = useState('');
  
  // Trzymamy użytkownika w stanie, aby komponent mógł natychmiast zareagować na zmianę
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    axios.get('http://localhost:8080/api/teams')
      .then(response => {
        setTeams(response.data);
        setLoading(false);
      })
      .catch(error => console.error("Błąd pobierania drużyn:", error));
  }, []);

  const handleSetFavorite = (teamId, teamName) => {
    axios.put(`http://localhost:8080/api/users/${currentUser.id}/favorite-team/${teamId}`)
      .then(response => {
        // Aktualizujemy dane usera w przeglądarce
        localStorage.setItem('user', JSON.stringify(response.data));
        // Aktualizujemy stan Reacta (to powoduje natychmiastowe podświetlenie!)
        setCurrentUser(response.data);
        
        setMessage(`Ustawiono ${teamName} jako ulubioną drużynę! 🏆`);
        setTimeout(() => setMessage(''), 4000);
      })
      .catch(error => console.error("Błąd:", error));
  };

  if (loading) return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Ładowanie bazy klubów... ⏳</div>;

  const uniqueLeagues = [...new Set(teams.map(t => t.league))].filter(Boolean).sort();
  const filteredTeams = selectedLeague === 'All' ? teams : teams.filter(t => t.league === selectedLeague);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Shield className="text-blue-500" size={32} /> Baza Drużyn
        </h2>

        <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2 outline-none"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="All">Wszystkie Ligi</option>
            {uniqueLeagues.map(league => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="mb-8 p-4 bg-green-900/40 border border-green-500/50 text-green-400 rounded-xl text-center font-bold shadow-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTeams.map(team => {
          
          // Sprawdzamy, czy ten konkretny kafelek to nasza ulubiona drużyna
          const isFavorite = currentUser?.favoriteTeam?.id === team.id;

          return (
            <div 
              key={team.id} 
              className={`border rounded-2xl p-6 flex flex-col items-center text-center shadow-lg transition-all duration-300 ${
                isFavorite 
                ? 'bg-slate-800/80 border-yellow-500/50 shadow-yellow-900/20' 
                : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              {team.badgeUrl ? (
                <img src={team.badgeUrl} alt={team.name} className="w-20 h-20 object-contain drop-shadow-lg mb-4" />
              ) : (
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl mb-4 border border-slate-700">
                  {team.name.charAt(0)}
                </div>
              )}
              
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">{team.name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-6">{team.league}</p>
              
              <button 
                onClick={() => !isFavorite && handleSetFavorite(team.id, team.name)}
                disabled={isFavorite}
                className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                  isFavorite
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 cursor-default'
                  : 'bg-slate-800 hover:bg-yellow-600/20 text-slate-300 hover:text-yellow-500 border border-slate-700 hover:border-yellow-600/50'
                }`}
              >
                {/* Gwiazdka wypełnia się (fill), gdy drużyna jest ulubiona */}
                <Star size={18} className={isFavorite ? "fill-yellow-500" : ""} /> 
                {isFavorite ? 'Wybrana' : 'Wybierz'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Teams;