import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WeatherApiResponse } from '../types/weatherapi-response.interface';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.WEATHER_API_KEY;
  private readonly baseUrl = 'http://api.weatherapi.com/v1';

  async getWeatherByCoordinates(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/current.json`;
      const response = await axios.get<WeatherApiResponse>(url, {
        params: {
          key: this.apiKey,
          q: `${lat},${lon}`,
          aqi: 'no',
        },
      });

      const { location, current } = response.data;

      return {
        location: {
          name: location.name,
          region: location.region,
          country: location.country,
        },
        temperature_c: current.temp_c,
        condition: current.condition.text,
        icon: current.condition.icon,
        wind_kph: current.wind_kph,
        humidity: current.humidity,
        is_day: current.is_day === 1,
        raw: current,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching weather data');
    }
  }
}
