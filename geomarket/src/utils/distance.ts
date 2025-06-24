export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getStoresWithinRadius = (
  userLat: number,
  userLng: number,
  radius: number,
  stores: any[]
): any[] => {
  return stores.filter(store => {
    const storeCoords = wktToCoordinates(store.coordinates);
    const distance = calculateDistance(userLat, userLng, storeCoords.lat, storeCoords.lng);
    return distance <= radius;
  });
};

const wktToCoordinates = (wkt: string): { lat: number; lng: number } => {
  const match = wkt.match(/POINT\(([^)]+)\)/);
  if (match) {
    const [lng, lat] = match[1].split(' ').map(Number);
    return { lat, lng };
  }
  return { lat: 0, lng: 0 };
};