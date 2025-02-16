import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NewsPanel from './components/NewsPanel';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Agent Panel Components
const WeatherPanel = ({ data }) => (
  <div className="agent-panel">
    <h5 className="panel-title">Weather Analysis Agent</h5>
    <div className="panel-content">
      <div className="chart-container">
        {/* Placeholder for weather impact chart */}
        <div className="placeholder-chart">
          <div className="chart-line" style={{ height: '60%' }}></div>
          <div className="chart-line" style={{ height: '80%' }}></div>
          <div className="chart-line" style={{ height: '40%' }}></div>
        </div>
      </div>
      <div className="panel-info">
        <p>Weather Impact Score: 7.5/10</p>
        <p>Major weather systems affecting routes: 2</p>
      </div>
    </div>
  </div>
);

const GeopoliticalPanel = ({ data }) => (
  <div className="agent-panel">
    <h5 className="panel-title">Geopolitical Risk Agent</h5>
    <div className="panel-content">
      <div className="chart-container">
        <div className="risk-indicator high"></div>
        <div className="risk-zones">
          <div className="risk-zone" style={{ height: '30%', backgroundColor: 'rgba(255,0,0,0.2)' }}></div>
          <div className="risk-zone" style={{ height: '40%', backgroundColor: 'rgba(255,165,0,0.2)' }}></div>
          <div className="risk-zone" style={{ height: '30%', backgroundColor: 'rgba(0,255,0,0.2)' }}></div>
        </div>
      </div>
      <div className="panel-info">
        <p>Current Risk Level: High</p>
        <p>Active Conflict Zones: 3</p>
      </div>
    </div>
  </div>
);

const TrafficPanel = ({ data }) => (
  <div className="agent-panel">
    <h5 className="panel-title">Maritime Traffic Agent</h5>
    <div className="panel-content">
      <div className="chart-container">
        <div className="traffic-bars">
          {[60, 80, 40, 90, 70, 50].map((height, i) => (
            <div key={i} className="traffic-bar" style={{ height: `${height}%` }}></div>
          ))}
        </div>
      </div>
      <div className="panel-info">
        <p>Active Vessels: 1,247</p>
        <p>Congestion Level: Moderate</p>
      </div>
    </div>
  </div>
);

const PredictionPanel = ({ data }) => (
  <div className="agent-panel">
    <h5 className="panel-title">Route Prediction Agent</h5>
    <div className="panel-content">
      <div className="chart-container">
        <div className="prediction-graph">
          <div className="prediction-line"></div>
          <div className="confidence-interval"></div>
        </div>
      </div>
      <div className="panel-info">
        <p>Optimal Route Confidence: 85%</p>
        <p>Alternative Routes: 3</p>
      </div>
    </div>
  </div>
);

function App() {
  const [startPoint, setStartPoint] = useState({ lat: 37.7749, lon: -122.4194 });
  const [endPoint, setEndPoint] = useState({ lat: 34.0522, lon: -118.2437 });
  const [season, setSeason] = useState('summer');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [trafficData, setTrafficData] = useState([]); // Initialize as empty array

  const fetchRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint,
          season: season
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();
      setRoute(data);
      
      // Fetch speed prediction
      const speedResponse = await fetch('http://localhost:8000/api/speed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: startPoint,
          time: new Date().toISOString()
        })
      });

      if (speedResponse.ok) {
        const speedData = await speedResponse.json();
        setSpeed(speedData.predicted_speed);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch traffic data on component mount
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/traffic');
        if (response.ok) {
          const data = await response.json();
          setTrafficData(data.traffic_density || []);
        }
      } catch (err) {
        console.error('Failed to fetch traffic data:', err);
      }
    };

    fetchTraffic();
    // Refresh traffic data every 5 minutes
    const interval = setInterval(fetchTraffic, 300000);
    return () => clearInterval(interval);
  }, []);

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
                center={[37.7749, -122.4194]}
                zoom={5}
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {route && (
                  <Polyline
                    positions={route.route}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                  />
                )}

                <Marker position={[startPoint.lat, startPoint.lon]}>
                  <Popup>Start Point</Popup>
                </Marker>
                <Marker position={[endPoint.lat, endPoint.lon]}>
                  <Popup>End Point</Popup>
                </Marker>

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
              <GeopoliticalPanel />
            </div>
            <div className="col-md-4">
              <PredictionPanel />
            </div>
            <div className="col-md-4">
              <WeatherPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
