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
