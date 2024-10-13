import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.long - coords1.long);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [radius, setRadius] = useState(5); // Default radius in kilometers
  const userCoords = { lat: 13.756, long: 100.502, id: 1, description: 'Current location' }; // temporary fixed location
  const iconMarkup = renderToStaticMarkup(<i className=" fa fa-map-marker-alt fa-3x" />);
  const currentMarkerIcon = divIcon({
    html: iconMarkup,
  });
  useEffect(() => {
    fetch('/attractions_list_en.json')
      .then(response => response.json())
      .then(data => setLocations(data))
      .catch(error => console.error('Error fetching the JSON file:', error));
  }, []);

  useEffect(() => {
    const filteredLocations = locations.filter(location => {
      const distance = haversineDistance(userCoords, { lat: location.lat, long: location.long });
      return distance <= radius;
    });
    setNearbyLocations(filteredLocations);
  }, [locations, radius]);

  return (
    <div>
      <h3>Find Nearby Locations (within {radius} km)</h3>
      <input
        type="number"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        placeholder="Enter radius in km"
      />
      <MapContainer center={[userCoords.lat, userCoords.long]} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker icon={currentMarkerIcon} key={userCoords.id} position={[userCoords.lat, userCoords.long]}>
            <Popup>{userCoords.description}</Popup>
        </Marker>
        {nearbyLocations.map(location => (
          <Marker key={location.no} position={[location.lat, location.long]}>
            <Popup>{location.location}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
