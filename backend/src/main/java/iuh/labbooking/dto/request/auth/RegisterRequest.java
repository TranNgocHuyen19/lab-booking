package iuh.labbooking.dto.request.auth;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record RegisterRequest(

                @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

                @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name must be less than 100 characters") String fullName,

                @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters long") String password,

                @NotBlank(message = "Confirm password is required") String confirmPassword,

                @Past(message = "Date of birth must be in the past") LocalDate dob,

                @NotBlank(message = "Phone number is required") String phone,

                @Email(message = "Iuh email must be a valid email address") String iuhEmail,

                @Email(message = "Personal email must be a valid email address") String personalEmail,

                String department,
                String faculty,

                @NotBlank(message = "Grade is required") String grade,

                @NotNull(message = "Front side of student card is required") Long frontStudentCard,

                @NotNull(message = "Back side of student card is required") Long backStudentCard,

                Set<Long> researchGroupIds,

                String joinMessage) {
}
