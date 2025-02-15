import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [startPoint, setStartPoint] = useState({ lat: 37.7749, lon: -122.4194 });
  const [endPoint, setEndPoint] = useState({ lat: 35.6762, lon: -140.6503 });
  const [route, setRoute] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [season, setSeason] = useState('summer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(null);

  const fetchRoute = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/predict_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint,
          season: season,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch route');
      setRoute(data);
      
      // Fetch speed prediction for the start point
      const speedResponse = await fetch('http://localhost:8000/api/speed_prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: startPoint,
          time: new Date().toISOString(),
        }),
      });
      const speedData = await speedResponse.json();
      setSpeed(speedData.predicted_speed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrafficData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/traffic');
      const data = await response.json();
      setTrafficData(data.traffic_density);
    } catch (err) {
      console.error('Failed to fetch traffic data:', err);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, []);

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Maritime Route Simulator</a>
        </div>
      </nav>

      <div className="row mt-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Route Planning</h5>
              <form onSubmit={fetchRoute}>
                <div className="mb-3">
                  <label className="form-label">Start Point</label>
                  <div className="input-group mb-2">
                    <input
                      type="number"
                      className="form-control"
                      value={startPoint.lat}
                      onChange={(e) => setStartPoint({ ...startPoint, lat: parseFloat(e.target.value) })}
                      placeholder="Latitude"
                      step="any"
                    />
                    <input
                      type="number"
                      className="form-control"
                      value={startPoint.lon}
                      onChange={(e) => setStartPoint({ ...startPoint, lon: parseFloat(e.target.value) })}
                      placeholder="Longitude"
                      step="any"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">End Point</label>
                  <div className="input-group mb-2">
                    <input
                      type="number"
                      className="form-control"
                      value={endPoint.lat}
                      onChange={(e) => setEndPoint({ ...endPoint, lat: parseFloat(e.target.value) })}
                      placeholder="Latitude"
                      step="any"
                    />
                    <input
                      type="number"
                      className="form-control"
                      value={endPoint.lon}
                      onChange={(e) => setEndPoint({ ...endPoint, lon: parseFloat(e.target.value) })}
                      placeholder="Longitude"
                      step="any"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Season</label>
                  <select 
                    className="form-select"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="summer">Summer</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Calculate Route'}
                </button>
              </form>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>

          {route && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Route Information</h5>
                <p>Distance: {route.distance.toFixed(2)} nautical miles</p>
                <p>ETA: {route.eta}</p>
                <p>Predicted Speed: {speed ? `${speed.toFixed(1)} knots` : '-'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              <MapContainer
                center={[37.7749, -122.4194]}
                zoom={5}
                style={{ height: '600px', width: '100%' }}
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
        </div>
      </div>
    </div>
  );
}

export default App;
