package iuh.labbooking.dto.response.statistics;

import java.util.Map;

public record GroupUsageShiftStat(
        String slotName,
        Map<String, Double> distribution
) {
}
