import { MapContainer, TileLayer } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import Geoman from './chat_room_geoman';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Legend } from './legend';

export const Map = ({ user, zoom, joinRoom }) => {
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({});
  const [positionWatcher, setPositionWatcher] = useState();

  zoom = zoom || 18;

  useEffect(() => {
    if (user) {
      setPositionWatcher(
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setPosition({ lat, lng });
            setLoading(false);
          },
          (err) => {
            toast.error(err.message);
          },
        ),
      );
    }
  }, [user]);

  if (!loading) {
    return (
      <MapContainer center={position} zoom={zoom} minZoom={15}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Legend />
        <Geoman joinRoom={joinRoom} userPos={position} user={user} />
      </MapContainer>
    );
  }
  return <div>Getting current location...</div>;
};
