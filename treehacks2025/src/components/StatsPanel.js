import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const StatsPanel = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState('voyages');

  const formatNumber = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderDistanceChart = () => {
    const voyages = Object.entries(data.voyages);
    const chartData = {
      labels: voyages.map(([id]) => `Voyage ${id}`),
      datasets: [
        {
          label: 'Additional Distance (nm)',
          data: voyages.map(([, v]) => v.distances.additional),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Direct Distance (nm)',
          data: voyages.map(([, v]) => v.distances.direct),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Diverted Distance (nm)',
          data: voyages.map(([, v]) => v.distances.diverted),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: 'Distance Comparison by Voyage',
          color: 'white',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      }
    };

    return <Bar data={chartData} options={options} />;
  };

  const renderFuelChart = () => {
    const voyages = Object.entries(data.voyages);
    const chartData = {
      labels: voyages.map(([id]) => `Voyage ${id}`),
      datasets: [
        {
          label: 'Additional Fuel Usage (tons)',
          data: voyages.map(([, v]) => v.fuel.additional_tons),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        }
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: 'Additional Fuel Usage by Voyage',
          color: 'white',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      }
    };

    return <Bar data={chartData} options={options} />;
  };

  const renderPriceImpactChart = () => {
    const chartData = {
      labels: data.commodities.map(c => c.Commodity),
      datasets: [
        {
          label: 'Price Impact (%)',
          data: data.commodities.map(c => c['Estimated Price Increase (%)']),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'white'
          }
        },
        title: {
          display: true,
          text: 'Price Impact by Commodity',
          color: 'white',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      }
    };

    return <Bar data={chartData} options={options} />;
  };

  const renderVoyagesTab = () => {
    return (
      <div className="voyages-grid">
        <div className="voyages-summary">
          <h4>Fleet Averages</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="label">Additional Distance</span>
              <span className="value">{formatNumber(data.averages.additional_distance)} nm</span>
            </div>
            <div className="stat-item">
              <span className="label">Additional Time</span>
              <span className="value">{formatNumber(data.averages.additional_time)} hrs</span>
            </div>
            <div className="stat-item">
              <span className="label">Additional Fuel</span>
              <span className="value">{formatNumber(data.averages.additional_fuel)} tons</span>
            </div>
            <div className="stat-item">
              <span className="label">Additional Cost</span>
              <span className="value">${formatNumber(data.averages.additional_cost)}</span>
            </div>
          </div>
        </div>
        
        <div className="charts-container">
          <div className="chart-wrapper">
            {renderDistanceChart()}
          </div>
          <div className="chart-wrapper">
            {renderFuelChart()}
          </div>
        </div>
      </div>
    );
  };

  const renderCommoditiesTab = () => {
    return (
      <div className="commodities-container">
        <div className="chart-wrapper">
          {renderPriceImpactChart()}
        </div>
        <div className="commodities-grid">
          {data.commodities.map((commodity, index) => (
            <div key={index} className="commodity-card">
              <h5>{commodity.Commodity}</h5>
              <div className="commodity-stats">
                <div>
                  <strong>Baseline:</strong> ${formatNumber(commodity['Baseline Price (USD)'])}
                </div>
                <div>
                  <strong>Increase:</strong> {formatNumber(commodity['Estimated Price Increase (%)'])}%
                </div>
                <div>
                  <strong>New Price:</strong> ${formatNumber(commodity['New Price (USD)'])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h3>Maritime Impact Analysis</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="stats-tabs">
        <button
          className={`tab-button ${activeTab === 'voyages' ? 'active' : ''}`}
          onClick={() => setActiveTab('voyages')}
        >
          Voyages
        </button>
        <button
          className={`tab-button ${activeTab === 'commodities' ? 'active' : ''}`}
          onClick={() => setActiveTab('commodities')}
        >
          Commodities
        </button>
      </div>
      <div className="stats-content">
        {activeTab === 'voyages' ? renderVoyagesTab() : renderCommoditiesTab()}
      </div>
      <div className="stats-footer">
        <small>
          Fuel Price: ${data.metadata.fuel_price_per_ton}/ton | 
          Vessel Capacity: {data.metadata.vessel_capacity_teu} TEU | 
          Avg Speed: {data.metadata.avg_speed_knots} knots
        </small>
      </div>
    </div>
  );
};

export default StatsPanel;
