import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { Country, City } from './geo.interfaces';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get(':type')
  async getGeoData(
    @Param('type') type: string,
    @Query('country') countryCode?: string
  ): Promise<Country[] | City[]> {
    const normalizedType = type.toLowerCase();

    if (normalizedType === 'countries') {
      return this.geoService.getAllCountries();
    }

    if (normalizedType === 'cities') {
      if (!countryCode) {
        throw new BadRequestException('Country code is required for cities endpoint');
      }
      return this.geoService.getCitiesByCountry(countryCode.toUpperCase());
    }

    throw new BadRequestException('Invalid type. Use "countries" or "cities"');
  }

  // Endpoint alternativo más RESTful
  @Get('countries/:countryCode/cities')
  async getCitiesByCountryCode(@Param('countryCode') countryCode: string): Promise<City[]> {
    return this.geoService.getCitiesByCountry(countryCode.toUpperCase());
  }

  // Endpoint para buscar ciudades por nombre
  @Get('search/cities')
  async searchCities(
    @Query('name') cityName: string,
    @Query('limit') limit?: string
  ): Promise<City[]> {
    if (!cityName) {
      throw new BadRequestException('City name is required');
    }

    const limitNumber = limit ? parseInt(limit, 10) : 50;
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 1000) {
      throw new BadRequestException('Limit must be a number between 1 and 1000');
    }

    return this.geoService.searchCities(cityName, limitNumber);
  }

  // Endpoint para obtener información de un país específico
  @Get('countries/:countryCode')
  async getCountryByCode(@Param('countryCode') countryCode: string): Promise<Country> {
    const country = await this.geoService.getCountryByCode(countryCode.toUpperCase());
    if (!country) {
      throw new NotFoundException(`Country with code '${countryCode}' not found`);
    }
    return country;
  }
}
