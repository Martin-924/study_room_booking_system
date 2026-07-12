import { useMemo } from 'react';

/**
 * Calculate time slot distribution from bookings.
 */
export function useTimeStats(bookings, reportDate) {
  return useMemo(() => {
    const slots = [
      { label: '08:00', range: [8, 10], count: 0 },
      { label: '10:00', range: [10, 12], count: 0 },
      { label: '14:00', range: [14, 16], count: 0 },
      { label: '16:00', range: [16, 18], count: 0 },
      { label: '19:00', range: [19, 21], count: 0 },
    ];
    if (bookings && bookings.length > 0) {
      bookings.forEach(b => {
        if (b.status === 'CANCELLED') return;
        if (reportDate && b.bookingDate !== reportDate) return;
        if (!b.startTime) return;
        const h = parseInt(b.startTime.split(':')[0], 10);
        slots.forEach(s => {
          if (h >= s.range[0] && h < s.range[1]) s.count++;
        });
      });
    }
    return slots.map(s => ({ label: s.label, count: s.count }));
  }, [bookings, reportDate]);
}

/**
 * Calculate room usage rates from bookings (time-weighted).
 * @param {string} [dateFilter] - Optional date filter (yyyy-MM-dd)
 */
export function useRoomUsage(usage, rooms, bookings, dateFilter) {
  return useMemo(() => {
    if (usage && usage.some(u => u.usageRate > 0)) return usage;
    if (!rooms || !bookings) return usage || [];

    const hrs = (s, e) => {
      const [sh, sm] = s.split(':').map(Number);
      const [eh, em] = e.split(':').map(Number);
      return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
    };

    const active = bookings.filter(b =>
      b.status !== 'CANCELLED' && (!dateFilter || b.bookingDate === dateFilter)
    );
    return rooms.map(room => {
      const totalHrs = hrs(room.openTime || '08:00', room.closeTime || '22:00') * (room.capacity || 1);
      const usedHrs = active.filter(b => b.roomId === room.id)
        .reduce((sum, b) => sum + hrs(b.startTime || '08:00', b.endTime || '22:00'), 0);
      const rate = totalHrs > 0 ? Math.round((usedHrs / totalHrs) * 100) : 0;
      return {
        roomId: room.id, roomName: room.name,
        buildingName: room.buildingName || '未分配楼栋', floorNumber: room.floorNumber || 1,
        usageRate: Math.min(100, rate),
      };
    });
  }, [usage, rooms, bookings, dateFilter]);
}
