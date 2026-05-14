package iuh.labbooking.dto.request.configuration;

public record UpdateAttendanceSystemConfigRequest(
        Integer earlyCheckinMinutes,
        Integer lateCheckinMinutes,
        Integer earlyCheckoutMinutes,
        Integer lateCheckoutMinutes,
        Double labRadiusMeters,
        String reason
) {
}
