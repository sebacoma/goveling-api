export interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country: string;
    country_code: string;
    [key: string]: any;
  };
}
