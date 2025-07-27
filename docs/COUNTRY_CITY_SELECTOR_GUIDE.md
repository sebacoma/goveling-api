# 🌍 Documentación: Implementación de Selectores País-Ciudad

Esta documentación te guía paso a paso para implementar selectores de país y ciudad usando las APIs del módulo Geo.

## 📋 **Resumen de Funcionalidad**

1. **Selector de País**: Carga todos los países disponibles
2. **Selector de Ciudad**: Se popula automáticamente basado en el país seleccionado
3. **Búsqueda de Ciudad**: Permite buscar ciudades por nombre (opcional)

---

## 🔗 **APIs Necesarias**

### 1. **Obtener Países**
```http
GET /geo/countries
```

### 2. **Obtener Ciudades por País**
```http
GET /geo/countries/{countryCode}/cities
```

### 3. **Buscar Ciudades (Opcional)**
```http
GET /geo/search/cities?name={cityName}&limit={limit}
```

---

## 🎯 **Flujo de Implementación**

### **Paso 1: Cargar Países al Inicializar**
```javascript
// Al cargar la página/componente
async function loadCountries() {
  try {
    const response = await fetch('http://localhost:3000/geo/countries');
    const countries = await response.json();
    
    // Poblar el selector de países
    populateCountrySelector(countries);
  } catch (error) {
    console.error('Error loading countries:', error);
  }
}
```

### **Paso 2: Manejar Selección de País**
```javascript
// Cuando el usuario selecciona un país
async function onCountryChange(countryCode) {
  if (!countryCode) {
    clearCitySelector();
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/geo/countries/${countryCode}/cities`);
    const cities = await response.json();
    
    // Poblar el selector de ciudades
    populateCitySelector(cities);
  } catch (error) {
    console.error('Error loading cities:', error);
    clearCitySelector();
  }
}
```

---

## 💻 **Implementaciones por Framework**

## 🟦 **Vanilla JavaScript + HTML**

### **HTML**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Selector País-Ciudad</title>
    <style>
        .selector-container {
            margin: 20px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            min-width: 200px;
        }
        
        label {
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        select:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="selector-container">
        <div class="form-group">
            <label for="countrySelect">País:</label>
            <select id="countrySelect">
                <option value="">Selecciona un país...</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="citySelect">Ciudad:</label>
            <select id="citySelect" disabled>
                <option value="">Primero selecciona un país</option>
            </select>
        </div>
    </div>
    
    <div id="selectedValues"></div>

    <script src="country-city-selector.js"></script>
</body>
</html>
```

