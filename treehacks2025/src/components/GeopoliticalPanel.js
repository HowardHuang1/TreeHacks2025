import React, { useState, useEffect } from 'react';

const GeopoliticalPanel = ({ center }) => {
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    useEffect(() => {
    const fetchRisk = async () => {
      if (!center) return;
      try {
        console.log(center);
        const response = await fetch(`http://localhost:8000/langchain_agent/api/langchain_agent?lat=${center.lat}&lon=${center.lon}`);
        if (!response.ok) {
          throw new Error('Failed to fetch risk level');
        }
        console.log(response);
        const data = await response.json();
        const riskValue = parseFloat(data);
        setRisk(riskValue);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch risk data');
        setLoading(false);
      }
    };

    fetchRisk();
    const interval = setInterval(fetchRisk, 300000);
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

  const getRiskIndicator = (value) => {
    if (value >= 0.7) return 'high';
    if (value >= 0.4) return 'medium';
    return 'low';
  };

  const riskIndicatorClass = getRiskIndicator(risk);
  const riskText = riskIndicatorClass.charAt(0).toUpperCase() + riskIndicatorClass.slice(1);

  //TODO: change dot place in the chart
  return (
  <div className="agent-panel">
    <h5 className="panel-title">Geopolitical Risk Agent</h5>
    <div className="panel-content">
      <div className="chart-container">
        <div className={`risk-indicator ${riskIndicatorClass}`}>{riskText}</div>
        <div className="risk-zones">
          <div className="risk-zone" style={{ height: '30%', backgroundColor: 'rgba(255,0,0,0.2)' }}></div>
          <div className="risk-zone" style={{ height: '40%', backgroundColor: 'rgba(255,165,0,0.2)' }}></div>
          <div className="risk-zone" style={{ height: '30%', backgroundColor: 'rgba(0,255,0,0.2)' }}></div>
        </div>
      </div>
      <div className="panel-info">
        <p>Current Risk Zone: {riskText}</p>
        <p>Current Risk Level: {risk}</p>
      </div>
    </div>
  </div>
  );
};

export default GeopoliticalPanel;