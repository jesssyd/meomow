import * as Location from 'expo-location';
import { LocationData } from '@/types/cat';

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationData> {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        return {
          address: 'Location access denied',
        };
      }

      console.log('Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      console.log('Got location coordinates:', location.coords);

      // Try to get address from coordinates
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const formattedAddress = [
            address.street,
            address.city,
            address.region,
          ].filter(Boolean).join(', ');

          console.log('Reverse geocoded address:', formattedAddress);

          return {
            address: formattedAddress || 'Unknown location',
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          };
        }
      } catch (geocodeError) {
        console.error('Error reverse geocoding:', geocodeError);
      }

      // Fallback to coordinates if reverse geocoding fails
      return {
        address: `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        address: 'Unable to get location',
      };
    }
  },
};