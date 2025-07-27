# Módulo Geo - API Documentation

Este módulo proporciona endpoints para consultar información geográfica desde la base de datos SQLite `world_geo.db`.

## Endpoints Disponibles

### 1. Obtener todos los países
```
GET /geo/countries
```
**Respuesta:** Lista de todos los países ordenados alfabéticamente.

### 2. Obtener ciudades por país (usando query parameter)
```
GET /geo/cities?country=US
```
**Parámetros:**
- `country` (string): Código del país (ISO2, ej: US, CL, AR)

**Respuesta:** Lista de ciudades del país ordenadas por población.

### 3. Obtener ciudades por país (RESTful)
```
GET /geo/countries/US/cities
```
**Parámetros:**
- `countryCode` (string): Código del país en la URL

**Respuesta:** Lista de ciudades del país ordenadas por población.

### 4. Obtener información de un país específico
```
GET /geo/countries/US
```
**Parámetros:**
- `countryCode` (string): Código del país

**Respuesta:** Información detallada del país.

### 5. Buscar ciudades por nombre
```
GET /geo/search/cities?name=Santiago&limit=10
```
**Parámetros:**
- `name` (string): Nombre de la ciudad (búsqueda parcial)
- `limit` (number, opcional): Límite de resultados (1-1000, default: 50)

**Respuesta:** Lista de ciudades que coinciden con el nombre.

## Ejemplos de Respuesta

### Países
```json
[
  {
    "country_code": "US",
    "country_name": "United States"
  },
  {
    "country_code": "CL",
    "country_name": "Chile"
  }
]
```

### Ciudades
```json
[
  {
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "population": 8175133,
    "country_code": "US"
  },
  {
    "city": "Los Angeles",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "population": 3971883,
    "country_code": "US"
  }
]
```

## Códigos de Error

- `400 Bad Request`: Parámetros inválidos o faltantes
- `404 Not Found`: País o recurso no encontrado
- `500 Internal Server Error`: Error de base de datos

## Uso con cURL

```bash
# Obtener todos los países
curl http://localhost:3000/geo/countries

# Obtener ciudades de Chile
curl http://localhost:3000/geo/cities?country=CL

# Obtener ciudades de Estados Unidos (RESTful)
curl http://localhost:3000/geo/countries/US/cities

# Buscar ciudades llamadas Santiago
curl "http://localhost:3000/geo/search/cities?name=Santiago&limit=5"

# Obtener información de Chile
curl http://localhost:3000/geo/countries/CL
```
