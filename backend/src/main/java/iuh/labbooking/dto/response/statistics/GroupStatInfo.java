package iuh.labbooking.dto.response.statistics;

public record GroupStatInfo(
    String groupName,
    String groupType,
    double usageValue,
    int bookingCount
) {}
