package iuh.labbooking.dto.projection;

import iuh.labbooking.enums.GroupType;

public record GroupUsageDetailStat(
    Long groupId,
    String groupName,
    GroupType groupType,
    String creatorName,
    long bookingCount,
    long slotCount,
    long totalAttendees
) {}
