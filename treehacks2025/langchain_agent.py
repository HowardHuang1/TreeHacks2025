import os
import openai
import requests
import pandas as pd
from weather import get_weather_forecast
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from fastapi import FastAPI, HTTPException

load_dotenv()
app = FastAPI()

def traverse_routes(df):
    results = []
    for i in range(0, len(df), 100):
        lat = df.loc[i, 'lat']
        lon = df.loc[i, 'lon']
        result = analyze_port_operation(lat, lon)
        results.append((i, lat, lon, result))

        # Convert results to a DataFrame for better visualization
        results_df = pd.DataFrame(results, columns=['Row', 'Latitude', 'Longitude', 'Result'])
    return results_df


def analyze_port_operation(lat, lon):
    # weather = api_data.get("weather")
    # news = api_data.get("news")
    weather = get_weather_forecast(lat, lon)
    news = ""

    # Construct a query for the agent
    llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                      temperature=0,
                        max_tokens=30,
                        timeout=None,
                        max_retries=2)
    
    query = f"""
    Given the following data:
    - Weather: {weather}
    - News: {news}

    Analyze the impact on port operations. 
    Consider conditions like high winds (>35 knots), storms, poor visibilites, or strikes.
    Return a score of the risk level of this location between 0-1, where 0 is less risk and 1 is more risk.
    No additional sentences just one score.
    """
    
    # Make the LangChain API call
    response = llm.predict(query)
    print("here")
    decision = response.strip()
    return decision


# def test():
#     coordinates = [
#         (37.7749, -122.4194),  # San Francisco, CA
#         # (40.7128, -74.0060),   # New York, NY
#         # (51.5074, -0.1278)     # London, UK
#     ]

#     for lat, lon in coordinates:
#         # Example API Response
#         # api_response = {
#         #     "weather": {"wind_speed_knots": 40, "visibility": "poor", "temperature": 25},
#         #     "news": ["Local port workers announce 48-hour strike starting tomorrow."]
#         # }
#         decision = analyze_port_operation(lat, lon)
#         print(f"Port Status: {decision}")


@app.get("/api/langchain_agent")
async def get_risk_level(lat: float, lon: float):
    try:
        risk = analyze_port_operation(lat, lon)
        # print(forecasts[0:limit])
        return risk
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

