package iuh.labbooking.dto.response.user;

import java.time.LocalDate;

public record UserResponse(
        Long userId,
        String username,
        String fullName,
        String iuhEmail,

        LocalDate dob,
        String phone,
        String personalEmail,
        String department,
        String faculty,

        String studentId,
        String grade,

        String lecturerId,
        boolean active,

        String role) {
}
