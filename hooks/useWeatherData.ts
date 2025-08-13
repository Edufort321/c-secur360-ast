// hooks/useWeatherData.ts
import { useState, useEffect } from 'react';
import { getWeatherData } from '@/lib/weatherApi'; // Utilise la route /api/weather

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  conditions: string;
  warnings: string[];
  impact: 'low' | 'medium' | 'high';
  pressure: number;
  feelsLike: number;
  dewPoint: number;
  cloudCover: number;
}

export interface WeatherAlert {
  id: string;
  type: 'temperature' | 'wind' | 'precipitation' | 'visibility' | 'uv' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  validUntil?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export const useWeatherData = (coordinates: Coordinates) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!coordinates.lat || !coordinates.lng) return;
    
    setLoading(true);
    setError(null);
    
    try {
        const fetchedWeather = await getWeatherData(coordinates.lat, coordinates.lng);
        setWeather(fetchedWeather);

        // Générer des alertes basées sur les conditions
        const generatedAlerts = generateWeatherAlerts(fetchedWeather);
        setAlerts(generatedAlerts);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des données météo';
      setError(message);
      console.error('Erreur météo:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];

    // Alertes de température
    if (weather.temperature < -25) {
      alerts.push({
        id: 'temp-extreme-cold',
        type: 'temperature',
        severity: 'critical',
        message: 'Froid extrême détecté',
        recommendation: 'Reportez les travaux extérieurs. Risque d\'hypothermie et de gelures.'
      });
    } else if (weather.temperature < -15) {
      alerts.push({
        id: 'temp-cold',
        type: 'temperature',
        severity: 'high',
        message: 'Température très froide',
        recommendation: 'Équipement de protection contre le froid requis. Pauses fréquentes recommandées.'
      });
    } else if (weather.temperature > 35) {
      alerts.push({
        id: 'temp-hot',
        type: 'temperature',
        severity: 'high',
        message: 'Température très élevée',
        recommendation: 'Risque de coup de chaleur. Hydratation fréquente et pauses à l\'ombre.'
      });
    }

    // Alertes de vent
    if (weather.windSpeed > 50) {
      alerts.push({
        id: 'wind-extreme',
        type: 'wind',
        severity: 'critical',
        message: 'Vents très forts détectés',
        recommendation: 'Interdiction de travail en hauteur. Sécurisez tous les équipements mobiles.'
      });
    } else if (weather.windSpeed > 30) {
      alerts.push({
        id: 'wind-strong',
        type: 'wind',
        severity: 'medium',
        message: 'Vents forts',
        recommendation: 'Prudence pour les travaux en hauteur. Surveillez les objets volants.'
      });
    }

    // Alertes de visibilité
    if (weather.visibility < 3) {
      alerts.push({
        id: 'visibility-low',
        type: 'visibility',
        severity: 'high',
        message: 'Visibilité réduite',
        recommendation: 'Éclairage renforcé requis. Vêtements haute visibilité obligatoires.'
      });
    }

    // Alertes UV
    if (weather.uvIndex > 8) {
      alerts.push({
        id: 'uv-high',
        type: 'uv',
        severity: 'medium',
        message: 'Index UV élevé',
        recommendation: 'Protection solaire requise. Évitez l\'exposition prolongée.'
      });
    }

    // Alertes de précipitations
    if (weather.precipitation > 10) {
      alerts.push({
        id: 'precipitation-heavy',
        type: 'precipitation',
        severity: weather.precipitation > 25 ? 'high' : 'medium',
        message: 'Précipitations importantes',
        recommendation: 'Surfaces glissantes. Équipement étanche recommandé.'
      });
    }

    return alerts;
  };

  const getWeatherIcon = (conditions: string): string => {
    const icons: Record<string, string> = {
      'ensoleillé': '☀️',
      'nuageux': '☁️',
      'pluvieux': '🌧️',
      'neigeux': '❄️',
      'orageux': '⛈️'
    };
    return icons[conditions] || '🌤️';
  };

  const getComfortLevel = (weather: WeatherData): 'excellent' | 'good' | 'acceptable' | 'poor' | 'dangerous' => {
    if (weather.temperature < -25 || weather.temperature > 40 || weather.windSpeed > 60) {
      return 'dangerous';
    }
    if (weather.temperature < -15 || weather.temperature > 35 || weather.windSpeed > 40) {
      return 'poor';
    }
    if (weather.temperature < -5 || weather.temperature > 30 || weather.windSpeed > 25) {
      return 'acceptable';
    }
    if (weather.temperature < 5 || weather.temperature > 25 || weather.windSpeed > 15) {
      return 'good';
    }
    return 'excellent';
  };

  const getWorkRecommendation = (weather: WeatherData): {
    canWork: boolean;
    restrictions: string[];
    requiredEquipment: string[];
  } => {
    const restrictions: string[] = [];
    const requiredEquipment: string[] = [];
    let canWork = true;

    // Conditions dangereuses
    if (weather.temperature < -30 || weather.temperature > 45 || weather.windSpeed > 70) {
      canWork = false;
      restrictions.push('Arrêt de travail obligatoire - Conditions dangereuses');
    }

    // Restrictions par température
    if (weather.temperature < -20) {
      restrictions.push('Pauses chauffage toutes les 30 minutes');
      requiredEquipment.push('Vêtements chauffants', 'Boissons chaudes');
    } else if (weather.temperature < -10) {
      restrictions.push('Pauses réchauffement toutes les heures');
      requiredEquipment.push('Vêtements isolants');
    }

    if (weather.temperature > 35) {
      restrictions.push('Pauses refroidissement toutes les 30 minutes');
      requiredEquipment.push('Eau fraîche', 'Zone ombragée');
    }

    // Restrictions par vent
    if (weather.windSpeed > 50) {
      restrictions.push('Interdiction travail en hauteur');
      requiredEquipment.push('Sécurisation équipements mobiles');
    } else if (weather.windSpeed > 30) {
      restrictions.push('Prudence accrue en hauteur');
    }

    // Restrictions par visibilité
    if (weather.visibility < 5) {
      restrictions.push('Éclairage renforcé obligatoire');
      requiredEquipment.push('Gilets haute visibilité', 'Éclairage portable');
    }

    return { canWork, restrictions, requiredEquipment };
  };

  useEffect(() => {
    fetchWeather();
  }, [coordinates.lat, coordinates.lng]);

  // Actualisation automatique toutes les 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coordinates]);

  return {
    weather,
    alerts,
    loading,
    error,
    refetch: fetchWeather,
    getWeatherIcon,
    getComfortLevel,
    getWorkRecommendation
  };
};

export default useWeatherData;
