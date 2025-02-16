from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app import app as main_app
from news_agent import app as news_app
from weather import app as weather_app
from langchain_agent import app as langchain_app
from app import app as ship_routes_app  # Import the ship routes app
from path_agent import app as path_app

# Create a combined FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

main_app = FastAPI()

@main_app.get("/")
async def root():
    return {"message": "Hello World"}

# Move ship routes endpoints to main_app
for route in ship_routes_app.routes:
    main_app.routes.append(route)

# Mount apps
app.mount("/api", main_app)
app.mount("/news", news_app)
app.mount("/weather", weather_app)
app.mount("/langchain_agent", langchain_app)
app.mount("/ports", path_app)

if __name__ == "__main__":
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)