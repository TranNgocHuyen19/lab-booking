package iuh.labbooking.service.systemconfiguration;

import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.AttendanceSystemConfig;
import iuh.labbooking.repository.AttendanceSystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceConfigReadService {

    private final AttendanceSystemConfigRepository attendanceConfigRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfigs", key = "'attendance'")
    public AttendanceSystemConfig getActiveAttendanceConfig() {
        log.debug("Cache MISS - Loading attendance config from DB");
        return attendanceConfigRepository.findActiveConfiguration()
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CONFIG_NOT_FOUND));
    }
}
