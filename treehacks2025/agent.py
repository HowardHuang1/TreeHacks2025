import os
import openai
import requests
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

load_dotenv()


def analyze_port_operation(api_data):
    weather = api_data.get("weather")
    news = api_data.get("news")

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
    Consider conditions like high winds (>35 knots), storms, or strikes.
    Return one of the following: "Operational", "High Risk", or "Closed" along with a rationale.
    """
    
    # Make the LangChain API call
    response = llm.predict(query)
    decision = response.strip()
    return decision



# Example API Response
api_response = {
    "weather": {"wind_speed_knots": 40, "visibility": "poor", "temperature": 25},
    "news": ["Local port workers announce 48-hour strike starting tomorrow."]
}

decision = analyze_port_operation(api_response)
print(f"Port Status: {decision}")
