import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';

const getWebGeolocation = () => {
  const g = globalThis as any;
  return g?.navigator?.geolocation || null;
};

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

    const webGeo = getWebGeolocation();
    if (webGeo) {
      return new Promise<boolean>((resolve) => {
        webGeo.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
    }

    return false;
  },

  getCurrentLocation(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      const webGeo = getWebGeolocation();
      if (Platform.OS === 'web' && webGeo) {
        webGeo.getCurrentPosition(
          (pos: any) => {
            resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude,
                accuracy: pos.coords.accuracy,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            } as GeoPosition);
          },
          (err: any) => {
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
        return;
      }
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
    const webGeo = getWebGeolocation();
    if (Platform.OS === 'web' && webGeo) {
      return webGeo.watchPosition(
        (pos: any) => {
          onSuccess({
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              accuracy: pos.coords.accuracy,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            },
            timestamp: pos.timestamp,
          } as GeoPosition);
        },
        (err: any) => {
          onError({
            code: err.code,
            message: err.message,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            PLAY_SERVICES_NOT_AVAILABLE: 4,
            SETTINGS_NOT_SATISFIED: 5,
            INTERNAL_ERROR: -1,
          } as GeoError);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    }
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
    const webGeo = getWebGeolocation();
    if (Platform.OS === 'web' && webGeo) {
      webGeo.clearWatch(watchId);
      return;
    }
    Geolocation.clearWatch(watchId);
  },
};
