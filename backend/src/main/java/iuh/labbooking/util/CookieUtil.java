package iuh.labbooking.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class CookieUtil {

    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    @Value("${jwt.refresh.expiration:7d}")
    private String refreshExpiration;

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        long maxAgeSeconds = DurationParserUtil.parseToSeconds(refreshExpiration);
        
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .sameSite(sameSite)
                .build();
    }

    public ResponseCookie createExpiredRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(sameSite)
                .build();
    }
}
