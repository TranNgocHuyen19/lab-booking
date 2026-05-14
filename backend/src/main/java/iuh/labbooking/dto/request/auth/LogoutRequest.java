package iuh.labbooking.dto.request.auth;

/*
 * Request DTO for logout with optional refresh token
 */
public record LogoutRequest(
        String refreshToken
) {
}
