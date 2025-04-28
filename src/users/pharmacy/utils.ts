// convert HH:mm string to minute
export function strTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// convert minute to HH:mm format string
export function minutesToTimeStr(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// function to calculate distance (Haversine formula)
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 6371_000; // radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};
