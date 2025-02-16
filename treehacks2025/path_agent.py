from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class PortCoordinates(BaseModel):
    lat: float
    lon: float

class PortsRequest(BaseModel):
    selectedPorts: List[PortCoordinates]

@app.post("/api/ports")
async def receive_ports(request: PortsRequest):
    try:
        # Extract the list of selected ports
        selected_ports = request.selectedPorts
        for port in selected_ports:
            print(f"Received port - Latitude: {port.lat}, Longitude: {port.lon}")
        
        # Placeholder for further processing
        return {"message": "Ports received successfully", "ports": selected_ports}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
