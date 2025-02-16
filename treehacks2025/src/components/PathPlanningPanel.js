import React, { useState, useEffect } from 'react';

const PathPlanningPanel = () => {
    const [currentRoute, setCurrentRoute] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [optimization, setOptimization] = useState(0);
    const [fuelSaved, setFuelSaved] = useState(0);
    const [timeReduction, setTimeReduction] = useState(0);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationPhase, setOptimizationPhase] = useState('');

    const phases = [
        "Analyzing weather patterns...",
        "Calculating geopolitical risk factors...",
        "Optimizing fuel consumption...",
        "Computing alternative routes...",
        "Finalizing recommendations..."
    ];

    // Simulate route optimization
    useEffect(() => {
        const simulateOptimization = () => {
            setIsOptimizing(true);
            let progress = 0;
            let phaseIndex = 0;
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                
                // Update phase message
                if (progress > (phaseIndex + 1) * 20 && phaseIndex < phases.length - 1) {
                    phaseIndex++;
                    setOptimizationPhase(phases[phaseIndex]);
                }

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setIsOptimizing(false);
                    
                    // Generate new random metrics
                    const newFuelSaved = Math.floor(Math.random() * 20 + 10);
                    const newTimeReduction = Math.floor(Math.random() * 15 + 5);
                    setFuelSaved(newFuelSaved);
                    setTimeReduction(newTimeReduction);
                    
                    // Generate routes with varying characteristics
                    const generateRoute = (name, riskLevel, distanceBase, timeBase) => ({
                        name,
                        risk: riskLevel,
                        distance: (distanceBase + Math.floor(Math.random() * 100)).toLocaleString(),
                        time: `${timeBase}d ${Math.floor(Math.random() * 12)}h`,
                        fuelEfficiency: Math.floor(Math.random() * 30 + 70),
                        weatherScore: Math.floor(Math.random() * 40 + 60)
                    });

                    const routes = [
                        generateRoute("Northern Route", "Low", 1800, 4),
                        generateRoute("Central Route", "Medium", 1600, 3),
                        generateRoute("Southern Route", "High", 1500, 3)
                    ];

                    // Sort routes by a weighted score
                    const scoreRoute = (route) => {
                        const riskScore = route.risk === "Low" ? 100 : route.risk === "Medium" ? 70 : 40;
                        return (riskScore + route.fuelEfficiency + route.weatherScore) / 3;
                    };

                    routes.sort((a, b) => scoreRoute(b) - scoreRoute(a));
                    
                    setCurrentRoute(routes[0]);
                    setAlternatives(routes.slice(1));
                }
                setOptimization(progress);
            }, 200);
        };

        simulateOptimization();
        const interval = setInterval(simulateOptimization, 12000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="agent-panel" style={{ height: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <h5 className="panel-title" style={{ marginBottom: '5px', fontSize: '1em', padding: '8px' }}>
                Route Optimization Agent
            </h5>
            <div className="panel-content" style={{ 
                height: 'calc(100% - 35px)',
                padding: '5px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {/* Progress Bar */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                    padding: '8px',
                    position: 'relative'
                }}>
                    <div style={{ 
                        fontSize: '0.9em',
                        marginBottom: '5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Optimization Progress</span>
                        <span style={{ 
                            color: optimization === 100 ? '#4CAF50' : '#FFC107',
                            fontWeight: 'bold'
                        }}>
                            {Math.round(optimization)}%
                        </span>
                    </div>
                    <div style={{ 
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${optimization}%`,
                            background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                            transition: 'width 0.3s ease-out',
                            boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)'
                        }}/>
                    </div>
                </div>

                {/* Metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        padding: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            fontSize: '1.2em', 
                            fontWeight: 'bold', 
                            color: '#4CAF50',
                            textShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                        }}>
                            {fuelSaved}%
                        </div>
                        <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Fuel Savings</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        padding: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            fontSize: '1.2em', 
                            fontWeight: 'bold', 
                            color: '#8BC34A',
                            textShadow: '0 0 10px rgba(139, 195, 74, 0.3)'
                        }}>
                            {timeReduction}%
                        </div>
                        <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Time Reduction</div>
                    </div>
                </div>

                {/* Recommended Route */}
                {currentRoute && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        padding: '8px'
                    }}>
                        <div style={{ 
                            fontSize: '0.9em', 
                            opacity: 0.7, 
                            marginBottom: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Recommended Route</span>
                            <span style={{ 
                                fontSize: '0.8em',
                                color: '#4CAF50',
                                background: 'rgba(76, 175, 80, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                            }}>
                                Best Match
                            </span>
                        </div>
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                            fontSize: '0.9em'
                        }}>
                            <div>
                                <div style={{ opacity: 0.7 }}>Name</div>
                                <div>{currentRoute.name}</div>
                            </div>
                            <div>
                                <div style={{ opacity: 0.7 }}>Risk</div>
                                <div style={{ 
                                    color: currentRoute.risk === 'Low' ? '#4CAF50' : 
                                           currentRoute.risk === 'Medium' ? '#FFC107' : '#FF5722'
                                }}>
                                    {currentRoute.risk}
                                </div>
                            </div>
                            <div>
                                <div style={{ opacity: 0.7 }}>Distance</div>
                                <div>{currentRoute.distance} nm</div>
                            </div>
                            <div>
                                <div style={{ opacity: 0.7 }}>Time</div>
                                <div>{currentRoute.time}</div>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            marginTop: '8px',
                            fontSize: '0.85em'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{ opacity: 0.7 }}>Efficiency:</span>
                                <div style={{
                                    flex: 1,
                                    height: '4px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${currentRoute.fuelEfficiency}%`,
                                        height: '100%',
                                        background: '#4CAF50',
                                        transition: 'width 0.3s ease-out'
                                    }}/>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{ opacity: 0.7 }}>Weather:</span>
                                <div style={{
                                    flex: 1,
                                    height: '4px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${currentRoute.weatherScore}%`,
                                        height: '100%',
                                        background: '#2196F3',
                                        transition: 'width 0.3s ease-out'
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alternative Routes */}
                {alternatives.length > 0 && !isOptimizing && (
                    <div style={{
                        fontSize: '0.85em',
                        opacity: 0.7,
                        display: 'flex',
                        gap: '8px'
                    }}>
                        {alternatives.map((route, index) => (
                            <div key={index} style={{
                                flex: 1,
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.9em'
                            }}>
                                <div style={{ opacity: 0.8 }}>{route.name}</div>
                                <div style={{ 
                                    fontSize: '0.8em',
                                    color: route.risk === 'Low' ? '#4CAF50' : 
                                           route.risk === 'Medium' ? '#FFC107' : '#FF5722'
                                }}>
                                    {route.risk} Risk
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Status Message */}
                <div style={{
                    fontSize: '0.85em',
                    opacity: 0.7,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: isOptimizing ? '#FFC107' : '#4CAF50'
                }}>
                    {isOptimizing ? 
                        optimizationPhase :
                        "Route optimization complete. Monitoring for changes..."}
                </div>
            </div>
        </div>
    );
};

export default PathPlanningPanel;