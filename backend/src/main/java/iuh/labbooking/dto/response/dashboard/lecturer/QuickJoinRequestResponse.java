package iuh.labbooking.dto.response.dashboard.lecturer;

import java.time.LocalDateTime;

public record QuickJoinRequestResponse(
    Long requestId,
    String studentName,
    String studentCode,
    String studentAvatar,
    String groupName,
    LocalDateTime createdAt
) {}
