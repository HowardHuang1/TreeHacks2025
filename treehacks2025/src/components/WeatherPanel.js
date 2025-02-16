import React, { useState, useEffect } from 'react';

const WeatherPanel = ({ center }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!center) return;
            try {
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

    const formatTemperature = (temp) => {
        return (temp - 273.15).toFixed(1);
    };

    const getWeatherIcon = (description) => {
        const desc = description?.toLowerCase() || '';
        if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
        if (desc.includes('cloud')) return '⛅';
        if (desc.includes('rain')) return '🌧️';
        if (desc.includes('storm')) return '⛈️';
        if (desc.includes('snow')) return '🌨️';
        if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
        return '🌡️';
    };

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

    return (
        <div className="agent-panel" style={{ height: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <h5 className="panel-title" style={{ marginBottom: '5px', fontSize: '1em', padding: '8px' }}>Weather Analysis Agent</h5>
            {weather && (
                <div className="panel-content" style={{ 
                    height: 'calc(100% - 35px)', 
                    padding: '5px 0px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    marginLeft: '-12px'
                }}>
                    <div style={{ 
                        textAlign: 'center',
                        padding: '5px',
                        marginBottom: '5px',
                        marginLeft: '12px',
                        marginRight: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px'
                    }}>
                        <div style={{ fontSize: '1.3em', marginBottom: '2px', lineHeight: '1.2' }}>
                            {getWeatherIcon(weather.description)}
                        </div>
                        <div style={{ fontSize: '1.4em', fontWeight: 'bold', margin: '2px 0', lineHeight: '1.2' }}>
                            {formatTemperature(weather.temperature)}°C
                        </div>
                        <div style={{ opacity: 0.8, fontSize: '0.9em', lineHeight: '1.2' }}>
                            {weather.description}
                        </div>
                    </div>
                    
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        fontSize: '0.9em',
                        marginLeft: '-18px',
                        marginRight: '10px',
                        lineHeight: '1.2'
                    }}>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{ opacity: 0.7, marginBottom: '1px' }}>Wind Speed</div>
                            <div style={{ whiteSpace: 'nowrap' }}>💨 {weather.wind_speed} m/s</div>
                        </div>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{ opacity: 0.7, marginBottom: '1px' }}>Humidity</div>
                            <div style={{ whiteSpace: 'nowrap' }}>💧 {weather.humidity}%</div>
                        </div>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{ opacity: 0.7, marginBottom: '1px' }}>Visibility</div>
                            <div style={{ whiteSpace: 'nowrap' }}>👁️ {(weather.visibility / 1000).toFixed(1)} km</div>
                        </div>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{ opacity: 0.7, marginBottom: '1px' }}>Location</div>
                            <div style={{ whiteSpace: 'nowrap' }}>📍 {weather.latitude.toFixed(1)}°, {weather.longitude.toFixed(1)}°</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherPanel;
