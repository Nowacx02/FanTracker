import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserPlus, Check, X, Trophy, Medal, AlertCircle, CheckCircle, Shield, TrendingDown } from 'lucide-react';

const Friends = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [awayStats, setAwayStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchData = () => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/friends/pending/${currentUser.id}`)
      .then(res => setPendingRequests(res.data))
      .catch(err => console.error(err));

    axios.get(`http://localhost:8080/api/friends/ranking/${currentUser.id}`)
      .then(res => setRanking(res.data))
      .catch(err => console.error(err));

    axios.get(`http://localhost:8080/api/friends/away-stats/${currentUser.id}`)
      .then(res => {
        setAwayStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchData();
    }
  }, []);

  const handleSendRequest = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!searchUsername.trim()) return;

    axios.post(`http://localhost:8080/api/friends/request?requesterId=${currentUser.id}&receiverUsername=${searchUsername}`)
      .then(res => {
        setMessage(res.data);
        setSearchUsername('');
      })
      .catch(err => {
        setError(err.response?.data || "Wystąpił błąd");
      });
  };

  const handleRespond = (friendshipId, action) => {
    axios.post(`http://localhost:8080/api/friends/respond?friendshipId=${friendshipId}&action=${action}`)
      .then(() => {
        fetchData();
      })
      .catch(err => console.error(err));
  };

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Ładowanie danych o znajomych... ⏳</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <UserPlus className="text-blue-500" size={28} /> Dodaj znajomego
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        <form onSubmit={handleSendRequest} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Wpisz nazwę kibica..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Wyślij zaproszenie
          </button>
        </form>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-yellow-500" size={24} /> Oczekujące zaproszenia
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.friendshipId} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-white font-medium">{req.requesterUsername} chce dołączyć do Twoich znajomych</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRespond(req.friendshipId, 'ACCEPT')}
                    className="p-2 bg-green-900/30 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => handleRespond(req.friendshipId, 'REJECT')}
                    className="p-2 bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" size={28} /> Ranking Znajomych
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
              <th className="p-5 font-semibold text-center w-16">Pozycja</th>
              <th className="p-5 font-semibold">Kibic</th>
              <th className="p-5 font-semibold text-center">Ulubiona Drużyna</th>
              <th className="p-5 font-semibold text-center">Zaliczone Mecze</th>
              <th className="p-5 font-semibold text-center">Odwiedzone Stadiony</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {ranking.map((fan, index) => (
              <tr 
                key={index} 
                className={`border-b border-slate-800/50 transition-colors ${fan.username === currentUser.username ? 'bg-blue-900/20' : 'hover:bg-slate-800/50'}`}
              >
                <td className="p-5 text-center font-bold">
                  {index === 0 ? <Medal className="inline text-yellow-500" size={24} /> : 
                   index === 1 ? <Medal className="inline text-gray-400" size={24} /> : 
                   index === 2 ? <Medal className="inline text-amber-600" size={24} /> : 
                   index + 1}
                </td>
                <td className="p-5 font-medium text-white">
                  {fan.username} {fan.username === currentUser.username && <span className="text-xs text-blue-400 ml-2">(Ty)</span>}
                </td>
                <td className="p-5 text-center">
                  {fan.favoriteTeamName ? (
                    <div className="flex flex-col items-center gap-1">
                      {fan.favoriteTeamBadgeUrl ? (
                        <img src={fan.favoriteTeamBadgeUrl} alt={fan.favoriteTeamName} className="w-8 h-8 object-contain drop-shadow-md" />
                      ) : (
                        <Shield size={20} className="text-slate-500" />
                      )}
                      <span className="text-xs text-slate-400 font-semibold">{fan.favoriteTeamName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs font-semibold">Brak</span>
                  )}
                </td>
                <td className="p-5 text-center font-bold text-blue-400">{fan.checkInCount}</td>
                <td className="p-5 text-center font-bold text-green-400">{fan.uniqueStadiumsCount}</td>
              </tr>
            ))}
            {ranking.length === 1 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  Na razie jesteś tu sam. Zaproś znajomych, aby rozpocząć rywalizację!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentUser?.favoriteTeam && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-800 bg-slate-900">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <TrendingDown className="text-red-500" size={28} /> Statystyki Wyjazdowe 
            </h2>
            <p className="text-slate-500 text-sm mt-1">Kto przynosi pecha na wyjazdach? Tabela uwzględnia tylko Ciebie i znajomych z tą samą ulubioną drużyną.</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                <th className="p-5 font-semibold text-center w-16">Pechowiec</th>
                <th className="p-5 font-semibold">Kibic</th>
                <th className="p-5 font-semibold text-center">Wyjazdy</th>
                <th className="p-5 font-semibold text-center text-green-500">W</th>
                <th className="p-5 font-semibold text-center text-slate-400">R</th>
                <th className="p-5 font-semibold text-center text-red-500">P</th>
                <th className="p-5 font-semibold text-center text-blue-400">% Wygranych</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {awayStats.map((stat, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-slate-800/50 transition-colors ${index === 0 && stat.matchesAttended > 0 ? 'bg-red-900/10 border-red-900/30' : 'hover:bg-slate-800/50'}`}
                >
                  <td className="p-5 text-center font-bold text-red-500">
                    {index === 0 && stat.matchesAttended > 0 ? '#' + (index + 1) + '' : '#' + (index + 1)}
                  </td>
                  <td className="p-5 font-medium text-white">
                    {stat.username} {stat.username === currentUser.username && <span className="text-xs text-blue-400 ml-2">(Ty)</span>}
                  </td>
                  <td className="p-5 text-center font-bold text-white">{stat.matchesAttended}</td>
                  <td className="p-5 text-center font-bold text-green-500">{stat.wins}</td>
                  <td className="p-5 text-center font-bold text-slate-400">{stat.draws}</td>
                  <td className="p-5 text-center font-bold text-red-500">{stat.losses}</td>
                  <td className="p-5 text-center font-bold text-blue-400">{stat.winPercentage}%</td>
                </tr>
              ))}
              {awayStats.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Brak danych. Ty lub Twoi znajomi z tą samą drużyną nie macie jeszcze wyjazdów.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Friends;