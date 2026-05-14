package iuh.labbooking.dto.response.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SecureUserResponse(
                Long userId,
                String username,
                String fullName,
                String iuhEmail,
                String role,

                LocalDate dob,
                String phone,
                String personalEmail,
                String department,
                String faculty,

                String studentId,
                String grade,

                String lecturerId,
                boolean active,

                LocalDateTime createdAt,
                String createdBy,
                LocalDateTime modifiedAt,
                String modifiedBy) {
}