### **JavaScript (country-city-selector.js)**
```javascript
class CountryCitySelector {
    constructor() {
        this.baseUrl = 'http://localhost:3000/geo';
        this.countrySelect = document.getElementById('countrySelect');
        this.citySelect = document.getElementById('citySelect');
        this.selectedValues = document.getElementById('selectedValues');
        
        this.init();
    }
    
    async init() {
        await this.loadCountries();
        this.setupEventListeners();
    }
    
    async loadCountries() {
        try {
            this.setLoading(this.countrySelect, true);
            
            const response = await fetch(`${this.baseUrl}/countries`);
            if (!response.ok) throw new Error('Failed to load countries');
            
            const countries = await response.json();
            this.populateCountrySelector(countries);
        } catch (error) {
            console.error('Error loading countries:', error);
            this.showError('Error al cargar países');
        } finally {
            this.setLoading(this.countrySelect, false);
        }
    }
    
    async loadCities(countryCode) {
        try {
            this.setLoading(this.citySelect, true);
            this.clearCitySelector();
            
            const response = await fetch(`${this.baseUrl}/countries/${countryCode}/cities`);
            if (!response.ok) throw new Error('Failed to load cities');
            
            const cities = await response.json();
            this.populateCitySelector(cities);
        } catch (error) {
            console.error('Error loading cities:', error);
            this.showError('Error al cargar ciudades');
        } finally {
            this.setLoading(this.citySelect, false);
        }
    }
    
    populateCountrySelector(countries) {
        this.countrySelect.innerHTML = '<option value="">Selecciona un país...</option>';
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.country_code;
            option.textContent = country.country_name;
            this.countrySelect.appendChild(option);
        });
    }
    
    populateCitySelector(cities) {
        this.citySelect.innerHTML = '<option value="">Selecciona una ciudad...</option>';
        this.citySelect.disabled = false;
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                name: city.city,
                latitude: city.latitude,
                longitude: city.longitude,
                population: city.population
            });
            option.textContent = `${city.city} (${city.population.toLocaleString()} hab.)`;
            this.citySelect.appendChild(option);
        });
    }
    
    clearCitySelector() {
        this.citySelect.innerHTML = '<option value="">Primero selecciona un país</option>';
        this.citySelect.disabled = true;
    }
    
    setupEventListeners() {
        this.countrySelect.addEventListener('change', (e) => {
            const countryCode = e.target.value;
            if (countryCode) {
                this.loadCities(countryCode);
            } else {
                this.clearCitySelector();
            }
            this.updateSelectedValues();
        });
        
        this.citySelect.addEventListener('change', () => {
            this.updateSelectedValues();
        });
    }
    
    updateSelectedValues() {
        const countryText = this.countrySelect.options[this.countrySelect.selectedIndex]?.text || '';
        const cityValue = this.citySelect.value;
        const cityData = cityValue ? JSON.parse(cityValue) : null;
        
        let html = '<h3>Valores Seleccionados:</h3>';
        html += `<p><strong>País:</strong> ${countryText}</p>`;
        
        if (cityData) {
            html += `<p><strong>Ciudad:</strong> ${cityData.name}</p>`;
            html += `<p><strong>Población:</strong> ${cityData.population.toLocaleString()}</p>`;
            html += `<p><strong>Coordenadas:</strong> ${cityData.latitude}, ${cityData.longitude}</p>`;
        }
        
        this.selectedValues.innerHTML = html;
    }
    
    setLoading(element, loading) {
        if (loading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }
    
    showError(message) {
        alert(message); // En producción, usar un sistema de notificaciones mejor
    }
    
    // Métodos públicos para obtener valores
    getSelectedCountry() {
        return {
            code: this.countrySelect.value,
            name: this.countrySelect.options[this.countrySelect.selectedIndex]?.text || ''
        };
    }
    
    getSelectedCity() {
        const cityValue = this.citySelect.value;
        return cityValue ? JSON.parse(cityValue) : null;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.selector = new CountryCitySelector();
});
```

---

## ⚛️ **React Implementation**

### **Componente CountryCitySelector.jsx**
```jsx
import React, { useState, useEffect } from 'react';

const CountryCitySelector = ({ onSelectionChange }) => {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState({ countries: false, cities: false });
    const [error, setError] = useState(null);
    
    const baseUrl = 'http://localhost:3000/geo';
    
    // Cargar países al montar el componente
    useEffect(() => {
        loadCountries();
    }, []);
    
    // Notificar cambios al padre
    useEffect(() => {
        if (onSelectionChange) {
            const countryData = countries.find(c => c.country_code === selectedCountry);
            const cityData = selectedCity ? JSON.parse(selectedCity) : null;
            
            onSelectionChange({
                country: countryData,
                city: cityData
            });
        }
    }, [selectedCountry, selectedCity, countries, onSelectionChange]);
    
    const loadCountries = async () => {
        try {
            setLoading(prev => ({ ...prev, countries: true }));
            setError(null);
            
            const response = await fetch(`${baseUrl}/countries`);
            if (!response.ok) throw new Error('Failed to load countries');
            
            const data = await response.json();
            setCountries(data);
        } catch (err) {
            setError('Error al cargar países');
            console.error('Error loading countries:', err);
        } finally {
            setLoading(prev => ({ ...prev, countries: false }));
        }
    };
    
    const loadCities = async (countryCode) => {
        try {
            setLoading(prev => ({ ...prev, cities: true }));
            setError(null);
            setCities([]);
            setSelectedCity('');
            
            const response = await fetch(`${baseUrl}/countries/${countryCode}/cities`);
            if (!response.ok) throw new Error('Failed to load cities');
            
            const data = await response.json();
            setCities(data);
        } catch (err) {
            setError('Error al cargar ciudades');
            console.error('Error loading cities:', err);
        } finally {
            setLoading(prev => ({ ...prev, cities: false }));
        }
    };
    
    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        setSelectedCountry(countryCode);
        
        if (countryCode) {
            loadCities(countryCode);
        } else {
            setCities([]);
            setSelectedCity('');
        }
    };
    
    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
    };
    
    return (
        <div className="country-city-selector">
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            
            <div className="selector-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label htmlFor="country-select">País:</label>
                    <select
                        id="country-select"
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        disabled={loading.countries}
                        style={{ padding: '8px', minWidth: '200px' }}
                    >
                        <option value="">
                            {loading.countries ? 'Cargando países...' : 'Selecciona un país...'}
                        </option>
                        {countries.map(country => (
                            <option key={country.country_code} value={country.country_code}>
                                {country.country_name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="city-select">Ciudad:</label>
                    <select
                        id="city-select"
                        value={selectedCity}
                        onChange={handleCityChange}
                        disabled={!selectedCountry || loading.cities}
                        style={{ padding: '8px', minWidth: '250px' }}
                    >
                        <option value="">
                            {!selectedCountry ? 'Primero selecciona un país' :
                             loading.cities ? 'Cargando ciudades...' :
                             'Selecciona una ciudad...'}
                        </option>
                        {cities.map((city, index) => (
                            <option 
                                key={index} 
                                value={JSON.stringify({
                                    name: city.city,
                                    latitude: city.latitude,
                                    longitude: city.longitude,
                                    population: city.population,
                                    country_code: city.country_code
                                })}
                            >
                                {city.city} ({city.population.toLocaleString()} hab.)
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CountryCitySelector;
```

