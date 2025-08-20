// utils/location.ts
import * as Location from 'expo-location';
import { LocationData } from '@/types/cat';

function formatAddress(parts: Partial<Location.LocationGeocodedAddress>) {
  const s = [parts.street, parts.city, parts.region, parts.country]
    .filter(Boolean)
    .join(', ');
  return s ? s.toLowerCase() : undefined;
}

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.error('requestPermissions error', e);
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationData> {
    try {
      const ok = await this.requestPermissions();
      if (!ok) return { address: 'location access denied' };

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      let address = undefined as string | undefined;
      try {
        const [place] = await Location.reverseGeocodeAsync(position.coords);
        address = place ? formatAddress(place) : undefined;
      } catch (geocodeError) {
        console.warn('reverseGeocode failed', geocodeError);
      }

      return {
        address:
          address ??
          `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
    } catch (error) {
      console.error('getCurrentLocation error', error);
      return { address: 'unable to get location' };
    }
  },
};
