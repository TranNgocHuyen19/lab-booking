package iuh.labbooking.dto.response.dashboard.lecturer;

public record LecturerKpiResponse(
    long pendingJoinRequests,
    long weeklySchedules,
    long guidingGroups,
    long totalStudents
) {}
