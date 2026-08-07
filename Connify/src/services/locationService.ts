import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';

export const locationService = {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Connify Location Permission',
          message: 'Connify needs access to your location to find nearby episodes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  },

  getCurrentLocation(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  },

  watchLocation(
    onSuccess: (position: GeoPosition) => void,
    onError: (error: GeoError) => void
  ): number {
    return Geolocation.watchPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  },

  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  },
};
