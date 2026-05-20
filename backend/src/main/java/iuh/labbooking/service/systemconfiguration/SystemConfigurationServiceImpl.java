package iuh.labbooking.service.systemconfiguration;

import iuh.labbooking.dto.request.configuration.UpdateAttendanceSystemConfigRequest;
import iuh.labbooking.dto.request.configuration.UpdateBookingSystemConfigRequest;
import iuh.labbooking.dto.response.configuration.AttendanceSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.BookingSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.SystemConfigHistoryResponse;
import iuh.labbooking.dto.request.configuration.UpdateConfigFieldRequest;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.SystemConfigMapper;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.AttendanceSystemConfigRepository;
import iuh.labbooking.repository.BookingSystemConfigRepository;
import iuh.labbooking.repository.SystemConfigHistoryRepository;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigurationServiceImpl implements SystemConfigurationService {

    private final AttendanceSystemConfigRepository attendanceConfigRepository;
    private final BookingSystemConfigRepository bookingConfigRepository;
    private final SystemConfigHistoryRepository historyRepository;
    private final SecurityUtil securityUtil;
    
    private final AttendanceConfigReadService attendanceConfigReadService;
    private final BookingConfigReadService bookingConfigReadService;
    
    private final SystemConfigMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public AttendanceSystemConfig getActiveAttendanceConfig() {
        return attendanceConfigReadService.getActiveAttendanceConfig();
    }

    @Override
    @Transactional
    public AttendanceSystemConfig createAttendanceSnapshot() {
        AttendanceSystemConfig current = attendanceConfigReadService.getActiveAttendanceConfig();

        AttendanceSystemConfig snapshot = AttendanceSystemConfig.builder()
                .earlyCheckinMinutes(current.getEarlyCheckinMinutes())
                .lateCheckinMinutes(current.getLateCheckinMinutes())
                .earlyCheckoutMinutes(current.getEarlyCheckoutMinutes())
                .lateCheckoutMinutes(current.getLateCheckoutMinutes())
                .labRadiusMeters(current.getLabRadiusMeters())
                .active(true)
                .build();

        return attendanceConfigRepository.save(snapshot);
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", key = "'attendance'")
    public AttendanceSystemConfigResponse updateAttendanceConfig(UpdateAttendanceSystemConfigRequest request) {
        log.info("Evicting attendance config cache");
        Integer earlyCheckin = request.earlyCheckinMinutes();
        Integer lateCheckin = request.lateCheckinMinutes();
        Integer earlyCheckout = request.earlyCheckoutMinutes();
        Integer lateCheckout = request.lateCheckoutMinutes();
        Double radius = request.labRadiusMeters();
        String reason = request.reason();

        AttendanceSystemConfig current = attendanceConfigReadService.getActiveAttendanceConfig();
        User currentUser = securityUtil.getCurrentUser();
        String username = currentUser.getUsername();

        if (!current.getEarlyCheckinMinutes().equals(earlyCheckin)) {
            saveConfigHistory("ATTENDANCE-EARLY-CHECKIN-MINUTES", "Thời gian check-in sớm",
                    String.valueOf(current.getEarlyCheckinMinutes()),
                    String.valueOf(earlyCheckin), username, reason, "ATTENDANCE");
        }
        if (!current.getLateCheckinMinutes().equals(lateCheckin)) {
            saveConfigHistory("ATTENDANCE-LATE-CHECKIN-MINUTES", "Thời gian check-in trễ",
                    String.valueOf(current.getLateCheckinMinutes()),
                    String.valueOf(lateCheckin), username, reason, "ATTENDANCE");
        }
        if (!current.getEarlyCheckoutMinutes().equals(earlyCheckout)) {
            saveConfigHistory("ATTENDANCE-EARLY-CHECKOUT-MINUTES", "Thời gian check-out sớm",
                    String.valueOf(current.getEarlyCheckoutMinutes()),
                    String.valueOf(earlyCheckout), username, reason, "ATTENDANCE");
        }
        if (!current.getLateCheckoutMinutes().equals(lateCheckout)) {
            saveConfigHistory("ATTENDANCE-LATE-CHECKOUT-MINUTES", "Thời gian check-out trễ",
                    String.valueOf(current.getLateCheckoutMinutes()),
                    String.valueOf(lateCheckout), username, reason, "ATTENDANCE");
        }
        if (!current.getLabRadiusMeters().equals(radius)) {
            saveConfigHistory("ATTENDANCE-LAB-RADIUS-METERS", "Bán kính điểm danh GPS",
                    String.valueOf(current.getLabRadiusMeters()),
                    String.valueOf(radius), username, reason, "ATTENDANCE");
        }

        current.setActive(false);

        AttendanceSystemConfig newConfig = AttendanceSystemConfig.builder()
                .earlyCheckinMinutes(earlyCheckin)
                .lateCheckinMinutes(lateCheckin)
                .earlyCheckoutMinutes(earlyCheckout)
                .lateCheckoutMinutes(lateCheckout)
                .labRadiusMeters(radius)
                .active(true)
                .build();

        AttendanceSystemConfig saved = attendanceConfigRepository.save(newConfig);
        log.info("Attendance configuration updated by {}: ID={}", username, saved.getAttendanceSystemConfigId());

        return mapper.toAttendanceConfigResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSystemConfigResponse getAttendanceConfigResponse() {
        AttendanceSystemConfig config = attendanceConfigReadService.getActiveAttendanceConfig();
        return mapper.toAttendanceConfigResponse(config);
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", key = "'attendance'")
    public AttendanceSystemConfigResponse updateAttendanceField(String key, UpdateConfigFieldRequest request) {
        AttendanceSystemConfig current = attendanceConfigReadService.getActiveAttendanceConfig();
        User currentUser = securityUtil.getCurrentUser();
        String username = currentUser.getUsername();
        String reason = request.reason();
        
        if (request.value() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Double value = request.value();

        Integer earlyCheckin = current.getEarlyCheckinMinutes();
        Integer lateCheckin = current.getLateCheckinMinutes();
        Integer earlyCheckout = current.getEarlyCheckoutMinutes();
        Integer lateCheckout = current.getLateCheckoutMinutes();
        Double labRadius = current.getLabRadiusMeters();

        switch (key) {
            case "ATTENDANCE-EARLY-CHECKIN-MINUTES":
                if (earlyCheckin.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian check-in sớm", String.valueOf(earlyCheckin), String.valueOf(value.intValue()), username, reason, "ATTENDANCE");
                earlyCheckin = value.intValue();
                break;
            case "ATTENDANCE-LATE-CHECKIN-MINUTES":
                if (lateCheckin.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian check-in trễ", String.valueOf(lateCheckin), String.valueOf(value.intValue()), username, reason, "ATTENDANCE");
                lateCheckin = value.intValue();
                break;
            case "ATTENDANCE-EARLY-CHECKOUT-MINUTES":
                if (earlyCheckout.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian check-out sớm", String.valueOf(earlyCheckout), String.valueOf(value.intValue()), username, reason, "ATTENDANCE");
                earlyCheckout = value.intValue();
                break;
            case "ATTENDANCE-LATE-CHECKOUT-MINUTES":
                if (lateCheckout.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian check-out trễ", String.valueOf(lateCheckout), String.valueOf(value.intValue()), username, reason, "ATTENDANCE");
                lateCheckout = value.intValue();
                break;
            case "ATTENDANCE-LAB-RADIUS-METERS":
                if (labRadius.equals(value)) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Bán kính điểm danh GPS", String.valueOf(labRadius), String.valueOf(value), username, reason, "ATTENDANCE");
                labRadius = value;
                break;
            default:
                throw new AppException(ErrorCode.INVALID_KEY);
        }

        current.setActive(false);

        AttendanceSystemConfig newConfig = AttendanceSystemConfig.builder()
                .earlyCheckinMinutes(earlyCheckin)
                .lateCheckinMinutes(lateCheckin)
                .earlyCheckoutMinutes(earlyCheckout)
                .lateCheckoutMinutes(lateCheckout)
                .labRadiusMeters(labRadius)
                .active(true)
                .build();
        AttendanceSystemConfig saved = attendanceConfigRepository.save(newConfig);

        return mapper.toAttendanceConfigResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSystemConfig getActiveBookingConfig() {
        return bookingConfigReadService.getActiveBookingConfig();
    }

    @Override
    @Transactional
    public BookingSystemConfig createBookingSnapshot() {
        BookingSystemConfig current = bookingConfigReadService.getActiveBookingConfig();
        log.debug("Creating booking config snapshot from active config: activeConfigId={}, maxPendingBookings={}",
                current.getBookingSystemConfigId(),
                current.getMaxPendingBookings());

        BookingSystemConfig snapshot = BookingSystemConfig.builder()
                .studentAdvanceDays(current.getStudentAdvanceDays())
                .lecturerAdvanceDays(current.getLecturerAdvanceDays())
                .adminAdvanceDays(current.getAdminAdvanceDays())
                .minMinutesBeforeStartToCancel(current.getMinMinutesBeforeStartToCancel())
                .minMinutesBeforeStartToApprove(current.getMinMinutesBeforeStartToApprove())
                .studentMinMinutesToBook(current.getStudentMinMinutesToBook())
                .lecturerMinMinutesToBook(current.getLecturerMinMinutesToBook())
                .maxPendingBookings(current.getMaxPendingBookings())
                .active(true)
                .build();

        BookingSystemConfig saved = bookingConfigRepository.save(snapshot);
        log.debug("Booking config snapshot created: snapshotConfigId={}, sourceConfigId={}",
                saved.getBookingSystemConfigId(),
                current.getBookingSystemConfigId());
        return saved;
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", key = "'booking'")
    public BookingSystemConfigResponse updateBookingConfig(UpdateBookingSystemConfigRequest request) {
        log.info("Evicting booking config cache");
        Integer studentDays = request.studentAdvanceDays();
        Integer lecturerDays = request.lecturerAdvanceDays();
        Integer adminDays = request.adminAdvanceDays();

        Integer minMinutesBeforeStartToCancel = request.minMinutesBeforeStartToCancel();
        Integer minMinutesBeforeStartToApprove = request.minMinutesBeforeStartToApprove();
        Integer studentMinMinutesToBook = request.studentMinMinutesToBook();
        Integer lecturerMinMinutesToBook = request.lecturerMinMinutesToBook();
        String reason = request.reason();

        BookingSystemConfig current = bookingConfigReadService.getActiveBookingConfig();
        User currentUser = securityUtil.getCurrentUser();
        String username = currentUser.getUsername();

        if (!current.getStudentAdvanceDays().equals(studentDays)) {
            saveConfigHistory("BOOKING-ADVANCE-DAYS-STUDENT", "Số ngày đặt trước (Sinh viên)",
                    String.valueOf(current.getStudentAdvanceDays()),
                    String.valueOf(studentDays), username, reason, "BOOKING");
        }
        if (!current.getLecturerAdvanceDays().equals(lecturerDays)) {
            saveConfigHistory("BOOKING-ADVANCE-DAYS-LECTURER", "Số ngày đặt trước (Giảng viên)",
                    String.valueOf(current.getLecturerAdvanceDays()),
                    String.valueOf(lecturerDays), username, reason, "BOOKING");
        }
        if (!current.getAdminAdvanceDays().equals(adminDays)) {
            saveConfigHistory("BOOKING-ADVANCE-DAYS-ADMIN", "Số ngày đặt trước (Quản trị viên)",
                    String.valueOf(current.getAdminAdvanceDays()),
                    String.valueOf(adminDays), username, reason, "BOOKING");
        }

        if (!current.getMinMinutesBeforeStartToCancel().equals(minMinutesBeforeStartToCancel)) {
            saveConfigHistory("BOOKING-MIN-MINUTES-CANCEL", "Thời gian hủy trước (Phút)",
                    String.valueOf(current.getMinMinutesBeforeStartToCancel()),
                    String.valueOf(minMinutesBeforeStartToCancel), username, reason, "BOOKING");
        }

        if (!current.getMinMinutesBeforeStartToApprove().equals(minMinutesBeforeStartToApprove)) {
            saveConfigHistory("BOOKING-MIN-MINUTES-APPROVE", "Thời gian duyệt trước (Phút)",
                    String.valueOf(current.getMinMinutesBeforeStartToApprove()),
                    String.valueOf(minMinutesBeforeStartToApprove), username, reason, "BOOKING");
        }

        if (!current.getStudentMinMinutesToBook().equals(studentMinMinutesToBook)) {
            saveConfigHistory("BOOKING-MIN-MINUTES-CREATE-STUDENT", "Thời gian tạo đơn trước (SV)",
                    String.valueOf(current.getStudentMinMinutesToBook()),
                    String.valueOf(studentMinMinutesToBook), username, reason, "BOOKING");
        }

        if (!current.getLecturerMinMinutesToBook().equals(lecturerMinMinutesToBook)) {
            saveConfigHistory("BOOKING-MIN-MINUTES-CREATE-LECTURER", "Thời gian tạo đơn trước (GV)",
                    String.valueOf(current.getLecturerMinMinutesToBook()),
                    String.valueOf(lecturerMinMinutesToBook), username, reason, "BOOKING");
        }

        current.setActive(false);

        BookingSystemConfig newConfig = BookingSystemConfig.builder()
                .studentAdvanceDays(studentDays)
                .lecturerAdvanceDays(lecturerDays)
                .adminAdvanceDays(adminDays)
                .minMinutesBeforeStartToCancel(minMinutesBeforeStartToCancel)
                .minMinutesBeforeStartToApprove(minMinutesBeforeStartToApprove)
                .studentMinMinutesToBook(studentMinMinutesToBook)
                .lecturerMinMinutesToBook(lecturerMinMinutesToBook)
                .maxPendingBookings(current.getMaxPendingBookings())
                .active(true)
                .build();

        BookingSystemConfig saved = bookingConfigRepository.save(newConfig);
        log.info("Booking configuration updated by {}: ID={}", username, saved.getBookingSystemConfigId());

        return mapper.toBookingConfigResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSystemConfigResponse getBookingConfigResponse() {
        BookingSystemConfig config = bookingConfigReadService.getActiveBookingConfig();
        return mapper.toBookingConfigResponse(config);
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", key = "'booking'")
    public BookingSystemConfigResponse updateBookingField(String key, UpdateConfigFieldRequest request) {
        BookingSystemConfig current = bookingConfigReadService.getActiveBookingConfig();
        User currentUser = securityUtil.getCurrentUser();
        String username = currentUser.getUsername();
        String reason = request.reason();
        
        if (request.value() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        Double value = request.value();

        Integer studentDays = current.getStudentAdvanceDays();
        Integer lecturerDays = current.getLecturerAdvanceDays();
        Integer adminDays = current.getAdminAdvanceDays();
        Integer minCancel = current.getMinMinutesBeforeStartToCancel();
        Integer minApprove = current.getMinMinutesBeforeStartToApprove();
        Integer studentMinBook = current.getStudentMinMinutesToBook();
        Integer lecturerMinBook = current.getLecturerMinMinutesToBook();

        switch (key) {
            case "BOOKING-ADVANCE-DAYS-STUDENT":
                if (studentDays.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Số ngày đặt trước (Sinh viên)", String.valueOf(studentDays), String.valueOf(value.intValue()), username, reason, "BOOKING");
                studentDays = value.intValue();
                break;
            case "BOOKING-ADVANCE-DAYS-LECTURER":
                if (lecturerDays.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Số ngày đặt trước (Giảng viên)", String.valueOf(lecturerDays), String.valueOf(value.intValue()), username, reason, "BOOKING");
                lecturerDays = value.intValue();
                break;
            case "BOOKING-ADVANCE-DAYS-ADMIN":
                if (adminDays.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Số ngày đặt trước (Quản trị viên)", String.valueOf(adminDays), String.valueOf(value.intValue()), username, reason, "BOOKING");
                adminDays = value.intValue();
                break;
            case "BOOKING-MIN-MINUTES-CANCEL":
                if (minCancel.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian hủy trước (Phút)", String.valueOf(minCancel), String.valueOf(value.intValue()), username, reason, "BOOKING");
                minCancel = value.intValue();
                break;
            case "BOOKING-MIN-MINUTES-APPROVE":
                if (minApprove.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian duyệt trước (Phút)", String.valueOf(minApprove), String.valueOf(value.intValue()), username, reason, "BOOKING");
                minApprove = value.intValue();
                break;
            case "BOOKING-MIN-MINUTES-CREATE-STUDENT":
                if (studentMinBook.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian tạo đơn trước (SV)", String.valueOf(studentMinBook), String.valueOf(value.intValue()), username, reason, "BOOKING");
                studentMinBook = value.intValue();
                break;
            case "BOOKING-MIN-MINUTES-CREATE-LECTURER":
                if (lecturerMinBook.equals(value.intValue())) throw new AppException(ErrorCode.NO_CHANGES_DETECTED);
                saveConfigHistory(key, "Thời gian tạo đơn trước (GV)", String.valueOf(lecturerMinBook), String.valueOf(value.intValue()), username, reason, "BOOKING");
                lecturerMinBook = value.intValue();
                break;
            default:
                throw new AppException(ErrorCode.INVALID_KEY);
        }

        current.setActive(false);

        BookingSystemConfig newConfig = BookingSystemConfig.builder()
                .studentAdvanceDays(studentDays)
                .lecturerAdvanceDays(lecturerDays)
                .adminAdvanceDays(adminDays)
                .minMinutesBeforeStartToCancel(minCancel)
                .minMinutesBeforeStartToApprove(minApprove)
                .studentMinMinutesToBook(studentMinBook)
                .lecturerMinMinutesToBook(lecturerMinBook)
                .maxPendingBookings(current.getMaxPendingBookings())
                .active(true)
                .build();
        BookingSystemConfig saved = bookingConfigRepository.save(newConfig);

        return mapper.toBookingConfigResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigHistoryResponse> getAttendanceConfigHistory() {
        return historyRepository.findByCategoryOrderByCreatedAtDesc("ATTENDANCE")
                .stream()
                .map(mapper::toConfigHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigHistoryResponse> getBookingConfigHistory() {
        return historyRepository.findByCategoryOrderByCreatedAtDesc("BOOKING")
                .stream()
                .map(mapper::toConfigHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigHistoryResponse> getAllConfigHistory() {
        return historyRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toConfigHistoryResponse)
                .collect(Collectors.toList());
    }

    private void saveConfigHistory(String key, String name, String oldValue, String newValue,
                                    String changedBy, String reason, String category) {
        SystemConfigHistory history = SystemConfigHistory.builder()
                .configKey(key)
                .configName(name)
                .oldValue(oldValue)
                .newValue(newValue)
                .reason(reason)
                .category(category)
                .active(true)
                .createdBy(changedBy)
                .build();
        historyRepository.save(history);
    }
}
