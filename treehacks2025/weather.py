import requests
import datetime
import os
from dotenv import load_dotenv
# OpenWeatherMap API Key (replace with your actual API key)
load_dotenv()

KEY = os.getenv("WEATHER_KEY")
# print(key)


def get_weather_forecast(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={KEY}"
    print(url)
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        for forecast in data['list']:
            time = forecast['dt_txt']
            weather = forecast['weather'][0]['description']
            temp = forecast['main']['temp']
            humidity = forecast['main']['humidity']
            wind_speed = forecast['wind']['speed']
            print(f"Forecast for ({lat}, {lon}) at {time}:")
            print(f"- Description: {weather}")
            print(f"- Temperature: {temp}°C")
            print(f"- Humidity: {humidity}%")
            print(f"- Wind Speed: {wind_speed} m/s")
            print("="*40)
    else:
        print(f"Failed to get forecast for ({lat}, {lon}). HTTP Status code: {response.status_code}")

def main():
    coordinates = [
        (37.7749, -122.4194),  # San Francisco, CA
        (40.7128, -74.0060),   # New York, NY
        (51.5074, -0.1278)     # London, UK
    ]

    for lat, lon in coordinates:
        get_weather_forecast(lat, lon)

if __name__ == "__main__":
    main()