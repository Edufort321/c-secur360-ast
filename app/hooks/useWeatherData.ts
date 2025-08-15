// app/hooks/useWeatherData.ts
import { useState, useEffect, useCallback } from 'react';

interface WeatherConditions {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  precipitation: number; // mm/h
  visibility: number; // km
  pressure: number; // kPa
  conditions: string;
  icon: string;
  uvIndex: number;
  dewPoint: number;
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  affectedWork: string[];
  restrictions: string[];
  validUntil: Date;
}

interface SafetyRecommendations {
  canWork: boolean;
  restrictions: string[];
  requiredPPE: string[];
  monitoringRequired: boolean;
  recommendations: string[];
}

interface WeatherHookResult {
  currentWeather: WeatherConditions | null;
  forecast24h: WeatherConditions[];
  alerts: WeatherAlert[];
  safetyRecommendations: SafetyRecommendations;
  isLoading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  evaluateWorkSafety: (workType: string) => SafetyRecommendations;
}

export function useWeatherData(coordinates?: { lat: number; lng: number }): WeatherHookResult {
  const [currentWeather, setCurrentWeather] = useState<WeatherConditions | null>(null);
  const [forecast24h, setForecast24h] = useState<WeatherConditions[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulation météo pour Sherbrooke, QC
  const generateMockWeather = useCallback((): WeatherConditions => {
    const baseTemp = 15; // Température de base pour l'automne
    const variation = (Math.random() - 0.5) * 10;
    
    return {
      temperature: Math.round((baseTemp + variation) * 10) / 10,
      humidity: Math.round(45 + Math.random() * 40), // 45-85%
      windSpeed: Math.round(Math.random() * 30), // 0-30 km/h
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      precipitation: Math.random() < 0.3 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
      visibility: Math.round((15 + Math.random() * 10) * 10) / 10, // 15-25 km
      pressure: Math.round((101 + (Math.random() - 0.5) * 4) * 10) / 10, // 99-103 kPa
      conditions: Math.random() < 0.7 ? 'Partly Cloudy' : Math.random() < 0.5 ? 'Cloudy' : 'Clear',
      icon: '⛅',
      uvIndex: Math.round(Math.random() * 6), // 0-6
      dewPoint: Math.round((baseTemp - 5 + Math.random() * 8) * 10) / 10
    };
  }, []);

  const generateAlerts = useCallback((weather: WeatherConditions): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];

    // Alert vent fort
    if (weather.windSpeed > 40) {
      alerts.push({
        id: 'high_wind',
        type: 'warning',
        severity: 'high',
        title: 'Avertissement de vents forts',
        description: `Vents soutenus de ${weather.windSpeed} km/h. Risque pour travail en hauteur.`,
        affectedWork: ['working_at_height', 'crane_operations', 'scaffolding'],
        restrictions: ['Arrêt travaux en hauteur >10m', 'Surveillance renforcée grues'],
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6h
      });
    }

    // Alert précipitations
    if (weather.precipitation > 2) {
      alerts.push({
        id: 'heavy_rain',
        type: 'advisory',
        severity: 'moderate',
        title: 'Avis de précipitations importantes',
        description: `Précipitations de ${weather.precipitation} mm/h. Surfaces glissantes.`,
        affectedWork: ['outdoor_work', 'electrical_work', 'excavation'],
        restrictions: ['Travaux électriques extérieurs suspendus', 'Attention surfaces glissantes'],
        validUntil: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3h
      });
    }

    // Alert froid extrême
    if (weather.temperature < -25) {
      alerts.push({
        id: 'extreme_cold',
        type: 'warning',
        severity: 'extreme',
        title: 'Avertissement froid extrême',
        description: `Température de ${weather.temperature}°C. Risque d'hypothermie et gelures.`,
        affectedWork: ['all_outdoor_work'],
        restrictions: ['Pauses réchauffement obligatoires aux 30 min', 'Surveillance médicale'],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12h
      });
    }

    // Alert chaleur extrême
    if (weather.temperature > 32 && weather.humidity > 70) {
      alerts.push({
        id: 'extreme_heat',
        type: 'warning', 
        severity: 'high',
        title: 'Avertissement chaleur accablante',
        description: `Température ${weather.temperature}°C, humidité ${weather.humidity}%. Risque coup de chaleur.`,
        affectedWork: ['heavy_physical_work', 'ppe_intensive_work'],
        restrictions: ['Pauses fréquentes à l\'ombre', 'Hydratation renforcée', 'Surveillance médicale'],
        validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8h
      });
    }

    // Alert visibilité réduite
    if (weather.visibility < 5) {
      alerts.push({
        id: 'low_visibility',
        type: 'advisory',
        severity: 'moderate', 
        title: 'Avis visibilité réduite',
        description: `Visibilité réduite à ${weather.visibility} km.`,
        affectedWork: ['vehicle_operations', 'crane_operations', 'spotting_work'],
        restrictions: ['Signalisation renforcée', 'Communication radio obligatoire'],
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4h
      });
    }

    return alerts;
  }, []);

  const evaluateWorkSafety = useCallback((workType: string): SafetyRecommendations => {
    if (!currentWeather) {
      return {
        canWork: false,
        restrictions: ['Données météo non disponibles'],
        requiredPPE: [],
        monitoringRequired: true,
        recommendations: ['Attendre données météo avant de commencer']
      };
    }

    const weather = currentWeather;
    let canWork = true;
    const restrictions: string[] = [];
    const requiredPPE: string[] = [];
    const recommendations: string[] = [];

    // Évaluation selon type de travail
    if (workType.includes('height') || workType.includes('crane')) {
      if (weather.windSpeed > 40) {
        canWork = false;
        restrictions.push('Vent >40 km/h - Arrêt obligatoire travaux hauteur');
      } else if (weather.windSpeed > 25) {
        restrictions.push('Vent 25-40 km/h - Surveillance renforcée');
        recommendations.push('Réduire exposition au vent');
      }
    }

    if (workType.includes('electrical')) {
      if (weather.precipitation > 0) {
        canWork = false;
        restrictions.push('Précipitations - Travaux électriques extérieurs interdits');
      }
      if (weather.humidity > 85) {
        restrictions.push('Humidité >85% - Précautions supplémentaires');
        requiredPPE.push('Équipements étanches renforcés');
      }
    }

    // Conditions générales température
    if (weather.temperature < -20) {
      restrictions.push('Froid extrême - Pauses réchauffement aux 30 min');
      requiredPPE.push('Vêtements isolés multicouches');
      recommendations.push('Surveillance signes hypothermie');
    }

    if (weather.temperature > 30 && weather.humidity > 70) {
      restrictions.push('Chaleur accablante - Pauses fréquentes obligatoires');
      requiredPPE.push('Vêtements légers respirants');
      recommendations.push('Hydratation renforcée');
    }

    // Visibilité
    if (weather.visibility < 10) {
      requiredPPE.push('Vêtements haute visibilité renforcés');
      recommendations.push('Éclairage additionnel requis');
    }

    return {
      canWork,
      restrictions,
      requiredPPE,
      monitoringRequired: restrictions.length > 0 || weather.temperature < -15 || weather.temperature > 28,
      recommendations
    };
  }, [currentWeather]);

  const refreshWeather = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulation délai API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const weather = generateMockWeather();
      setCurrentWeather(weather);

      // Générer prévisions 24h (6 points aux 4h)
      const forecast: WeatherConditions[] = [];
      for (let i = 1; i <= 6; i++) {
        const futureWeather = generateMockWeather();
        // Ajouter une tendance progressive
        futureWeather.temperature += (Math.random() - 0.5) * 2;
        forecast.push(futureWeather);
      }
      setForecast24h(forecast);

      // Générer alertes selon conditions
      const weatherAlerts = generateAlerts(weather);
      setAlerts(weatherAlerts);

    } catch (err) {
      setError('Erreur lors de la récupération des données météo');
    } finally {
      setIsLoading(false);
    }
  }, [generateMockWeather, generateAlerts]);

  // Charger météo initiale
  useEffect(() => {
    refreshWeather();
    
    // Rafraîchir aux 15 minutes
    const interval = setInterval(refreshWeather, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshWeather]);

  // Calculer recommandations sécurité
  const safetyRecommendations = evaluateWorkSafety('general');

  return {
    currentWeather,
    forecast24h,
    alerts,
    safetyRecommendations,
    isLoading,
    error,
    refreshWeather,
    evaluateWorkSafety
  };
}
