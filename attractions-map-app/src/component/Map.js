import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch('/attractions_list_en.json')
      .then(response => response.json())
      .then(data => setLocations(data))
      .catch(error => console.error('Error fetching the JSON file:', error));
  }, []);

  return (
    <MapContainer center={[13.756, 100.502]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map(location => (
        <Marker key={location.no} position={[location.lat, location.long]}>
          <Popup>{location.location}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
