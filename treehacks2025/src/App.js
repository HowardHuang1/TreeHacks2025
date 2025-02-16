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
import StatsPanel from './components/StatsPanel';
import './components/StatsPanel.css';

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
  const [showPorts, setShowPorts] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [shipTrails, setShipTrails] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);

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

  useEffect(() => {
    // Sample stats data
    setStatsData({
      "voyages": {
        "3521": {
          "distances": {
            "direct": 237.66,
            "diverted": 505.05,
            "additional": 267.38
          },
          "time": {
            "direct": 15.84,
            "diverted": 33.67,
            "additional": 17.83
          },
          "fuel": {
            "additional_tons": 44.56,
            "additional_cost": 35650.9
          },
          "cost_impact": {
            "per_teu": 3.57,
            "percentage": 0.01
          }
        },
        "5801": {
          "distances": {
            "direct": 72.84,
            "diverted": 110.01,
            "additional": 37.17
          },
          "time": {
            "direct": 4.86,
            "diverted": 7.33,
            "additional": 2.48
          },
          "fuel": {
            "additional_tons": 6.19,
            "additional_cost": 4955.56
          },
          "cost_impact": {
            "per_teu": 0.5,
            "percentage": 0.0
          }
        },
        "5900": {
          "distances": {
            "direct": 682.13,
            "diverted": 818.83,
            "additional": 136.7
          },
          "time": {
            "direct": 45.48,
            "diverted": 54.59,
            "additional": 9.11
          },
          "fuel": {
            "additional_tons": 22.78,
            "additional_cost": 18226.08
          },
          "cost_impact": {
            "per_teu": 1.82,
            "percentage": 0.0
          }
        }
      },
      "commodities": [
        {
          "Commodity": "Electronics",
          "Baseline Price (USD)": 1000,
          "Impact Multiplier": 1.2,
          "Estimated Price Increase (%)": 0.0048,
          "New Price (USD)": 1000.048
        },
        {
          "Commodity": "Clothing",
          "Baseline Price (USD)": 50,
          "Impact Multiplier": 0.8,
          "Estimated Price Increase (%)": 0.0032,
          "New Price (USD)": 50.0016
        },
        {
          "Commodity": "Food Products",
          "Baseline Price (USD)": 200,
          "Impact Multiplier": 1.5,
          "Estimated Price Increase (%)": 0.006,
          "New Price (USD)": 200.012
        }
      ],
      "averages": {
        "additional_distance": 140.86,
        "additional_time": 9.392,
        "additional_fuel": 23.474,
        "additional_cost": 18781.224,
        "price_impact": 0.004
      },
      "metadata": {
        "fuel_price_per_ton": 800,
        "vessel_capacity_teu": 10000,
        "avg_speed_knots": 15
      }
    });
  }, []);

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

  // Simulation data - realistic water routes
  const simulatedShips = [
    {
      id: 'ship1',
      name: 'Cargo Vessel Alpha',
      type: 'cargo',
      route: [
        { lat: 26.4511, lon: 56.3519, time: 0 },    // Strait of Hormuz Entry
        { lat: 26.2858, lon: 55.2916, time: 20 },   // Gulf of Oman
        { lat: 25.8103, lon: 54.5371, time: 40 },   // Deep Water Route
        { lat: 25.3103, lon: 53.9915, time: 60 },   // Main Shipping Channel
        { lat: 24.9707, lon: 53.1225, time: 80 },   // Deep Persian Gulf
        { lat: 24.5651, lon: 52.7539, time: 100 }   // Abu Dhabi Approach
      ]
    },
    {
      id: 'ship2',
      name: 'Tanker Beta',
      type: 'tanker',
      route: [
        { lat: 29.3375, lon: 49.1890, time: 0 },    // Kuwait Port
        { lat: 28.9212, lon: 49.3023, time: 20 },   // Northern Gulf
        { lat: 28.4347, lon: 49.8245, time: 40 },   // Central Gulf Route
        { lat: 27.9481, lon: 50.3468, time: 60 },   // Bahrain Waters
        { lat: 27.4615, lon: 50.9691, time: 80 },   // Qatar Waters
        { lat: 26.9749, lon: 51.5914, time: 100 }   // UAE Waters
      ]
    },
    {
      id: 'ship3',
      name: 'Container Ship Gamma',
      type: 'container',
      route: [
        { lat: 25.3567, lon: 57.4539, time: 0 },    // Gulf of Oman
        { lat: 25.6345, lon: 56.8456, time: 20 },   // Eastern Route
        { lat: 25.8901, lon: 56.2345, time: 40 },   // Strait Approach
        { lat: 26.1567, lon: 55.6234, time: 60 },   // Gulf Entry
        { lat: 26.3234, lon: 54.9123, time: 80 },   // Deep Water Zone
        { lat: 26.5890, lon: 54.2012, time: 100 }   // Northern Route
      ]
    },
    {
      id: 'ship4',
      name: 'LNG Carrier Delta',
      type: 'lng',
      route: [
        { lat: 27.8812, lon: 51.6123, time: 0 },    // Qatar Gas Terminal
        { lat: 27.5456, lon: 52.1901, time: 20 },   // Qatar Export Route
        { lat: 27.1321, lon: 52.7654, time: 40 },   // Deep Channel
        { lat: 26.7987, lon: 53.3876, time: 60 },   // Main Route
        { lat: 26.3765, lon: 53.9765, time: 80 },   // Export Lane
        { lat: 25.9432, lon: 54.5654, time: 100 }   // International Waters
      ]
    },
    {
      id: 'ship5',
      name: 'Research Vessel Epsilon',
      type: 'research',
      route: [
        { lat: 24.9678, lon: 54.5765, time: 0 },    // Abu Dhabi Coast
        { lat: 24.7234, lon: 54.1876, time: 20 },   // Research Zone A
        { lat: 24.4890, lon: 53.7765, time: 40 },   // Marine Study Area
        { lat: 24.2456, lon: 53.3654, time: 60 },   // Coral Research
        { lat: 24.0012, lon: 52.9543, time: 80 },   // Marine Lab
        { lat: 23.7567, lon: 52.5432, time: 100 }   // Return Route
      ]
    },
    {
      id: 'ship6',
      name: 'Military Vessel Zeta',
      type: 'military',
      route: [
        { lat: 28.4654, lon: 50.5432, time: 0 },    // Northern Patrol
        { lat: 28.1210, lon: 50.9321, time: 20 },   // Security Zone 1
        { lat: 27.7765, lon: 51.3210, time: 40 },   // Patrol Area
        { lat: 27.3321, lon: 51.7109, time: 60 },   // Security Zone 2
        { lat: 26.9876, lon: 52.1098, time: 80 },   // Deep Water Patrol
        { lat: 26.5432, lon: 52.5987, time: 100 }   // Return Base
      ]
    },
    {
      id: 'ship7',
      name: 'Cruise Liner Eta',
      type: 'cruise',
      route: [
        { lat: 25.8234, lon: 57.1890, time: 0 },    // Muscat Departure
        { lat: 25.5765, lon: 56.6901, time: 20 },   // Scenic Route
        { lat: 25.3432, lon: 56.1012, time: 40 },   // Tourist Spots
        { lat: 25.1109, lon: 55.5765, time: 60 },   // Dubai Approach
        { lat: 24.9765, lon: 55.1654, time: 80 },   // Dubai Waters
        { lat: 24.7432, lon: 54.7543, time: 100 }   // Abu Dhabi Cruise
      ]
    },
    {
      id: 'ship8',
      name: 'Fishing Fleet Theta',
      type: 'fishing',
      route: [
        { lat: 26.1234, lon: 53.5678, time: 0 },    // Fishing Ground A
        { lat: 26.3901, lon: 53.2789, time: 20 },   // Rich Waters
        { lat: 26.5678, lon: 52.9890, time: 40 },   // Deep Sea Fish
        { lat: 26.7345, lon: 52.6901, time: 60 },   // Fishing Zone B
        { lat: 26.9012, lon: 52.4012, time: 80 },   // Return Route
        { lat: 27.1679, lon: 52.1123, time: 100 }   // Port Return
      ]
    },
    {
      id: 'ship9',
      name: 'Supply Vessel Iota',
      type: 'supply',
      route: [
        { lat: 28.9456, lon: 48.9345, time: 0 },    // Kuwait Supply Base
        { lat: 28.6123, lon: 49.2456, time: 20 },   // Oil Platform A
        { lat: 28.2789, lon: 49.5567, time: 40 },   // Service Route
        { lat: 27.9456, lon: 49.8678, time: 60 },   // Oil Platform B
        { lat: 27.6123, lon: 50.1789, time: 80 },   // Supply Route
        { lat: 27.2789, lon: 50.4890, time: 100 }   // Return Base
      ]
    },
    {
      id: 'ship10',
      name: 'Yacht Kappa',
      type: 'yacht',
      route: [
        { lat: 25.6876, lon: 55.1210, time: 0 },    // Dubai Marina
        { lat: 25.4987, lon: 54.8321, time: 20 },   // Leisure Route
        { lat: 25.3098, lon: 54.5432, time: 40 },   // Island Tour
        { lat: 25.1209, lon: 54.2543, time: 60 },   // Scenic Waters
        { lat: 24.9320, lon: 53.9654, time: 80 },   // Yacht Club
        { lat: 24.7431, lon: 53.6765, time: 100 }   // Marina Return
      ]
    }
  ];

  // Function to interpolate ship position
  const getInterpolatedPosition = (route, time) => {
    if (time <= 0) return { ...route[0], heading: 0 };
    if (time >= 100) return { ...route[route.length - 1], heading: 0 };

    for (let i = 0; i < route.length - 1; i++) {
      const currentPoint = route[i];
      const nextPoint = route[i + 1];
      
      if (time >= currentPoint.time && time <= nextPoint.time) {
        const timeProgress = (time - currentPoint.time) / (nextPoint.time - currentPoint.time);
        return {
          lat: currentPoint.lat + (nextPoint.lat - currentPoint.lat) * timeProgress,
          lon: currentPoint.lon + (nextPoint.lon - currentPoint.lon) * timeProgress,
          heading: Math.atan2(
            nextPoint.lon - currentPoint.lon,
            nextPoint.lat - currentPoint.lat
          ) * (180 / Math.PI)
        };
      }
    }
    return { ...route[0], heading: 0 };
  };

  // Simulation effect
  useEffect(() => {
    let animationFrame;
    const updateSimulation = () => {
      if (isSimulating) {
        setSimulationTime(prev => {
          const newTime = prev + 0.2 * simulationSpeed;
          return newTime > 100 ? 0 : newTime;
        });
        animationFrame = requestAnimationFrame(updateSimulation);
      }
    };

    if (isSimulating) {
      animationFrame = requestAnimationFrame(updateSimulation);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isSimulating, simulationSpeed]);

  // Update ship trails when simulation time changes
  useEffect(() => {
    if (isSimulating) {
      const newTrails = {};
      simulatedShips.forEach(ship => {
        // Keep last 5 positions for trail effect
        const currentPos = getInterpolatedPosition(ship.route, simulationTime);
        const prevTrail = shipTrails[ship.id] || [];
        newTrails[ship.id] = [...prevTrail, currentPos].slice(-5);
      });
      setShipTrails(newTrails);
    }
  }, [simulationTime, isSimulating]);

  return (
    <div className="container-fluid dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Maritime Route Simulator</a>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setShowStats(true)}
              style={{
                background: 'rgba(76, 175, 80, 0.2)',
                border: '1px solid #4CAF50',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(5px)',
                fontSize: '0.9em'
              }}
            >
              <span>📊 View Impact Analysis</span>
            </button>
          </div>
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
          <div className="card map-card" style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="card-body" style={{ padding: '15px' }}>
              {/* Map Controls */}
              <div style={{
                position: 'absolute',
                top: '25px',
                left: '25px',
                zIndex: 1000,
                background: 'rgba(26, 26, 26, 0.9)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '1.2em', 
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#fff'
                }}>
                  Maritime Route Controls
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setShowPorts(!showPorts)}
                    style={{
                      background: showPorts ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid ' + (showPorts ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'),
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ opacity: showPorts ? 1 : 0.7 }}>🚢 Show Ports</span>
                  </button>
                  <button
                    onClick={() => setShowRoutes(!showRoutes)}
                    style={{
                      background: showRoutes ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid ' + (showRoutes ? '#2196F3' : 'rgba(255, 255, 255, 0.2)'),
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ opacity: showRoutes ? 1 : 0.7 }}>🛣️ Show Routes</span>
                  </button>
                </div>
              </div>

              {/* Simulation Controls */}
              <div style={{
                position: 'absolute',
                bottom: '25px',
                left: '25px',
                zIndex: 1000,
                background: 'rgba(26, 26, 26, 0.9)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ 
                  fontSize: '0.9em', 
                  fontWeight: 'bold',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Route Simulation</span>
                  <span style={{ 
                    fontSize: '0.8em',
                    opacity: 0.7
                  }}>
                    {Math.round(simulationTime)}%
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    style={{
                      background: isSimulating ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                      border: `1px solid ${isSimulating ? '#F44336' : '#4CAF50'}`,
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9em'
                    }}
                  >
                    {isSimulating ? '⏹️ Stop' : '▶️ Play'}
                  </button>
                  <select
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    <option value={0.5}>0.5x Speed</option>
                    <option value={1}>1x Speed</option>
                    <option value={2}>2x Speed</option>
                    <option value={4}>4x Speed</option>
                  </select>
                </div>
              </div>

              {/* Map Legend */}
              <div style={{
                position: 'absolute',
                bottom: '25px',
                right: '25px',
                zIndex: 1000,
                background: 'rgba(26, 26, 26, 0.9)',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '0.9em', 
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#fff'
                }}>
                  Legend
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.85em'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      background: '#4CAF50'
                    }}></div>
                    <span style={{ opacity: 0.8 }}>Safe Route</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      background: '#FFC107'
                    }}></div>
                    <span style={{ opacity: 0.8 }}>Medium Risk</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      background: '#FF5722'
                    }}></div>
                    <span style={{ opacity: 0.8 }}>High Risk</span>
                  </div>
                </div>
              </div>

              {/* Map Stats */}
              <div style={{
                position: 'absolute',
                top: '25px',
                right: '25px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px'
              }}>
                <div style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ opacity: 0.7, fontSize: '0.85em' }}>Active Ships:</span>
                  <span style={{ 
                    color: '#4CAF50',
                    fontWeight: 'bold',
                    fontSize: '0.9em'
                  }}>24</span>
                </div>
                <div style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ opacity: 0.7, fontSize: '0.85em' }}>Active Routes:</span>
                  <span style={{ 
                    color: '#2196F3',
                    fontWeight: 'bold',
                    fontSize: '0.9em'
                  }}>8</span>
                </div>
              </div>

              {showStats && statsData && (
                <StatsPanel
                  data={statsData}
                  onClose={() => setShowStats(false)}
                />
              )}

              <MapContainer
                center={[mapCenter.lat, mapCenter.lon]}
                zoom={5}
                style={{ height: '500px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <CenterCoordinates setCenter={setMapCenter} />

                {/* Render Ports */}
                {showPorts && shipRoutes?.ports && Object.entries(shipRoutes.ports).map(([name, coords]) => (
                  <Marker
                    key={name}
                    position={[coords.lat, coords.lon]}
                    icon={new L.Icon({
                      iconUrl: svgToDataUrl(portIconSvg),
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                      popupAnchor: [0, -12],
                    })}
                  />
                ))}

                {/* Render Ship Routes */}
                {showRoutes && Object.entries(getShipRoutes()).map(([mmsi, route]) => {
                  const segments = getRouteSegments(route);
                  return segments.map((segment, index) => (
                    <Polyline
                      key={`${mmsi}-${index}`}
                      positions={segment.positions}
                      pathOptions={{
                        color: getSpeedColor(segment.speed),
                        weight: 3,
                        opacity: 0.8,
                        dashArray: '10, 10',
                        lineCap: 'round',
                        lineJoin: 'round',
                        className: 'animated-line'
                      }}
                    >
                      <Popup>
                        <div style={{
                          padding: '8px',
                          background: '#1a1a1a',
                          borderRadius: '6px',
                          color: 'white'
                        }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            marginBottom: '4px' 
                          }}>
                            Route Details
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            <div>MMSI: {mmsi}</div>
                            <div>Speed: {segment.speed.toFixed(1)} knots</div>
                          </div>
                        </div>
                      </Popup>
                    </Polyline>
                  ));
                })}

                {/* Add CSS for animated route lines */}
                <style>
                  {`
                    .animated-line {
                      stroke-dashoffset: 0;
                      animation: dash 30s linear infinite;
                    }
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -100;
                      }
                    }
                  `}
                </style>

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

                {/* Render Simulated Ships */}
                {isSimulating && simulatedShips.map(ship => {
                  const position = getInterpolatedPosition(ship.route, simulationTime);
                  const getShipIcon = (type) => {
                    switch(type) {
                      case 'cargo': return '📦';
                      case 'tanker': return '⛽';
                      case 'container': return '🚢';
                      case 'lng': return '💨';
                      case 'bulk': return '🏗️';
                      case 'roro': return '🚗';
                      case 'cruise': return '🛳️';
                      case 'research': return '🔬';
                      case 'military': return '⚓';
                      case 'fishing': return '🎣';
                      case 'supply': return '🛟';
                      case 'yacht': return '⛵';
                      default: return '🚢';
                    }
                  };
                  
                  const getShipColor = (type) => {
                    switch(type) {
                      case 'cargo': return '#4CAF50';
                      case 'tanker': return '#FF5722';
                      case 'container': return '#2196F3';
                      case 'lng': return '#9C27B0';
                      case 'bulk': return '#FFC107';
                      case 'roro': return '#00BCD4';
                      case 'cruise': return '#E91E63';
                      case 'research': return '#673AB7';
                      case 'military': return '#795548';
                      case 'fishing': return '#009688';
                      case 'supply': return '#FF9800';
                      case 'yacht': return '#03A9F4';
                      default: return '#2196F3';
                    }
                  };

                  return (
                    <React.Fragment key={ship.id}>
                      {/* Draw the full route */}
                      <Polyline
                        positions={ship.route.map(point => [point.lat, point.lon])}
                        color={getShipColor(ship.type)}
                        weight={2}
                        opacity={0.4}
                        dashArray="5, 10"
                      />
                      
                      {/* Draw the ship's recent trail */}
                      {shipTrails[ship.id] && shipTrails[ship.id].length > 1 && (
                        <Polyline
                          positions={shipTrails[ship.id].map(point => [point.lat, point.lon])}
                          color={getShipColor(ship.type)}
                          weight={3}
                          opacity={0.8}
                        >
                          <Popup>
                            {ship.name}'s Recent Path
                          </Popup>
                        </Polyline>
                      )}
                      <Marker
                        position={[position.lat, position.lon]}
                        icon={new L.DivIcon({
                          className: 'custom-div-icon',
                          html: `
                            <div style="
                              background: rgba(26, 26, 26, 0.95);
                              padding: 8px;
                              border-radius: 50%;
                              border: 2px solid ${getShipColor(ship.type)};
                              box-shadow: 0 0 15px ${getShipColor(ship.type)}40;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              backdrop-filter: blur(5px);
                              transform: rotate(${position.heading}deg);
                              transition: all 0.3s ease;
                              animation: pulse 2s infinite;
                            ">
                              <div style="
                                font-size: 16px;
                                color: ${getShipColor(ship.type)};
                                text-shadow: 0 0 10px ${getShipColor(ship.type)}40;
                              ">${getShipIcon(ship.type)}</div>
                            </div>
                            <div style="
                              position: absolute;
                              bottom: -20px;
                              left: 50%;
                              transform: translateX(-50%);
                              background: rgba(26, 26, 26, 0.95);
                              padding: 3px 8px;
                              border-radius: 4px;
                              font-size: 10px;
                              color: white;
                              white-space: nowrap;
                              backdrop-filter: blur(5px);
                              border: 1px solid ${getShipColor(ship.type)}40;
                              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                            ">${ship.name}</div>
                            <style>
                              @keyframes pulse {
                                0% {
                                  box-shadow: 0 0 15px ${getShipColor(ship.type)}40;
                                }
                                50% {
                                  box-shadow: 0 0 25px ${getShipColor(ship.type)}60;
                                }
                                100% {
                                  box-shadow: 0 0 15px ${getShipColor(ship.type)}40;
                                }
                              }
                            </style>`,
                          iconSize: [40, 40],
                          iconAnchor: [20, 20]
                        })}
                      >
                        <Popup>
                          <div style={{
                            padding: '10px',
                            background: '#1a1a1a',
                            borderRadius: '6px',
                            color: 'white',
                            border: `1px solid ${getShipColor(ship.type)}40`
                          }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              marginBottom: '6px',
                              color: getShipColor(ship.type)
                            }}>
                              {ship.name}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                              <div>Type: {ship.type.charAt(0).toUpperCase() + ship.type.slice(1)}</div>
                              <div>Position: {position.lat.toFixed(4)}°N, {position.lon.toFixed(4)}°E</div>
                              <div>Progress: {Math.round(simulationTime)}%</div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}

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
          <div className="row mt-4">
            <div className="col-md-4">
              <div style={{ height: '320px' }}>
                <GeopoliticalPanel center={mapCenter}/>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ height: '320px' }}>
                <WeatherPanel center={mapCenter}/>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ height: '320px' }}>
                <PathPlanningPanel/> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
