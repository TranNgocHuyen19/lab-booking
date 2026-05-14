package iuh.labbooking.dto.response.configuration;

import java.time.LocalDateTime;

public record AttendanceSystemConfigResponse(
        Long attendanceSystemConfigId,
        Integer earlyCheckinMinutes,
        Integer lateCheckinMinutes,
        Integer earlyCheckoutMinutes,
        Integer lateCheckoutMinutes,
        Double labRadiusMeters,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        Boolean active
) {
}
