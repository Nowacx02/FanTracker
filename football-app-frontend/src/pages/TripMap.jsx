import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, X, Images, Image as ImageIcon } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TripMap = () => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryModal, setGalleryModal] = useState({ isOpen: false, stadiumId: null, stadiumName: '', photos: [] });
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (currentUser?.id) {
      axios.get(`http://localhost:8080/api/checkins/map/${currentUser.id}`)
        .then(res => {
          setMapData(res.data);
          setLoading(false);
        })
        .catch(err => console.error(err));
    }
  }, []);

  const openGallery = (stadiumId, stadiumName) => {
    axios.get(`http://localhost:8080/api/checkins/user/${currentUser.id}/stadium/${stadiumId}/photos`)
      .then(res => {
        setGalleryModal({ isOpen: true, stadiumId, stadiumName, photos: res.data });
      })
      .catch(err => console.error(err));
  };

  if (loading) {
    return <div className="text-center text-blue-400 mt-20 text-xl font-semibold">Generowanie mapy... ⏳</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MapPin className="text-blue-500" size={32} /> Interaktywna Mapa Wyjazdowa
        </h2>
        <p className="text-slate-400 mt-2">Wszystkie Twoje zdobyte stadiony w jednym miejscu.</p>
      </div>

      <div className="h-[600px] w-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative z-0">
        <MapContainer center={[52.0693, 19.4803]} zoom={6} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapData.map((stadium) => (
            <Marker 
              key={stadium.stadiumId} 
              position={[stadium.latitude, stadium.longitude]}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px] text-center">
                  <h3 className="font-bold text-slate-800 text-lg">{stadium.stadiumName}</h3>
                  <p className="text-slate-500 text-sm mb-3">{stadium.city}</p>
                  
                  {stadium.latestPhotoUrl ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300 mb-3 bg-slate-100">
                      <img 
                        src={`http://localhost:8080${stadium.latestPhotoUrl}`} 
                        alt="Latest check-in" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border border-slate-300 mb-3 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon size={32} className="mb-1 opacity-50" />
                      <span className="text-xs font-semibold">Brak zdjęcia</span>
                    </div>
                  )}

                  {stadium.totalPhotos > 1 && (
                    <button 
                      onClick={() => openGallery(stadium.stadiumId, stadium.stadiumName)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
                    >
                      <Images size={16} /> Pokaż więcej ({stadium.totalPhotos})
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {galleryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Images className="text-blue-500" /> Galeria: {galleryModal.stadiumName}
              </h3>
              <button 
                onClick={() => setGalleryModal({ isOpen: false, stadiumId: null, stadiumName: '', photos: [] })}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-600/80 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryModal.photos.map((url, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img src={`http://localhost:8080${url}`} alt={`Zdjęcie ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;