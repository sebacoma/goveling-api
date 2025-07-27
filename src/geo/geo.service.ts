import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from 'sqlite3';
import * as path from 'path';
import { Country, City } from './geo.interfaces';

@Injectable()
export class GeoService {
  private readonly dbPath: string;

  constructor() {
    // La base de datos está en src/Data/CountriesCities/world_geo.db
    this.dbPath = path.join(process.cwd(), 'src', 'Data', 'CountriesCities', 'world_geo.db');
  }

  private async queryDatabase<T = any>(query: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const db = new Database(this.dbPath, err => {
        if (err) {
          reject(new Error(`Database connection failed: ${err.message}`));
          return;
        }
      });

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(new Error(`Query failed: ${err.message}`));
        } else {
          resolve(rows as T[]);
        }
      });

      db.close();
    });
  }

  async getAllCountries(): Promise<Country[]> {
    const query = 'SELECT * FROM countries ORDER BY country_name ASC';
    return this.queryDatabase<Country>(query);
  }

  async getCitiesByCountry(countryCode: string): Promise<City[]> {
    // Verificar que el país existe
    const countryQuery = 'SELECT * FROM countries WHERE country_code = ?';
    const countries = await this.queryDatabase<Country>(countryQuery, [countryCode]);

    if (countries.length === 0) {
      throw new NotFoundException(`Country with code '${countryCode}' not found`);
    }

    // Obtener ciudades del país
    const citiesQuery = `
      SELECT 
        name as city, 
        latitude, 
        longitude, 
        population,
        country_code
      FROM cities 
      WHERE country_code = ? 
      ORDER BY population DESC
    `;

    return this.queryDatabase<City>(citiesQuery, [countryCode]);
  }

  async getCountryByCode(countryCode: string): Promise<Country | null> {
    const query = 'SELECT * FROM countries WHERE country_code = ?';
    const countries = await this.queryDatabase<Country>(query, [countryCode]);
    return countries.length > 0 ? countries[0] : null;
  }

  // Método adicional: buscar ciudades por nombre
  async searchCities(cityName: string, limit: number = 50): Promise<City[]> {
    const query = `
      SELECT 
        name as city, 
        latitude, 
        longitude, 
        population,
        country_code
      FROM cities 
      WHERE name LIKE ? 
      ORDER BY population DESC 
      LIMIT ?
    `;

    return this.queryDatabase<City>(query, [`%${cityName}%`, limit]);
  }
}