### **Uso del Componente React**
```jsx
import React from 'react';
import CountryCitySelector from './CountryCitySelector';

const App = () => {
    const handleSelectionChange = (selection) => {
        console.log('País seleccionado:', selection.country);
        console.log('Ciudad seleccionada:', selection.city);
        
        // Aquí puedes hacer lo que necesites con los datos
        if (selection.city) {
            console.log(`Coordenadas: ${selection.city.latitude}, ${selection.city.longitude}`);
        }
    };
    
    return (
        <div>
            <h1>Selector de País y Ciudad</h1>
            <CountryCitySelector onSelectionChange={handleSelectionChange} />
        </div>
    );
};

export default App;
```

---

## 🟨 **Vue.js Implementation**

### **Componente CountryCitySelector.vue**
```vue
<template>
  <div class="country-city-selector">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="selector-row">
      <div class="form-group">
        <label for="country-select">País:</label>
        <select
          id="country-select"
          v-model="selectedCountry"
          :disabled="loading.countries"
          @change="onCountryChange"
        >
          <option value="">
            {{ loading.countries ? 'Cargando países...' : 'Selecciona un país...' }}
          </option>
          <option
            v-for="country in countries"
            :key="country.country_code"
            :value="country.country_code"
          >
            {{ country.country_name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="city-select">Ciudad:</label>
        <select
          id="city-select"
          v-model="selectedCity"
          :disabled="!selectedCountry || loading.cities"
          @change="onCityChange"
        >
          <option value="">
            <template v-if="!selectedCountry">Primero selecciona un país</template>
            <template v-else-if="loading.cities">Cargando ciudades...</template>
            <template v-else>Selecciona una ciudad...</template>
          </option>
          <option
            v-for="(city, index) in cities"
            :key="index"
            :value="JSON.stringify({
              name: city.city,
              latitude: city.latitude,
              longitude: city.longitude,
              population: city.population,
              country_code: city.country_code
            })"
          >
            {{ city.city }} ({{ city.population.toLocaleString() }} hab.)
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountryCitySelector',
  emits: ['selection-change'],
  
  data() {
    return {
      countries: [],
      cities: [],
      selectedCountry: '',
      selectedCity: '',
      loading: {
        countries: false,
        cities: false
      },
      error: null,
      baseUrl: 'http://localhost:3000/geo'
    };
  },
  
  async mounted() {
    await this.loadCountries();
  },
  
  watch: {
    selectedCountry() {
      this.emitChange();
    },
    selectedCity() {
      this.emitChange();
    }
  },
  
  methods: {
    async loadCountries() {
      try {
        this.loading.countries = true;
        this.error = null;
        
        const response = await fetch(`${this.baseUrl}/countries`);
        if (!response.ok) throw new Error('Failed to load countries');
        
        this.countries = await response.json();
      } catch (err) {
        this.error = 'Error al cargar países';
        console.error('Error loading countries:', err);
      } finally {
        this.loading.countries = false;
      }
    },
    
    async loadCities(countryCode) {
      try {
        this.loading.cities = true;
        this.error = null;
        this.cities = [];
        this.selectedCity = '';
        
        const response = await fetch(`${this.baseUrl}/countries/${countryCode}/cities`);
        if (!response.ok) throw new Error('Failed to load cities');
        
        this.cities = await response.json();
      } catch (err) {
        this.error = 'Error al cargar ciudades';
        console.error('Error loading cities:', err);
      } finally {
        this.loading.cities = false;
      }
    },
    
    onCountryChange() {
      if (this.selectedCountry) {
        this.loadCities(this.selectedCountry);
      } else {
        this.cities = [];
        this.selectedCity = '';
      }
    },
    
    onCityChange() {
      // La emisión se maneja en el watcher
    },
    
    emitChange() {
      const countryData = this.countries.find(c => c.country_code === this.selectedCountry);
      const cityData = this.selectedCity ? JSON.parse(this.selectedCity) : null;
      
      this.$emit('selection-change', {
        country: countryData,
        city: cityData
      });
    }
  }
};
</script>

<style scoped>
.country-city-selector {
  margin: 20px 0;
}

.selector-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #ffeaea;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
}
</style>
```

