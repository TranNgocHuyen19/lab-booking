package iuh.labbooking.dto.response.otp;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SendOtpResponse(
        String message,
        Integer cooldownSeconds,
        Integer expiresInMinutes
) {
    public static SendOtpResponse success(int cooldownSeconds, int expiresInMinutes) {
        return SendOtpResponse.builder()
                .message("OTP sent successfully")
                .cooldownSeconds(cooldownSeconds)
                .expiresInMinutes(expiresInMinutes)
                .build();
    }
}
