import requests
import datetime
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

# OpenWeatherMap API Key (replace with your actual API key)
load_dotenv()

KEY = os.getenv("WEATHER_KEY")
app = FastAPI()

def get_weather_forecast(lat, lon):
    forecast_list = []
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={KEY}"
    print(url)
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        i = 0
        for forecast in data['list']:
            if i % 4 == 0:
                time = forecast['dt_txt']
                weather = forecast['weather'][0]['description']
                temp = forecast['main']['temp']
                humidity = forecast['main']['humidity']
                wind_speed = forecast['wind']['speed']
                visibility = forecast.get('visibility', 10000)

                forecast_data = {
                    "latitude": lat,
                    "longitude": lon,
                    "datetime": time,
                    "description": weather,
                    "temperature": temp,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "visibility": visibility
                }
                forecast_list.append(forecast_data)
            i += 1
    else:
        print(f"Failed to get forecast for ({lat}, {lon}). HTTP Status code: {response.status_code}")
    return forecast_list

@app.get("/api/weather")
async def get_weather(lat: float, lon: float):
    try:
        forecasts = get_weather_forecast(lat, lon)
        # print(forecasts[0:limit])
        return forecasts[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

