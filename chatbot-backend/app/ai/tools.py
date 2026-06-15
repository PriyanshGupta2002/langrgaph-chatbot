from langchain_core.tools import tool
import requests
from app.core.config import settings


@tool
def weather_tool(city: str):
    """
    This function fetches the current weather data for a given city
    """

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.WEATHER_API_KEY}"
    response = requests.get(url)

    return response.json()


tools_list = [weather_tool]
