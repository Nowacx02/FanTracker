import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, ArrowLeft, CheckCircle, AlertTriangle, Users, Navigation, Play, Camera, X, Trash2, LogOut } from 'lucide-react';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const matchParams = url.match(regExp);
  return (matchParams && matchParams[2].length === 11)
    ? `https://www.youtube.com/embed/${matchParams[2]}`
    : null;
};

const MatchDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [match, setMatch] = useState(location.state?.match || null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(!location.state?.match);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [existingCheckIn, setExistingCheckIn] = useState(null);

  useEffect(() => {
    if (!match && id) {
      axios.get(`http://localhost:8080/api/matches/${id}`)
        .then(response => {
          setMatch(response.data);
          setIsLoadingMatch(false);
        })
        .catch(err => {
          console.error("Błąd pobierania meczu:", err);
          setIsLoadingMatch(false);
        });
    }
  }, [id, match]);

  useEffect(() => {
    if (currentUser?.id && match?.id) {
      axios.get(`http://localhost:8080/api/checkins/status?userId=${currentUser.id}&matchId=${match.id}`)
        .then(response => {
          if (response.data.isCheckedIn) {
            setExistingCheckIn(response.data);
          }
        })
        .catch(err => console.error(err));
    }
  }, [currentUser?.id, match?.id]);

  if (isLoadingMatch) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Ładowanie danych meczu... ⏳</div>;
  }

  if (!match) {
    return (
      <div className="text-center text-white mt-20">
        <h2 className="text-2xl">Nie znaleziono meczu.</h2>
        <button onClick={() => navigate('/matches')} className="mt-4 text-blue-400 underline">Wróć do terminarza</button>
      </div>
    );
  }

  const isPlayed = match?.homeGoals !== null && match?.homeGoals !== undefined && 
                   match?.awayGoals !== null && match?.awayGoals !== undefined;

  const handleCheckIn = () => {
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('userId', currentUser?.id);
    formData.append('matchId', match.id);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    axios.post('http://localhost:8080/api/checkins', formData)
    .then(response => {
      setMessage(response.data);
      setPhotoFile(null);
      
      axios.get(`http://localhost:8080/api/checkins/status?userId=${currentUser.id}&matchId=${match.id}`)
        .then(res => {
          if (res.data.isCheckedIn) {
            setExistingCheckIn(res.data);
          }
        });
    })
    .catch(err => setError(err.response?.data || "Wystąpił błąd podczas meldowania."));
  };

  const handleAddPhoto = () => {
    setMessage('');
    setError('');

    if (!photoFile) {
      setError("Wybierz zdjęcie, aby je dodać do zameldowania.");
      return;
    }

    const formData = new FormData();
    formData.append('photo', photoFile);

    axios.post(`http://localhost:8080/api/checkins/${existingCheckIn.id}/photo`, formData)
    .then(response => {
      setMessage(response.data);
      setPhotoFile(null);
      
      axios.get(`http://localhost:8080/api/checkins/status?userId=${currentUser.id}&matchId=${match.id}`)
        .then(res => {
          if (res.data.isCheckedIn) {
            setExistingCheckIn(res.data);
          }
        });
    })
    .catch(err => setError(err.response?.data || "Wystąpił błąd podczas zapisywania zdjęcia."));
  };

  const handleDeletePhoto = () => {
    setMessage('');
    setError('');

    axios.delete(`http://localhost:8080/api/checkins/${existingCheckIn.id}/photo`)
      .then(response => {
        setMessage(response.data);
        setExistingCheckIn(prev => ({ ...prev, photoUrl: null }));
      })
      .catch(err => setError(err.response?.data || "Wystąpił błąd podczas usuwania zdjęcia."));
  };

  const handleUncheckIn = () => {
    setMessage('');
    setError('');

    axios.delete(`http://localhost:8080/api/checkins/${existingCheckIn.id}`)
      .then(response => {
        setMessage(response.data);
        setExistingCheckIn(null);
        setPhotoFile(null);
      })
      .catch(err => setError(err.response?.data || "Wystąpił błąd podczas wymeldowywania."));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto"> 
      <button onClick={() => navigate('/matches')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 transition-colors text-sm"> 
        <ArrowLeft size={18} /> Wróć do terminarza
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {match?.stadium?.imgUrl ? (
          <div className="relative w-full h-40 md:h-56 bg-slate-800">
            <img 
              src={match.stadium.imgUrl} 
              alt={match.stadium.name || "Stadion"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full font-bold shadow-lg"> 
              </div>
              {isPlayed && (
                <div className="text-xs px-3 py-1 bg-green-900/80 text-green-400 border border-green-500/50 rounded-full font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm"> 
                  Zakończony
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-6 text-center flex justify-center gap-2"> 
             <div className="text-xs inline-block px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full font-bold"> 
               Kolejka {match?.matchRound}
             </div>
             {isPlayed && (
                <div className="text-xs px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/50 rounded-full font-bold uppercase tracking-wider"> 
                  Zakończony
                </div>
              )}
          </div>
        )}

        <div className={`p-6 ${match?.stadium?.imgUrl ? 'pt-2' : ''}`}>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex justify-center items-center gap-3 flex-wrap"> 
              <span>{match?.homeTeam?.name}</span>
              {isPlayed ? (
                <div className="mx-2 px-4 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-2xl md:text-3xl text-blue-400 font-black shadow-inner whitespace-nowrap">
                  {match.homeGoals} - {match.awayGoals}
                </div>
              ) : (
                <span className="text-slate-600 text-xl font-light">vs</span>
              )}
              <span>{match?.awayTeam?.name}</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800/50 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg"><Clock className="text-blue-500" size={20} /></div> 
              <span className="text-base font-medium"> 
                {match?.matchDate ? new Date(match.matchDate).toLocaleString('pl-PL', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : "Brak daty"}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg"><MapPin className="text-green-500" size={20} /></div> 
              <span className="text-base font-medium leading-tight">
                {match?.stadium ? `${match.stadium.name}, ${match.stadium.city}` : "Stadion nieznany"}
              </span>
            </div>

            {match?.stadium?.capacity > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-900/30 rounded-lg"><Users className="text-yellow-500" size={20} /></div> 
                <span className="text-base font-medium">
                  Pojemność: {Number(match.stadium.capacity).toLocaleString('pl-PL')}
                </span>
              </div>
            )}

            {match?.stadium?.latitude && match?.stadium?.longitude && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 rounded-lg"><Navigation className="text-purple-500" size={20} /></div> 
                <a 
                  href={`https://www.google.com/maps?q=${match.stadium.latitude},${match.stadium.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors" 
                >
                  Nawiguj na stadion
                </a>
              </div>
            )}
          </div>

          {message && (
            <div className="mb-5 p-3.5 bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg flex items-center gap-2.5 font-medium text-sm"> 
              <CheckCircle size={18} /> {message}
            </div>
          )}
          {error && (
            <div className="mb-5 p-3.5 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2.5 font-medium text-sm"> 
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {existingCheckIn ? (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="mb-5 p-4 bg-green-900/30 border border-green-500/50 text-green-400 rounded-xl flex items-center justify-center gap-3 font-bold text-lg"> 
                <CheckCircle size={24} /> Jesteś już zameldowany na tym meczu!
              </div>
              
              {existingCheckIn.photoUrl ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold flex items-center gap-2">
                      <Camera size={16} /> Twoje zdjęcie z trybun
                    </div>
                    <button 
                      onClick={handleDeletePhoto}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Usuń zdjęcie
                    </button>
                  </div>
                  <div className="relative w-full h-64 border-2 border-slate-700 rounded-xl overflow-hidden bg-black">
                    <img 
                      src={`http://localhost:8080${existingCheckIn.photoUrl}`} 
                      alt="Twoje zdjęcie ze stadionu" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="mb-4">
                    {photoFile ? (
                      <div className="relative w-full h-48 border-2 border-slate-700 rounded-xl overflow-hidden bg-black">
                        <img 
                          src={URL.createObjectURL(photoFile)} 
                          alt="Podgląd" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPhotoFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-sm text-slate-400 font-semibold text-center px-4">
                            Nie wgrałeś jeszcze zdjęcia. Kliknij, by dodać pamiątkę z trybun.
                          </p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPhotoFile(e.target.files[0]);
                            }
                          }} 
                        />
                      </label>
                    )}
                  </div>

                  <button 
                    onClick={handleAddPhoto}
                    className="w-full mb-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera size={22} /> Zapisz zdjęcie
                  </button>
                </div>
              )}

              <button 
                onClick={handleUncheckIn}
                className="w-full mt-4 py-3 bg-slate-800 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-slate-700 hover:border-red-800 text-lg font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={22} /> Wymelduj się z meczu
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                {photoFile ? (
                  <div className="relative w-full h-48 border-2 border-slate-700 rounded-xl overflow-hidden bg-black">
                    <img 
                      src={URL.createObjectURL(photoFile)} 
                      alt="Podgląd" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setPhotoFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="text-sm text-slate-400 font-semibold text-center px-4">
                        Kliknij, by dorzucić fotkę z trybun (opcjonalnie)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                )}
              </div>

              <button 
                onClick={handleCheckIn}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MapPin size={22} /> Zamelduj się na stadionie
              </button>
            </>
          )}

        </div>
      </div>

      {match?.videoUrl && getYouTubeEmbedUrl(match.videoUrl) && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-1.5"> 
            <Play className="text-red-500 fill-red-500" size={24} /> Skrót meczu 
          </h3>
          
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-black">
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(match.videoUrl)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;