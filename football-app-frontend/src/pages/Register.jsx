import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    axios.post('http://localhost:8080/api/auth/register', { 
      username, 
      email, 
      password 
    })
      .then(response => {
        setSuccess(response.data);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch(err => {
        setError(err.response?.data || "Wystąpił błąd podczas rejestracji");
      });
  };

  return (
    <div className="flex justify-center items-center mt-12 mb-12">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <UserPlus size={32} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Dołącz do nas</h2>
          <p className="text-slate-400 mt-2">Stwórz konto w FanTracker</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Nazwa kibica (Login)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-green-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Adres e-mail</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Hasło</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4"
          >
            Zarejestruj się
          </button>
        </form>

        <div className="mt-6 text-center text-slate-400 text-sm">
          Masz już konto?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;