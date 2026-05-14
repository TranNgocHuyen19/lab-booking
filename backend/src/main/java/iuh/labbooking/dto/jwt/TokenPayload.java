package iuh.labbooking.dto.jwt;

import lombok.Builder;

import java.util.Date;

@Builder
public record TokenPayload(
    String token,
    String jwtId,
    Date expirationTime
) {
}
