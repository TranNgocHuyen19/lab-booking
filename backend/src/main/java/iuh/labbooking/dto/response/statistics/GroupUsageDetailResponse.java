package iuh.labbooking.dto.response.statistics;

import iuh.labbooking.enums.GroupType;

public record GroupUsageDetailResponse(
    Long groupId,
    String groupName,
    GroupType groupType,
    String lecturerName,
    String mostUsedRoom,
    String mostUsedShift,
    double totalHours,
    int bookingCount
) {}
