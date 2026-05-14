package iuh.labbooking.dto.jwt;

import lombok.Builder;

import java.util.Date;
import java.util.List;

@Builder
public record JwtInformation(
    String jwtId,
    String username,
    Long userId,
    List<String> roles,
    String sessionId,
    Date issueTime,
    Date expirationTime
) {
}
