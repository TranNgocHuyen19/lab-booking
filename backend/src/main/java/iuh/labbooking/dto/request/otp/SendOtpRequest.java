package iuh.labbooking.dto.request.otp;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Scope is required")
        String scope,
        
        String name
) {}
