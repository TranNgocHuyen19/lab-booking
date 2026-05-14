package iuh.labbooking.service.dashboard;

import iuh.labbooking.dto.response.dashboard.lecturer.LecturerDashboardResponse;
import java.time.LocalDate;

public interface LecturerDashboardService {
    LecturerDashboardResponse getLecturerDashboard(LocalDate fromDate, LocalDate toDate);
}
