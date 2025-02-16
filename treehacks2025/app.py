from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd
import numpy as np
from geopy.distance import geodesic
from datetime import datetime, timedelta
import random

app = FastAPI(title="Maritime Route Simulator",
             description="API for simulating and predicting maritime routes")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class Point(BaseModel):
    lat: float
    lon: float

class RouteRequest(BaseModel):
    start: Point
    end: Point
    season: Optional[str] = "summer"

class SpeedPredictionRequest(BaseModel):
    location: Point
    time: datetime

class Route(BaseModel):
    route: List[List[float]]
    eta: str
    distance: float

class TrafficData(BaseModel):
    traffic_density: List[List[float]]

class SpeedPrediction(BaseModel):
    predicted_speed: float

# Load models and data here
# TODO: Import your trained models from notebooks

@app.post("/route", response_model=Route)
async def predict_route(request: RouteRequest):
    """Predict optimal maritime route"""
    try:
        start_point = [request.start.lat, request.start.lon]
        end_point = [request.end.lat, request.end.lon]
        
        # TODO: Implement route prediction using models from notebooks
        # For now, return a dummy route
        route = [
            start_point,
            [start_point[0] + (end_point[0] - start_point[0])/3, 
             start_point[1] + (end_point[1] - start_point[1])/3],
            [start_point[0] + 2*(end_point[0] - start_point[0])/3, 
             start_point[1] + 2*(end_point[1] - start_point[1])/3],
            end_point
        ]
        
        return Route(
            route=route,
            eta="48 hours",  # TODO: Implement ETA prediction
            distance=geodesic(start_point, end_point).nautical
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/traffic", response_model=TrafficData)
async def get_traffic_data():
    """Get current maritime traffic data"""
    try:
        # TODO: Implement traffic visualization using data from notebooks
        return TrafficData(traffic_density=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speed", response_model=SpeedPrediction)
async def get_speed_prediction(request: SpeedPredictionRequest):
    """Get speed prediction for a location"""
    try:
        location = [request.location.lat, request.location.lon]
        
        # TODO: Implement speed prediction using models from notebooks
        return SpeedPrediction(predicted_speed=15.5)  # knots
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ship-routes")
async def get_ship_routes():
    """Get current ship routes and port locations in the Suez Canal area"""
    try:
        # Define major ports
        ports = {
            "Port Said": {"lat": 31.2667, "lon": 32.3000},
            "Suez": {"lat": 29.9667, "lon": 32.5500},
            "Alexandria": {"lat": 31.2000, "lon": 29.9167},
            "Piraeus": {"lat": 37.9475, "lon": 23.6378},  # Greece
            "Istanbul": {"lat": 41.0082, "lon": 28.9784},  # Turkey
            "Jeddah": {"lat": 21.5433, "lon": 39.1728},  # Saudi Arabia
            "Dubai": {"lat": 25.2048, "lon": 55.2708},  # UAE
            "Mumbai": {"lat": 18.9750, "lon": 72.8258},  # India
            "Karachi": {"lat": 24.8607, "lon": 67.0011},  # Pakistan
            "Salalah": {"lat": 17.0151, "lon": 54.0924},  # Oman
            "Djibouti": {"lat": 11.8251, "lon": 42.5903},  # Djibouti
            "Aden": {"lat": 12.7797, "lon": 44.9647},  # Yemen
            "Haifa": {"lat": 32.8192, "lon": 34.9983},  # Israel
            "Beirut": {"lat": 33.9002, "lon": 35.5332},  # Lebanon
            "Limassol": {"lat": 34.6823, "lon": 33.0464},  # Cyprus
            "Valletta": {"lat": 35.8989, "lon": 14.5146},  # Malta
            "Algiers": {"lat": 36.7538, "lon": 3.0588},  # Algeria
            "Tunis": {"lat": 36.8065, "lon": 10.1815},  # Tunisia
        }

        # Define base routes with variations
        base_routes = {
            "suez_asia": [
                ports["Port Said"],
                ports["Suez"],
                ports["Jeddah"],
                ports["Aden"],
                ports["Salalah"],
                ports["Dubai"],
                ports["Karachi"],
                ports["Mumbai"],
            ],
            "suez_europe": [
                ports["Port Said"],
                ports["Alexandria"],
                ports["Limassol"],
                ports["Piraeus"],
                ports["Valletta"],
                ports["Tunis"],
                ports["Algiers"],
            ],
            "mediterranean_loop": [
                ports["Alexandria"],
                ports["Haifa"],
                ports["Beirut"],
                ports["Limassol"],
                ports["Istanbul"],
                ports["Piraeus"],
                ports["Valletta"],
                ports["Tunis"],
                ports["Alexandria"],
            ],
            "red_sea_loop": [
                ports["Suez"],
                ports["Jeddah"],
                ports["Aden"],
                ports["Djibouti"],
                ports["Suez"],
            ],
            "arabian_sea_loop": [
                ports["Aden"],
                ports["Salalah"],
                ports["Dubai"],
                ports["Karachi"],
                ports["Mumbai"],
                ports["Salalah"],
                ports["Aden"],
            ],
            "coastal_east": [
                ports["Suez"],
                ports["Jeddah"],
                ports["Aden"],
                ports["Salalah"],
            ],
            "coastal_west": [
                ports["Alexandria"],
                ports["Port Said"],
                ports["Suez"],
                ports["Jeddah"],
            ]
        }

        # Convert port coordinates to route arrays
        for route_name, port_list in base_routes.items():
            base_routes[route_name] = [(p["lat"], p["lon"]) for p in port_list]

        # Add intermediate points between ports for more natural routes
        def add_intermediate_points(route, num_points=2):
            new_route = []
            for i in range(len(route) - 1):
                start = route[i]
                end = route[i + 1]
                new_route.append(start)
                
                # Add intermediate points
                for j in range(num_points):
                    frac = (j + 1) / (num_points + 1)
                    lat = start[0] + (end[0] - start[0]) * frac
                    lon = start[1] + (end[1] - start[1]) * frac
                    new_route.append((lat, lon))
                
            new_route.append(route[-1])
            return new_route

        # Add route variations
        def add_route_variation(base_route, variation_scale=0.2):
            return [(lat + random.uniform(-variation_scale, variation_scale),
                    lon + random.uniform(-variation_scale, variation_scale))
                   for lat, lon in base_route]

        # Generate sample ship routes
        routes_data = []
        ships = [
            {"mmsi": "215211000", "name": "EVER GIVEN", "type": "container"},
            {"mmsi": "219421000", "name": "COSCO SHIPPING LEO", "type": "container"},
            {"mmsi": "235789000", "name": "MSC ISABELLA", "type": "container"},
            {"mmsi": "249398000", "name": "CMA CGM MARCO POLO", "type": "container"},
            {"mmsi": "357346000", "name": "OOCL HONG KONG", "type": "container"},
            {"mmsi": "477328500", "name": "HMM ALGECIRAS", "type": "container"},
            {"mmsi": "563894000", "name": "MAERSK MC-KINNEY", "type": "container"},
            {"mmsi": "636019825", "name": "MSC GULSUN", "type": "container"},
            {"mmsi": "732819000", "name": "HAPAG-LLOYD ROME", "type": "container"},
            {"mmsi": "983672000", "name": "ONE APUS", "type": "container"},
            {"mmsi": "123456789", "name": "COASTAL VOYAGER", "type": "coastal"},
            {"mmsi": "987654321", "name": "RED SEA EXPLORER", "type": "coastal"},
            {"mmsi": "456789123", "name": "GULF TRADER", "type": "coastal"},
            {"mmsi": "789123456", "name": "SUEZ SHUTTLE", "type": "coastal"}
        ]

        current_time = datetime.now()

        # Generate routes for each ship
        for ship in ships:
            # Choose route type based on ship type
            if ship["type"] == "coastal":
                route_type = random.choice(["coastal_east", "coastal_west", "red_sea_loop"])
                speed_range = (8.0, 12.0)  # Coastal ships are generally slower
                variation_scale = 0.1  # Less variation for coastal routes
            else:
                route_type = random.choice(["suez_asia", "suez_europe", "mediterranean_loop", "arabian_sea_loop"])
                speed_range = (12.0, 18.0)  # Container ships are faster
                variation_scale = 0.2  # More variation for ocean routes

            base_route = base_routes[route_type]
            # Add intermediate points for smoother routes
            base_route = add_intermediate_points(base_route, num_points=3)
            # Add variations to make each ship's route unique
            route = add_route_variation(base_route, variation_scale)
            voyage_id = random.randint(900, 999)
            
            # Generate speed profile
            base_speed = random.uniform(*speed_range)
            
            # Create route points with speed variations
            for i, (lat, lon) in enumerate(route):
                # Add speed variations
                if i == 0 or i == len(route) - 1:
                    # Slower at ports
                    speed = base_speed * 0.5
                elif "Suez Canal" in route_type or (29.5 <= lat <= 31.5 and 32.2 <= lon <= 32.6):
                    # Slower in the canal
                    speed = base_speed * 0.7
                else:
                    # Random variations in open water
                    speed = base_speed * random.uniform(0.8, 1.2)
                
                # Calculate time offset (distance-based)
                if i > 0:
                    prev_lat, prev_lon = route[i-1]
                    distance = ((lat - prev_lat)**2 + (lon - prev_lon)**2)**0.5
                    time_hours = distance * 60 / speed  # Rough approximation
                    time_offset = timedelta(hours=time_hours)
                else:
                    time_offset = timedelta(hours=0)
                
                routes_data.append({
                    "lat": lat,
                    "lon": lon,
                    "node": 1000 + i,
                    "speed": speed,
                    "mmsi": ship["mmsi"],
                    "voyage": voyage_id,
                    "start_time": (current_time + time_offset).strftime("%Y-%m-%d %H:%M:%S"),
                    "number": i + 1
                })

        # Convert to DataFrame
        df = pd.DataFrame(routes_data)

        return {
            "ports": ports,
            "routes": df.to_dict(orient="records"),
            "ships": {ship["mmsi"]: ship["name"] for ship in ships}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
