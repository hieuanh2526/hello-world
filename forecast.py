"""Print a 7-day weather forecast using the Open-Meteo API (no API key needed)."""
import sys

import requests

URL = "https://api.open-meteo.com/v1/forecast"


def main(lat: float = 10.77, lon: float = 106.70) -> None:
    r = requests.get(
        URL,
        params={
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
        },
        timeout=15,
    )
    r.raise_for_status()
    d = r.json()["daily"]
    for day, hi, lo, rain in zip(
        d["time"], d["temperature_2m_max"], d["temperature_2m_min"], d["precipitation_sum"]
    ):
        print(f"{day}: {lo:.0f}-{hi:.0f}°C, rain {rain} mm")


if __name__ == "__main__":
    args = [float(a) for a in sys.argv[1:3]]
    main(*args)
