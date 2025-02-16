import React, { useState, useEffect } from 'react';

const WeatherPanel = ({ center }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    useEffect(() => {
    const fetchWeather = async () => {
      if (!center) return;
      try {
        console.log(center);
        const response = await fetch(`http://localhost:8000/weather/api/weather?lat=${center.lat}&lon=${center.lon}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, [center?.lat, center?.lon]);


  if (loading) {
    return (
      <div className="agent-panel" style={{ height: '100%' }}>
        <h5 className="panel-title">Weather Analysis Agent</h5>
        <div className="panel-content" style={{ height: 'calc(100% - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-panel" style={{ height: '100%' }}>
        <h5 className="panel-title">Weather Analysis Agent</h5>
        <div className="panel-content" style={{ height: 'calc(100% - 48px)' }}>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  const formatTemperature = (temp) => {
    return (temp - 273.15).toFixed(2);
  };

  return (
    <div className="agent-panel" style={{ height: '100%' }}>
      <h5 className="panel-title">Weather Analysis Agent</h5>
      <div className="panel-content" style={{ height: 'calc(100% - 48px)', overflowY: 'auto' }}>
        {/* <div className="chart-container">
          <div className="placeholder-chart">
            <div className="chart-line" style={{ height: '60%' }}></div>
            <div className="chart-line" style={{ height: '80%' }}></div>
            <div className="chart-line" style={{ height: '40%' }}></div>
          </div>
        </div> */}
        {/* <div className="panel-info">
          <p>Weather Impact Score: 7.5/10</p>
          <p>Major weather systems affecting routes: 2</p>
        </div> */}
        {weather && (
          <div className="panel-info">
            <p><strong>Location:</strong> ({weather.latitude}, {weather.longitude})</p>
            <p><strong>Date/Time:</strong> {new Date(weather.datetime).toLocaleString()}</p>
            <p><strong>Description:</strong> {weather.description}</p>
            <p><strong>Temperature:</strong> {formatTemperature(weather.temperature)}°C</p>
            <p><strong>Humidity:</strong> {weather.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weather.wind_speed} m/s</p>
            <p><strong>Visibility:</strong> {(weather.visibility / 1000).toFixed(2)} km</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherPanel;
