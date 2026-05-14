package iuh.labbooking.service.dashboard;

import iuh.labbooking.dto.response.dashboard.lecturer.*;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.GroupJoinRequest;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.repository.*;
import iuh.labbooking.service.dashboard.LecturerDashboardService;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LecturerDashboardServiceImpl implements LecturerDashboardService {

    private final SecurityUtil securityUtil;

    private final ResearchGroupRepository researchGroupRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final SlotBookingRepository slotBookingRepository;
    private final GroupMembershipRepository groupMembershipRepository;

    @Override
    public LecturerDashboardResponse getLecturerDashboard(LocalDate fromDate, LocalDate toDate) {
        Long userId = securityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();

        long pendingJoinRequests = groupJoinRequestRepository.countPendingJoinRequestsByLecturer(userId, RequestStatus.PENDING);
        long periodSchedules = slotBookingRepository.countWeeklySchedulesByLecturer(userId, fromDate, toDate);
        long guidingGroups = researchGroupRepository.countManagedGroups(userId);
        long totalStudents = groupMembershipRepository.countStudentsInManagedGroups(userId);

        LecturerKpiResponse kpis = new LecturerKpiResponse(
            pendingJoinRequests,
            periodSchedules,
            guidingGroups,
            totalStudents
        );

        List<SlotBooking> agendaSlots = slotBookingRepository.findByLecturerAndDateRange(userId, fromDate, toDate, PageRequest.of(0, 10));
        List<UpcomingAgendaResponse> agenda = agendaSlots.stream().map(sb -> {
            String groupName = sb.getBookingRequest().getResearchGroup().isEmpty() 
                ? "Cá nhân" 
                : sb.getBookingRequest().getResearchGroup().iterator().next().getGroupName();
            
            String slotTime = sb.getSlot().getStartTime().toString().substring(0, 5) + " - " + sb.getSlot().getEndTime().toString().substring(0, 5);

            return new UpcomingAgendaResponse(
                sb.getBookingRequest().getBookingRequestId(),
                sb.getBookingRequest().getLabRoom().getRoomName(),
                sb.getSlot().getSlotName(),
                slotTime,
                groupName,
                sb.getBookingRequest().getBookingType().name(),
                sb.getBookingDate(),
                sb.getBookingRequest().getStatus().name()
            );
        }).collect(Collectors.toList());

        // 3. Quick Approval Widget (Not usually filtered by date range of stats, but kept current)
        List<GroupJoinRequest> recentRequests = groupJoinRequestRepository.findRecentJoinRequestsByLecturer(userId, RequestStatus.PENDING, PageRequest.of(0, 5));
        List<QuickJoinRequestResponse> quickRequests = recentRequests.stream().map(r -> new QuickJoinRequestResponse(
            r.getGroupJoinRequestId(),
            r.getUser().getFullName(),
            r.getUser().getUsername(),
            null, 
            r.getResearchGroup().getGroupName(),
            r.getCreatedAt()
        )).collect(Collectors.toList());

        return new LecturerDashboardResponse(kpis, agenda, quickRequests);
    }
}
