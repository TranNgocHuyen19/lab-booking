package iuh.labbooking.dto.response.user;

public record UserBriefInfoResponse(
        String username,
        String fullName,
        String phone,
        String iuhEmail,
        String faculty,
        String department,
        String grade) {
}
