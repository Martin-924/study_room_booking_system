/**
 * Time utility functions shared across the application.
 */

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function padTime(value) {
  return String(value).padStart(2, '0');
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${padTime(hours)}:${padTime(minutes)}`;
}

export function roundUpToStep(totalMinutes, step = 30) {
  return Math.ceil(totalMinutes / step) * step;
}

export function roundDownToStep(totalMinutes, step = 30) {
  return Math.floor(totalMinutes / step) * step;
}

export function buildTimeSlots(startMinutes, endMinutes, step = 30) {
  const slots = [];
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += step) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

export function getDefaultStartTime(room, bookingDate) {
  if (!room) return '';
  const openMinutes = timeToMinutes(room.openTime || '08:00');
  const closeMinutes = timeToMinutes(room.closeTime || '22:00');
  const latestStartMinutes = Math.max(openMinutes, closeMinutes - 30);

  if (bookingDate === today()) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = roundUpToStep(currentMinutes, 30);
    return minutesToTime(Math.min(Math.max(roundedMinutes, openMinutes), latestStartMinutes));
  }

  return minutesToTime(openMinutes);
}

export function getDefaultEndTime(room, startTime) {
  if (!room || !startTime) return '';
  const closeMinutes = timeToMinutes(room.closeTime || '22:00');
  const endMinutes = timeToMinutes(startTime) + 30;
  if (endMinutes > closeMinutes) return '';
  return minutesToTime(endMinutes);
}

export function canCheckIn(booking) {
  if (booking.bookingDate !== today()) return false;
  if (!booking.startTime) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = booking.startTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const deadlineMin = startMin + 30;
  return nowMin >= startMin && nowMin < deadlineMin;
}

export function floorLabel(floor) {
  if (floor < 0) return 'B' + Math.abs(floor) + '层';
  return floor + '层';
}
