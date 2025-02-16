import React, { useState, useEffect } from 'react';

const PathPlanningPanel = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPorts, setSelectedPorts] = useState([]);

    const ports = [
      { name: 'Port 1', lat: 57.704516, lon: 22.848808 },
      { name: 'Port 2', lat: 57.715716, lon: 21.917899 }
    ];

    useEffect(() => {
      setLoading(false);
    }, []);

    const handleSelection = (event) => {
      const selectedOptions = Array.from(event.target.selectedOptions).map(option => {
        const port = ports.find(p => p.name === option.value);
        return port ? { lat: port.lat, lon: port.lon } : null;
      }).filter(Boolean);
      setSelectedPorts(selectedOptions);
    };

    const sendPortsToBackend = async () => {
      const payload = { selectedPorts };
      console.log('Payload:', payload);
      try {
        const response = await fetch('http://localhost:8000/ports/api/ports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to send ports to the backend');
        }
        const data = await response.json();
        console.log('Response from backend:', data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to send ports to the backend');
      }
    };

    if (loading) {
      return (
        <div className="agent-panel" style={{ height: '100%' }}>
          <h5 className="panel-title">Path Planning Agent</h5>
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
          <h5 className="panel-title">Path Planning Agent</h5>
          <div className="panel-content" style={{ height: 'calc(100% - 48px)' }}>
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="agent-panel" style={{ height: '100%' }}>
        <h5 className="panel-title">Path Planning Agent</h5>
        <div className="panel-content" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div className="dropdown-container" style={{ width: '100px' }}>
            {/* <label htmlFor="ports" className="w-100 text-center">Select Ports:</label> */}
            <select id="ports" multiple onChange={handleSelection} className="form-select w-100" style={{ height: '100px' }}>
              {ports.map((port, index) => (
                <option key={index} value={port.name}>{port.name}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary mt-3 w-100" style={{ width: '80px' }} onClick={sendPortsToBackend}>Close</button>
        </div>
      </div>
    );
};

export default PathPlanningPanel;