---

## 🔧 **Características Adicionales**

### **1. Búsqueda de Ciudades (Opcional)**
```javascript
// Agregar función de búsqueda
async function searchCities(searchTerm, limit = 50) {
    try {
        const response = await fetch(`http://localhost:3000/geo/search/cities?name=${encodeURIComponent(searchTerm)}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to search cities');
        
        return await response.json();
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
}
```

### **2. Validación de Datos**
```javascript
function validateSelection(country, city) {
    const errors = [];
    
    if (!country || !country.country_code) {
        errors.push('Debe seleccionar un país');
    }
    
    if (!city || !city.name) {
        errors.push('Debe seleccionar una ciudad');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```

### **3. Cache de Datos**
```javascript
class DataCache {
    constructor() {
        this.cache = new Map();
        this.expiry = 5 * 60 * 1000; // 5 minutos
    }
    
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
}
```

---

## 📱 **Consideraciones de UX**

### **Estados de Carga**
- ✅ Mostrar "Cargando..." mientras se obtienen los datos
- ✅ Deshabilitar selectores durante la carga
- ✅ Manejar errores de red gracefully

### **Accesibilidad**
- ✅ Labels apropiados para screen readers
- ✅ Estados de error claramente indicados
- ✅ Navegación por teclado funcional

### **Performance**
- ✅ Cache de países (rara vez cambian)
- ✅ Debounce en búsquedas
- ✅ Lazy loading de ciudades

---

## 🚀 **Casos de Uso Comunes**

### **1. Formulario de Registro**
```javascript
// Validar y enviar formulario
function submitForm() {
    const country = selector.getSelectedCountry();
    const city = selector.getSelectedCity();
    
    const validation = validateSelection(country, city);
    if (!validation.isValid) {
        showErrors(validation.errors);
        return;
    }
    
    const formData = {
        // otros campos del formulario...
        country_code: country.code,
        country_name: country.name,
        city_name: city.name,
        latitude: city.latitude,
        longitude: city.longitude
    };
    
    // Enviar datos...
}
```

### **2. Filtro de Búsqueda**
```javascript
// Aplicar filtros basados en ubicación
function applyLocationFilter() {
    const country = selector.getSelectedCountry();
    const city = selector.getSelectedCity();
    
    const filters = {};
    
    if (country.code) {
        filters.country = country.code;
    }
    
    if (city && city.name) {
        filters.city = city.name;
        filters.coordinates = {
            lat: city.latitude,
            lng: city.longitude
        };
    }
    
    // Aplicar filtros a la búsqueda...
    search(filters);
}
```

---

## ⚙️ **Configuración del Servidor**

### **Variables de Entorno**
```env
# En tu .env
GEO_API_BASE_URL=http://localhost:3000/geo
CACHE_DURATION=300000  # 5 minutos en millisegundos
```

### **CORS para Frontend**
Asegúrate de que tu servidor tenga CORS configurado correctamente:

```typescript
// En main.ts
app.enableCors({
  origin: ['http://localhost:8080', 'http://localhost:3001'], // Agrega tus dominios frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Accept, Authorization',
});
```

---

## 🎯 **Conclusión**

Esta implementación te proporciona:

- ✅ **Selectores reactivos** que se actualizan automáticamente
- ✅ **Manejo de errores** robusto
- ✅ **Estados de carga** para mejor UX
- ✅ **Código reutilizable** para diferentes frameworks
- ✅ **Performance optimizada** con cache y lazy loading
- ✅ **Accesibilidad** y mejores prácticas de UX

¡Ahora puedes implementar estos selectores en cualquier proyecto que necesite selección de países y ciudades!
