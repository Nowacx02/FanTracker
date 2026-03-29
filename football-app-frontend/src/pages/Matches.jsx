import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stany dla filtrów
  const [selectedRound, setSelectedRound] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:8080/api/matches')
      .then(response => {
        setMatches(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Błąd pobierania meczów:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Ładowanie terminarza... ⏳</div>;
  }

  // --- LOGIKA FILTRÓW ---
  const uniqueRounds = [...new Set(matches.map(m => m.matchRound))].sort((a, b) => a - b);
  const uniqueTeams = [...new Set(matches.flatMap(m => [m.homeTeam?.name, m.awayTeam?.name]))]
    .filter(Boolean)
    .sort();

  const filteredMatches = matches.filter(match => {
    const matchRoundCondition = selectedRound === 'All' || match.matchRound.toString() === selectedRound.toString();
    const teamCondition = selectedTeam === 'All' || match.homeTeam?.name === selectedTeam || match.awayTeam?.name === selectedTeam;
    return matchRoundCondition && teamCondition;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Calendar className="text-blue-500" size={32} /> Terminarz Spotkań
        </h2>

        {/* --- SEKCJA FILTRÓW --- */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtruj:</span>
          </div>
          
          <select 
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            <option value="All">Wszystkie kolejki</option>
            {uniqueRounds.map(round => (
              <option key={round} value={round}>Kolejka {round}</option>
            ))}
          </select>

          <select 
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none w-full sm:w-auto"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="All">Wszystkie drużyny</option>
            {uniqueTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Siatka kart z meczami */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => {
            const isPlayed = match.homeGoals !== null && match.homeGoals !== undefined && 
                             match.awayGoals !== null && match.awayGoals !== undefined;

            return (
              <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between">
                
                {/* Nagłówek karty (Kolejka i Status) */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full font-semibold">
                    Kolejka {match.matchRound}
                  </div>
                  {isPlayed && (
                    <div className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-md font-bold uppercase tracking-wider border border-green-800/50">
                      Zakończony
                    </div>
                  )}
                </div>
                
                {/* --- NOWY UKŁAD: HERB NAD NAZWĄ --- */}
                <div className="flex justify-between items-center text-white mb-8 gap-2">
                  
                  {/* Drużyna Gospodarzy */}
                  <div className="flex-1 flex flex-col items-center text-center gap-3">
                    {match.homeTeam?.badgeUrl ? (
                      <img 
                        src={match.homeTeam.badgeUrl} 
                        alt={match.homeTeam.name} 
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        {match.homeTeam?.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm sm:text-base font-bold leading-tight break-words px-1">
                      {match.homeTeam?.name}
                    </span>
                  </div>
                  
                  {/* Wynik */}
                  <div className="shrink-0 flex items-center justify-center px-2">
                    {isPlayed ? (
                      <div className="px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-2xl sm:text-3xl text-blue-400 font-black shadow-inner whitespace-nowrap text-center">
                        {match.homeGoals} - {match.awayGoals}
                      </div>
                    ) : (
                      <span className="text-slate-500 px-3 py-1 font-bold bg-slate-950 border border-slate-800 rounded-md text-sm whitespace-nowrap">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Drużyna Gości */}
                  <div className="flex-1 flex flex-col items-center text-center gap-3">
                    {match.awayTeam?.badgeUrl ? (
                      <img 
                        src={match.awayTeam.badgeUrl} 
                        alt={match.awayTeam.name} 
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        {match.awayTeam?.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm sm:text-base font-bold leading-tight break-words px-1">
                      {match.awayTeam?.name}
                    </span>
                  </div>
                  
                </div>
                
                {/* Informacje o dacie i stadionie */}
                <div className="text-sm text-slate-400 space-y-2 border-t border-slate-800 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-500 shrink-0" /> 
                    {new Date(match.matchDate).toLocaleString('pl-PL', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-500 shrink-0" />
                    {match.stadium ? (
                      <span className="truncate">{match.stadium.name}, {match.stadium.city}</span>
                    ) : (
                      <span>Stadion nieznany</span>
                    )}
                  </div>
                </div>

                {/* Przycisk przejścia do szczegółów */}
                <Link 
                  to={`/matches/${match.id}`} 
                  state={{ match: match }} 
                  className="block text-center w-full mt-6 bg-slate-800 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Szczegóły
                </Link>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 text-lg">
            Nie znaleziono meczów dla wybranych filtrów.
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;