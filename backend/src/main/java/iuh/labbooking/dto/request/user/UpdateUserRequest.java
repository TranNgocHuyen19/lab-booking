package iuh.labbooking.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record UpdateUserRequest(
                @Past(message = "Date of birth must be in the past") LocalDate dob,

                @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone must be 10-11 digits") String phone,

                @Email(message = "Invalid email format") String personalEmail,

                String department,
                String faculty,
                String grade) {
}
