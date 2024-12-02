import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationHook {
  coordinates: Coordinates | null;
  error: string | null;
  requesting: boolean;
  requestPermission: () => Promise<void>;
}

export function useLocation(): LocationHook {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const requestPermission = async () => {
    setRequesting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      
      // Store the location in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      toast.error('Please enable location services for better search results');
    } finally {
      setRequesting(false);
    }
  };

  // On mount, check if we have a stored location that's less than 1 hour old
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      const { latitude, longitude, timestamp } = JSON.parse(storedLocation);
      const storedTime = new Date(timestamp).getTime();
      const hourAgo = new Date().getTime() - 60 * 60 * 1000;

      if (storedTime > hourAgo) {
        setCoordinates({ latitude, longitude });
      } else {
        // Location is too old, request a new one
        requestPermission();
      }
    }
  }, []);

  return { coordinates, error, requesting, requestPermission };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}