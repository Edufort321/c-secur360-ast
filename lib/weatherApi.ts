import type { WeatherData } from '../hooks/useWeatherData';
import env from '@/lib/env';

const API_BASE = 'https://api.openweathermap.org/data/3.0/onecall';
const DEFAULT_TIMEOUT = 5000;

const degToCompass = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
};

export async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const apiKey = env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY is not defined');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const url = `${API_BASE}?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    clearTimeout(timeout);

    const temp = data.current.temp;
    const windSpeed = data.current.wind_speed;

    const weather: WeatherData = {
      temperature: temp,
      humidity: data.current.humidity,
      windSpeed,
      windDirection: degToCompass(data.current.wind_deg),
      precipitation: data.current.rain?.['1h'] ?? 0,
      visibility: data.current.visibility ?? 0,
      uvIndex: data.current.uvi ?? 0,
      conditions: data.current.weather?.[0]?.description ?? 'Unknown',
      warnings: [],
      impact:
        temp < -20 || temp > 35 || windSpeed > 50
          ? 'high'
          : temp < -10 || temp > 30 || windSpeed > 30
          ? 'medium'
          : 'low',
      pressure: data.current.pressure,
      feelsLike: data.current.feels_like,
      dewPoint: data.current.dew_point ?? temp,
      cloudCover: data.current.clouds ?? 0,
    };

    return weather;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Weather API request timed out');
    }
    throw error;
  }
}

export default { getWeatherData };
