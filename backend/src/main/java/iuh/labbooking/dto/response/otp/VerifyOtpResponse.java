package iuh.labbooking.dto.response.otp;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VerifyOtpResponse(
        String resetToken,
        Integer expiresInMinutes
) {
    public static VerifyOtpResponse of(String resetToken, int expiresInMinutes) {
        return VerifyOtpResponse.builder()
                .resetToken(resetToken)
                .expiresInMinutes(expiresInMinutes)
                .build();
    }
}
