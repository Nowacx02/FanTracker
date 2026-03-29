import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    axios.post('http://localhost:8080/api/auth/login', { username, password })
      .then(response => {
        localStorage.setItem('user', JSON.stringify(response.data));
        
        window.location.href = '/matches';
      })
      .catch(err => {
        setError(err.response?.data || "Błąd logowania");
      });
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <LogIn size={32} className="text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Zaloguj się</h2>
          <p className="text-slate-400 mt-2">Witaj w bazie FanTracker</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Nazwa kibica (Login)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Hasło</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Wejdź na stadion
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;