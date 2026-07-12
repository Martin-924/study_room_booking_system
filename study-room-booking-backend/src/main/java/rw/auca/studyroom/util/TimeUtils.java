package rw.auca.studyroom.util;

import java.time.LocalTime;

/**
 * Shared time utility methods.
 */
public final class TimeUtils {

    private TimeUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Check if two time ranges overlap.
     */
    public static boolean timesOverlap(String startA, String endA, String startB, String endB) {
        if (startA == null || endA == null || startB == null || endB == null) {
            return false;
        }
        LocalTime aStart = LocalTime.parse(startA);
        LocalTime aEnd = LocalTime.parse(endA);
        LocalTime bStart = LocalTime.parse(startB);
        LocalTime bEnd = LocalTime.parse(endB);
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }
}
