package iuh.labbooking.util;

/*
 * @description: DurationParserUtil
 * @author: Trần Ngọc Huyền
 * @date: 12/20/2025
 * @version: 1.0
 */

public class DurationParserUtil {

    /**
     * Parse duration string to milliseconds
     * Supported formats:
     * - s: seconds (e.g., "30s" = 30 seconds)
     * - m: minutes (e.g., "30m" = 30 minutes)
     * - h: hours (e.g., "1h" = 1 hour)
     * - d: days (e.g., "7d" = 7 days)
     *
     * @param duration duration string (e.g., "30m", "1h", "7d")
     * @return duration in milliseconds
     * @throws IllegalArgumentException if format is invalid
     */
    public static long parseToMilliseconds(String duration) {
        if (duration == null || duration.isEmpty()) {
            throw new IllegalArgumentException("Duration cannot be null or empty");
        }

        duration = duration.trim();
        
        String numberPart = duration.substring(0, duration.length() - 1);
        char unit = duration.charAt(duration.length() - 1);

        try {
            long value = Long.parseLong(numberPart);
            
            return switch (unit) {
                case 's', 'S' -> value * 1000;
                case 'm', 'M' -> value * 60 * 1000;
                case 'h', 'H' -> value * 60 * 60 * 1000;
                case 'd', 'D' -> value * 24 * 60 * 60 * 1000;
                default -> throw new IllegalArgumentException(
                        "Invalid duration unit: " + unit + ". Supported units: s, m, h, d"
                );
            };
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid duration format: " + duration + ". Expected format: <number><unit> (e.g., 30m, 1h, 7d)"
            );
        }
    }

    /**
     * Parse duration string to seconds
     *
     * @param duration duration string (e.g., "30m", "1h", "7d")
     * @return duration in seconds
     */
    public static long parseToSeconds(String duration) {
        return parseToMilliseconds(duration) / 1000;
    }
}
