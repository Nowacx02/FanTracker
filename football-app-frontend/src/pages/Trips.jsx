import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Car, Bus, Train, MapPin, Clock, Users, Plus, CheckCircle, AlertCircle, Info, UserMinus, UserPlus, Trash2, Filter } from 'lucide-react';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Stany dla filtrów
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedRound, setSelectedRound] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    matchId: '',
    meetingPoint: '',
    departureTime: '',
    transportType: 'Samochód',
    availableSeats: 4,
    description: ''
  });

  const fetchTrips = () => {
    axios.get(`http://localhost:8080/api/trips?userId=${currentUser.id}`)
      .then(res => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips();
    axios.get('http://localhost:8080/api/matches')
      .then(res => setMatches(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Resetowanie filtrów podrzędnych po zmianie ligi
  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
    setSelectedRound('All');
    setSelectedTeam('All');
    setFormData(prev => ({ ...prev, matchId: '' })); // Czyszczenie wybranego meczu
  };

  // Logika filtrowania meczów
  const uniqueLeagues = [...new Set(matches.map(m => m.homeTeam?.league))].filter(Boolean).sort();

  const matchesInLeague = selectedLeague === 'All' 
    ? matches 
    : matches.filter(match => match.homeTeam?.league === selectedLeague || match.awayTeam?.league === selectedLeague);

  const uniqueRounds = [...new Set(matchesInLeague.map(m => m.matchRound))].sort((a, b) => a - b);
  const uniqueTeams = [...new Set(matchesInLeague.flatMap(m => [m.homeTeam?.name, m.awayTeam?.name]))].filter(Boolean).sort();

  const filteredMatchesForSelection = matchesInLeague.filter(match => {
    const matchRoundCondition = selectedRound === 'All' || match.matchRound.toString() === selectedRound.toString();
    const teamCondition = selectedTeam === 'All' || match.homeTeam?.name === selectedTeam || match.awayTeam?.name === selectedTeam;
    return matchRoundCondition && teamCondition;
  });

  const handleCreateTrip = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const payload = {
      ...formData,
      organizerId: currentUser.id
    };

    axios.post('http://localhost:8080/api/trips', payload)
      .then(res => {
        setMessage(res.data);
        setShowForm(false);
        fetchTrips();
        setFormData({ matchId: '', meetingPoint: '', departureTime: '', transportType: 'Samochód', availableSeats: 4, description: '' });
      })
      .catch(err => setError(err.response?.data || "Wystąpił błąd"));
  };

  const handleAction = (tripId, action) => {
    axios.post(`http://localhost:8080/api/trips/${tripId}/${action}?userId=${currentUser.id}`)
      .then(res => {
        setMessage(res.data);
        fetchTrips();
      })
      .catch(err => setError(err.response?.data || "Wystąpił błąd"));
  };

  const handleDeleteTrip = (tripId) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten wyjazd? Tego działania nie można cofnąć.")) {
      axios.delete(`http://localhost:8080/api/trips/${tripId}?userId=${currentUser.id}`)
        .then(res => {
          setMessage(res.data);
          fetchTrips();
        })
        .catch(err => setError(err.response?.data || "Wystąpił błąd podczas usuwania."));
    }
  };

  const getTransportIcon = (type) => {
    switch(type) {
      case 'Samochód': return <Car size={20} className="text-blue-400" />;
      case 'Bus': return <Bus size={20} className="text-yellow-400" />;
      case 'Pociąg': return <Train size={20} className="text-purple-400" />;
      default: return <Car size={20} className="text-blue-400" />;
    }
  };

  if (loading) return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Wyszukiwanie wyjazdów... ⏳</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Car className="text-blue-500" size={32} /> Organizator Wyjazdów
          </h2>
          <p className="text-slate-400 mt-2">Znajdź transport na mecz lub zaoferuj wolne miejsce w aucie.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          {showForm ? 'Anuluj organizację' : <><Plus size={20} /> Zorganizuj Wyjazd</>}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-900/40 border border-green-500/50 text-green-400 rounded-xl flex items-center gap-2 font-bold">
          <CheckCircle size={20} /> {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-900/40 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl shadow-blue-900/10">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3">Szczegóły nowego wyjazdu</h3>
          <form onSubmit={handleCreateTrip} className="space-y-6">
            
            {/* Sekcja filtrowania meczu */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                <Filter size={16}/> 1. Znajdź mecz
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <select 
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none w-full"
                  value={selectedLeague}
                  onChange={handleLeagueChange}
                >
                  <option value="All">Wszystkie ligi</option>
                  {uniqueLeagues.map(league => (
                    <option key={league} value={league}>{league}</option>
                  ))}
                </select>

                <select 
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none w-full"
                  value={selectedRound}
                  onChange={(e) => {
                    setSelectedRound(e.target.value);
                    setFormData(prev => ({ ...prev, matchId: '' }));
                  }}
                >
                  <option value="All">Wszystkie kolejki</option>
                  {uniqueRounds.map(round => (
                    <option key={round} value={round}>Kolejka {round}</option>
                  ))}
                </select>

                <select 
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none w-full"
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    setFormData(prev => ({ ...prev, matchId: '' }));
                  }}
                >
                  <option value="All">Wszystkie drużyny</option>
                  {uniqueTeams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* Lista wyników filtrowania */}
              <div className="mt-4">
                 <label className="block text-slate-400 text-sm font-semibold mb-2">Wybierz konkretny mecz z wyników:</label>
                 <select 
                    required 
                    name="matchId" 
                    value={formData.matchId} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-slate-900 border border-blue-500/50 rounded-lg text-white outline-none focus:border-blue-500 shadow-inner"
                    size={Math.min(filteredMatchesForSelection.length, 5) || 1} // Pokazuje od razu kilka opcji jak lista
                 >
                  <option value="" disabled className="text-slate-500 py-1">-- Wybierz mecz poniżej --</option>
                  {filteredMatchesForSelection.length > 0 ? (
                    filteredMatchesForSelection.map(m => (
                      <option key={m.id} value={m.id} className="py-2 px-2 hover:bg-slate-800 border-b border-slate-800/50 last:border-0">
                         {m.homeTeam.name} vs {m.awayTeam.name} (Kolejka {m.matchRound}) - {new Date(m.matchDate).toLocaleDateString('pl-PL')}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-slate-500 italic py-1">Brak meczów dla wybranych filtrów.</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Miejsce zbiórki</label>
                <input required type="text" name="meetingPoint" value={formData.meetingPoint} onChange={handleInputChange} placeholder="np. Dworzec Główny, pod żabką" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Data i godzina wyjazdu</label>
                <input required type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Środek transportu</label>
                <select name="transportType" value={formData.transportType} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                  <option value="Samochód">Samochód</option>
                  <option value="Bus">Bus</option>
                  <option value="Pociąg">Pociąg</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Liczba wolnych miejsc (Razem z Tobą)</label>
                <input required type="number" min="1" max="50" name="availableSeats" value={formData.availableSeats} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 text-sm font-semibold mb-2">Dodatkowe informacje / Koszty</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Zrzutka na paliwo, nie spóźniać się..." rows="2" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500"></textarea>
              </div>
            </div>

            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors">
              Opublikuj wyjazd
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 text-lg border-2 border-dashed border-slate-800 rounded-2xl">
            Aktualnie nikt nie organizuje żadnego wyjazdu. Bądź pierwszy!
          </div>
        ) : (
          trips.map(trip => {
            const isFull = trip.occupiedSeats >= trip.maxSeats;
            const isOrganizer = trip.organizerName === currentUser.username;

            return (
              <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-blue-500/50 transition-colors">
                
                <div className="bg-slate-950 p-5 border-b border-slate-800 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{trip.matchTitle}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <Users size={16} /> Organizator: <span className="font-semibold text-blue-400">{isOrganizer ? 'Ty' : trip.organizerName}</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 shrink-0">
                    {getTransportIcon(trip.transportType)}
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-green-500 mt-0.5 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Zbiórka</p>
                      <p className="text-white font-medium">{trip.meetingPoint}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="text-yellow-500 mt-0.5 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Wyjazd</p>
                      <p className="text-white font-medium">
                        {new Date(trip.departureTime).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {trip.description && (
                    <div className="flex items-start gap-3 pt-2 border-t border-slate-800/50">
                      <Info className="text-slate-500 mt-0.5 shrink-0" size={20} />
                      <p className="text-sm text-slate-300 italic">{trip.description}</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-5 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-slate-500 uppercase font-bold text-xs tracking-wider mb-1">Miejsca</p>
                    <p className="font-bold">
                      <span className={isFull ? "text-red-500" : "text-green-500"}>{trip.occupiedSeats}</span>
                      <span className="text-slate-400"> / {trip.maxSeats}</span>
                    </p>
                  </div>

                  <div>
                    {isOrganizer ? (
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg font-semibold text-sm border border-blue-500/20">
                          Twój wyjazd
                        </span>
                        <button 
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                          title="Usuń wyjazd"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : trip.isCurrentUserJoined ? (
                      <button 
                        onClick={() => handleAction(trip.id, 'leave')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-lg font-bold transition-colors"
                      >
                        <UserMinus size={18} /> Zrezygnuj
                      </button>
                    ) : isFull ? (
                      <span className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg font-semibold text-sm border border-red-500/20">
                        Brak miejsc
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleAction(trip.id, 'join')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
                      >
                        <UserPlus size={18} /> Dołącz
                      </button>
                    )}
                  </div>
                </div>

                {trip.participantNames.length > 0 && (
                  <div className="px-5 pb-5 bg-slate-950 text-xs text-slate-500">
                    <span className="font-semibold">Pasażerowie:</span> {trip.participantNames.join(', ')}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Trips;