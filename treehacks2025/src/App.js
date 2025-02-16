import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, useMap, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NewsPanel from './components/NewsPanel';
import WeatherPanel from './components/WeatherPanel';
import GeopoliticalPanel from './components/GeopoliticalPanel';
import PathPlanningPanel from './components/PathPlanningPanel';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create SVG icons for ships and ports
const shipIconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L4 16H28L16 2Z" fill="#3388ff"/>
  <circle cx="16" cy="16" r="6" fill="#3388ff"/>
</svg>`;

const portIconSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#ff3333"/>
  <circle cx="12" cy="12" r="6" fill="white"/>
</svg>`;

// Convert SVG to data URL
const svgToDataUrl = (svg) => `data:image/svg+xml;base64,${btoa(svg)}`;

// Custom icons for ships and ports
const shipIcon = new L.Icon({
  iconUrl: svgToDataUrl(shipIconSvg),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const portIcon = new L.Icon({
  iconUrl: svgToDataUrl(portIconSvg),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function CenterCoordinates({ setCenter }) {
  const map = useMap();

  useEffect(() => {
    const updateCenter = () => {
      const center = map.getCenter();
      setCenter({ lat: center.lat, lon: center.lng });
    };
    map.on('moveend', updateCenter);
    updateCenter();
    return () => {
      map.off('moveend', updateCenter);
    };
  }, [map, setCenter]);

  return null;
}

function App() {
  const [startPoint, setStartPoint] = useState({ lat: 37.7749, lon: -122.4194 });
  const [endPoint, setEndPoint] = useState({ lat: 34.0522, lon: -118.2437 });
  const [season, setSeason] = useState('summer');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 27.0000, lon: 45.0000 }); // Centered between Mediterranean and Arabian Sea
  const [shipRoutes, setShipRoutes] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);

  // Fetch ship routes
  const fetchShipRoutes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ship-routes');
      if (!response.ok) {
        throw new Error('Failed to fetch ship routes');
      }
      const data = await response.json();
      console.log('Fetched ship routes:', data); // Add logging to debug
      setShipRoutes(data);
    } catch (error) {
      console.error('Error fetching ship routes:', error);
    }
  }, []);

  useEffect(() => {
    fetchShipRoutes();
    const interval = setInterval(fetchShipRoutes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchShipRoutes]);

  // Group route points by ship
  const getShipRoutes = () => {
    if (!shipRoutes?.routes) return {};
    
    const routes = {};
    const sortedRoutes = [...shipRoutes.routes].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );

    sortedRoutes.forEach(point => {
      if (!routes[point.mmsi]) {
        routes[point.mmsi] = [];
      }
      routes[point.mmsi].push([point.lat, point.lon, point.speed]);
    });
    return routes;
  };

  // Get speed color based on speed value
  const getSpeedColor = (speed) => {
    // Speed ranges (in knots)
    const ranges = {
      slow: 8,      // Below 8 knots
      medium: 12,   // Below 12 knots
      fast: 15,     // Below 15 knots
      // Above 15 knots is very fast
    };

    if (speed < ranges.slow) {
      return '#4575b4'; // Blue for slow
    } else if (speed < ranges.medium) {
      return '#74add1'; // Light blue for medium-slow
    } else if (speed < ranges.fast) {
      return '#f46d43'; // Orange for medium-fast
    } else {
      return '#d73027'; // Red for fast
    }
  };

  // Get line weight based on ship type
  const getLineWeight = (mmsi) => {
    const ship = shipRoutes?.ships?.[mmsi];
    return ship?.includes('COASTAL') ? 2 : 3;
  };

  // Create route segments with colors based on speed
  const getRouteSegments = (route) => {
    const segments = [];
    for (let i = 0; i < route.length - 1; i++) {
      const [lat1, lon1, speed1] = route[i];
      const [lat2, lon2, speed2] = route[i + 1];
      const avgSpeed = (speed1 + speed2) / 2;
      segments.push({
        positions: [[lat1, lon1], [lat2, lon2]],
        color: getSpeedColor(avgSpeed),
        speed: avgSpeed
      });
    }
    return segments;
  };

  // Get current ship positions
  const getCurrentShipPositions = () => {
    if (!shipRoutes?.routes || !shipRoutes?.ships) return [];
    
    const positions = new Map();
    shipRoutes.routes.forEach(point => {
      positions.set(point.mmsi, {
        ...point,
        shipName: shipRoutes.ships[point.mmsi]
      });
    });
    return Array.from(positions.values());
  };

  return (
    <div className="container-fluid dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Maritime Route Simulator</a>
        </div>
      </nav>

      <div className="row mt-3" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Column - Maritime News Only */}
        <div className="col-md-3" style={{ height: '100%' }}>
          <div style={{ height: '100%', overflowY: 'hidden' }}>
            <NewsPanel />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-9">
          {/* Map Card */}
          <div className="card map-card">
            <div className="card-body">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lon]}
                zoom={5}  // Zoomed out to show the broader area
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <CenterCoordinates setCenter={setMapCenter} />

                {/* Render Ports */}
                {shipRoutes?.ports && Object.entries(shipRoutes.ports).map(([name, coords]) => (
                  <Marker
                    key={name}
                    position={[coords.lat, coords.lon]}
                    icon={portIcon}
                  >
                    <Popup>
                      <strong>{name}</strong>
                      <br />
                      Position: {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
                    </Popup>
                  </Marker>
                ))}

                {/* Render Ship Routes */}
                {Object.entries(getShipRoutes()).map(([mmsi, route]) => {
                  const segments = getRouteSegments(route);
                  return segments.map((segment, index) => (
                    <Polyline
                      key={`${mmsi}-${index}`}
                      positions={segment.positions}
                      color={segment.color}
                      weight={getLineWeight(mmsi)}
                      opacity={selectedShip === mmsi ? 1 : 0.6}
                    >
                      <Popup>
                        <strong>{shipRoutes.ships[mmsi]}</strong>
                        <br />
                        Speed: {segment.speed.toFixed(1)} knots
                      </Popup>
                    </Polyline>
                  ));
                })}

                {/* Render Ships */}
                {getCurrentShipPositions().map((ship) => (
                  <Marker
                    key={ship.mmsi}
                    position={[ship.lat, ship.lon]}
                    icon={shipIcon}
                    eventHandlers={{
                      click: () => setSelectedShip(ship.mmsi)
                    }}
                  >
                    <Popup>
                      <strong>{ship.shipName}</strong>
                      <br />
                      MMSI: {ship.mmsi}
                      <br />
                      Speed: {ship.speed.toFixed(1)} knots
                      <br />
                      Position: {ship.lat.toFixed(4)}°N, {ship.lon.toFixed(4)}°E
                      <br />
                      Last Update: {ship.start_time}
                    </Popup>
                  </Marker>
                ))}

                {route && (
                  <Polyline
                    positions={route.route}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                  />
                )}

                {trafficData.map((row, i) =>
                  row.map(([lat, lon, density], j) => (
                    <div
                      key={`traffic-${i}-${j}`}
                      style={{
                        position: 'absolute',
                        left: `${lon}px`,
                        top: `${lat}px`,
                        width: '10px',
                        height: '10px',
                        backgroundColor: `rgba(255, 0, 0, ${density})`,
                        borderRadius: '50%',
                      }}
                    />
                  ))
                )}
              </MapContainer>
            </div>
          </div>

          {/* Bottom Row Panels */}
          <div className="row mt-3">
            <div className="col-md-4">
              <GeopoliticalPanel center={mapCenter}/>
            </div>
            <div className="col-md-4">
              <WeatherPanel center={mapCenter}/>
            </div>
            <div className="col-md-4">
              <PathPlanningPanel/> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
