package iuh.labbooking.dto.response.user;

public record LecturerBriefInfoResponse(
        Long userId,
        String username,
        String fullName,
        String phone,
        String iuhEmail,
        String faculty,
        String department,
        String lecturerId) {
}
