/**
 * Connify Live Telemetry & ETA Utilities
 * Handles Haversine distance, bearing angle calculation for circular radar maps,
 * and Zomato/Uber style transport ETA estimation (Walking vs. Vehicle).
 */

export type TransportMode = 'walking' | 'vehicle';

export interface TelemetryData {
  distanceMeters: number;
  distanceStr: string;
  bearingDegrees: number;
  etaMinutes: number;
  etaStr: string;
}

/**
 * Calculates Haversine distance in meters between two GPS coordinates.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates compass bearing in degrees (0 to 360) from point 1 to point 2.
 * Used for positioning the responder dot around the circular radar map.
 */
export function calculateBearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Calculates ETA based on distance and transport mode.
 * - Walking average speed: 5 km/h (~83.3 meters/min)
 * - Vehicle average speed: 30 km/h (~500 meters/min)
 */
export function calculateETA(distanceMeters: number, mode: TransportMode = 'walking'): { etaMinutes: number; etaStr: string } {
  const speedMetersPerMin = mode === 'vehicle' ? 500 : 83.3;
  const minutes = Math.max(1, Math.ceil(distanceMeters / speedMetersPerMin));

  if (minutes < 1) {
    return { etaMinutes: 1, etaStr: '< 1 min' };
  } else if (minutes > 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return { etaMinutes: minutes, etaStr: `${hrs}h ${mins}m` };
  }
  return { etaMinutes: minutes, etaStr: `~${minutes} min` };
}

/**
 * Derives full telemetry object given two points and transport mode.
 */
export function getFullTelemetry(
  reqLat: number,
  reqLng: number,
  respLat: number,
  respLng: number,
  mode: TransportMode = 'walking'
): TelemetryData {
  const distanceMeters = calculateDistanceMeters(reqLat, reqLng, respLat, respLng);
  const bearingDegrees = calculateBearingDegrees(reqLat, reqLng, respLat, respLng);
  const { etaMinutes, etaStr } = calculateETA(distanceMeters, mode);

  let distanceStr = `~${distanceMeters}m`;
  if (distanceMeters < 50) {
    distanceStr = '📍 < 50m (Immediate On-Scene)';
  } else if (distanceMeters >= 1000) {
    distanceStr = `~${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return {
    distanceMeters,
    distanceStr,
    bearingDegrees,
    etaMinutes,
    etaStr,
  };
}
