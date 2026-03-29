import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal } from 'lucide-react';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/api/checkins/ranking')
      .then(response => {
        setRanking(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Błąd pobierania rankingu:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Obliczanie rankingu... ⏳</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
        <Trophy className="text-yellow-500" size={32} /> Globalny Ranking Kibiców
      </h2>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
              <th className="p-5 font-semibold text-center w-16">Pozycja</th>
              <th className="p-5 font-semibold">Kibic</th>
              <th className="p-5 font-semibold text-center">Zaliczone Mecze</th>
              <th className="p-5 font-semibold text-center">Odwiedzone Stadiony</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {ranking.map((fan, index) => (
              <tr 
                key={index} 
                className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-5 text-center font-bold">
                  {index === 0 ? <Medal className="inline text-yellow-500" size={24} /> : 
                   index === 1 ? <Medal className="inline text-gray-400" size={24} /> : 
                   index === 2 ? <Medal className="inline text-amber-600" size={24} /> : 
                   index + 1}
                </td>
                <td className="p-5 font-medium text-white">{fan.username}</td>
                <td className="p-5 text-center font-bold text-blue-400">{fan.checkInCount}</td>
                <td className="p-5 text-center font-bold text-green-400">{fan.uniqueStadiumsCount}</td>
              </tr>
            ))}
            {ranking.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  Brak danych w rankingu. Zamelduj się na swoim pierwszym meczu!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;