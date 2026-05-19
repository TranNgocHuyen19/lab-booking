package iuh.labbooking.service.statistics;

import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.statistics.*;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabBookingStatisticsServiceImpl implements LabBookingStatisticsService {

    private final BookingRequestRepository bookingRequestRepository;

    @Override
    public LabBookingKpiResponse getKpis(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        long pendingCount = bookingRequestRepository.countByStatus(RequestStatus.PENDING);
        
        long totalProcessed = bookingRequestRepository.countByDateRange(start, end);
        long approvedCount = bookingRequestRepository.countByStatusAndDateRange(RequestStatus.APPROVED, start, end);
        long systemCanceledCount = bookingRequestRepository.countByStatusAndDateRange(RequestStatus.SYSTEM_CANCELED, start, end);

        double approvalRate = totalProcessed > 0 ? (double) approvedCount / totalProcessed * 100 : 0;
        double conflictRate = totalProcessed > 0 ? (double) systemCanceledCount / totalProcessed * 100 : 0;

        List<Object[]> times = bookingRequestRepository.findProcessingTimes(start, end);
        double avgSpeed = 0;
        if (!times.isEmpty()) {
            long totalMinutes = times.stream()
                    .mapToLong(t -> Duration.between((LocalDateTime)t[0], (LocalDateTime)t[1]).toMinutes())
                    .sum();
            avgSpeed = (double) totalMinutes / times.size();
        }

        return LabBookingKpiResponse.builder()
                .pendingCount(pendingCount)
                .avgProcessingSpeedMinutes(avgSpeed)
                .approvalRate(approvalRate)
                .conflictRate(conflictRate)
                .build();
    }

    @Override
    public List<BookingOutcomeResponse> getOutcomeDistribution(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = bookingRequestRepository.countByStatusDistribution(start, end);
        long total = results.stream().mapToLong(r -> (long) r[1]).sum();

        return results.stream().map(r -> {
            RequestStatus status = (RequestStatus) r[0];
            long count = (long) r[1];
            double percentage = total > 0 ? (double) count / total * 100 : 0;
            return BookingOutcomeResponse.builder()
                    .status(status)
                    .count(count)
                    .percentage(percentage)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<SubmissionTrendResponse> getSubmissionTrend(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = bookingRequestRepository.countByHourlyTrend(start, end);
        Map<Integer, Long> trendMap = results.stream()
                .collect(Collectors.toMap(r -> (int) r[0], r -> (long) r[1]));

        List<SubmissionTrendResponse> trend = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            trend.add(SubmissionTrendResponse.builder()
                    .hour(h)
                    .count(trendMap.getOrDefault(h, 0L))
                    .build());
        }
        return trend;
    }

    @Override
    public PageResponse<List<BookingAuditLogResponse>> getAuditLogs(
            LocalDate startDate, LocalDate endDate, RequestStatus status, String adminId, int page, int limit) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Pageable pageable = PageRequest.of(page, limit, Sort.by("modifiedAt").descending());
        Page<BookingRequest> bookingPage = bookingRequestRepository.filterAuditLogs(start, end, status, adminId, pageable);

        List<Long> ids = bookingPage.getContent().stream().map(BookingRequest::getBookingRequestId).toList();
        List<BookingRequest> fullBookings = bookingRequestRepository.findByIdsWithParticipants(ids);
        Map<Long, BookingRequest> bookingMap = fullBookings.stream()
                .collect(Collectors.toMap(BookingRequest::getBookingRequestId, b -> b));

        List<BookingAuditLogResponse> dtoList = bookingPage.getContent().stream().map(b -> {
            BookingRequest fullB = bookingMap.get(b.getBookingRequestId());
            if (fullB == null) fullB = b;

            Long processingMinutes = null;
            if (fullB.getModifiedAt() != null && (fullB.getStatus() == RequestStatus.APPROVED || fullB.getStatus() == RequestStatus.REJECTED)) {
                processingMinutes = Duration.between(fullB.getCreatedAt(), fullB.getModifiedAt()).toMinutes();
            }

            return BookingAuditLogResponse.builder()
                    .bookingId(fullB.getBookingRequestId())
                    .requesterName(fullB.getRequester().getFullName())
                    .requesterMssv(fullB.getRequester().getUsername())
                    .requesterAvatar(null)
                    .bookingType(fullB.getBookingType())
                    .submitTime(fullB.getCreatedAt())
                    .processTime(fullB.getModifiedAt())
                    .processingTimeMinutes(processingMinutes)
                    .status(fullB.getStatus())
                    .build();
        }).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                bookingPage.getNumber() + 1,
                bookingPage.getTotalPages(),
                bookingPage.getSize(),
                bookingPage.getTotalElements()
        );
    }

}
