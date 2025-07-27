export interface Country {
  country_code: string;
  country_name: string;
  [key: string]: any;
}

export interface City {
  city: string;
  latitude: number;
  longitude: number;
  population: number;
  country_code: string;
}
