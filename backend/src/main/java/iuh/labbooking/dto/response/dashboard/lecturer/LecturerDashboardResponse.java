package iuh.labbooking.dto.response.dashboard.lecturer;

import java.util.List;

public record LecturerDashboardResponse(
    LecturerKpiResponse kpis,
    List<UpcomingAgendaResponse> upcomingAgenda,
    List<QuickJoinRequestResponse> quickJoinRequests
) {}
