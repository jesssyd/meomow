import * as Location from 'expo-location';
import { LocationData } from '@/types/cat';

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let address = 'Unknown location';
      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [
          place.street,
          place.city,
          place.region
        ].filter(Boolean);
        address = parts.join(', ') || 'Unknown location';
      }

      return {
        address,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        address: 'Location unavailable',
      };
    }
  }
}