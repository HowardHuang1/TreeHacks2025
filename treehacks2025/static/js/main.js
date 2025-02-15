// Initialize the map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store current route layer
let currentRoute = null;
let currentMarkers = [];

// Initialize the form
const routeForm = document.getElementById('routeForm');
routeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const startLat = parseFloat(document.getElementById('startLat').value);
    const startLon = parseFloat(document.getElementById('startLon').value);
    const endLat = parseFloat(document.getElementById('endLat').value);
    const endLon = parseFloat(document.getElementById('endLon').value);
    const season = document.getElementById('season').value;

    try {
        // Clear previous route and markers
        if (currentRoute) {
            map.removeLayer(currentRoute);
        }
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];

        // Add markers for start and end points
        const startMarker = L.marker([startLat, startLon]).addTo(map);
        const endMarker = L.marker([endLat, endLon]).addTo(map);
        currentMarkers.push(startMarker, endMarker);

        // Get route prediction
        const response = await fetch('/api/predict_route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start: { lat: startLat, lon: startLon },
                end: { lat: endLat, lon: endLon },
                season: season
            }),
        });

        const data = await response.json();
        
        // Draw the route
        currentRoute = L.polyline(data.route, {
            color: 'blue',
            weight: 3,
            opacity: 0.7
        }).addTo(map);

        // Fit map to show the entire route
        map.fitBounds(currentRoute.getBounds());

        // Update route information
        document.getElementById('distance').textContent = data.distance.toFixed(2);
        document.getElementById('eta').textContent = data.eta;

        // Get speed prediction for current position
        const speedResponse = await fetch('/api/speed_prediction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location: { lat: startLat, lon: startLon },
                time: new Date().toISOString()
            }),
        });

        const speedData = await speedResponse.json();
        document.getElementById('speed').textContent = speedData.predicted_speed.toFixed(1);

    } catch (error) {
        console.error('Error:', error);
        alert('Error calculating route. Please try again.');
    }
});

// Add click handlers to map for easy point selection
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    
    if (!document.getElementById('startLat').value || !document.getElementById('startLon').value) {
        document.getElementById('startLat').value = lat;
        document.getElementById('startLon').value = lng;
    } else if (!document.getElementById('endLat').value || !document.getElementById('endLon').value) {
        document.getElementById('endLat').value = lat;
        document.getElementById('endLon').value = lng;
    }
});
