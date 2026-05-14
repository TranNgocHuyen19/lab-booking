package iuh.labbooking.dto.response.auth;

import lombok.Builder;

@Builder
public record LoginResponse(
        String accessToken,
        String refreshToken,
        String username,
        String fullName,
        String role
) {
}
