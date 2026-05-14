package iuh.labbooking.dto.request.user;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateUserRequest(

                @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

                @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password,

                @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name must not exceed 100 characters") String fullName,

                @Past(message = "Date of birth must be in the past") LocalDate dob,

                @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10-11 digits") String phone,

                @Email(message = "Invalid IUH email format") @Size(max = 100, message = "Email must not exceed 100 characters") String iuhEmail,

                @Email(message = "Invalid personal email format") @Size(max = 100, message = "Email must not exceed 100 characters") String personalEmail,

                @Size(max = 100, message = "Department must not exceed 100 characters") String department,

                @Size(max = 100, message = "Faculty must not exceed 100 characters") String faculty,

                @NotBlank(message = "Role is required") String role,

                String studentId,

                String lecturerId,

                String grade) {
}
