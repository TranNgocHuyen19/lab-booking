package iuh.labbooking.util.redis;

public final class RedisKey {

    private RedisKey() {}

    private static final String OTP_PREFIX = "otp";
    private static final String OTP_COOLDOWN_PREFIX = "otp_cooldown";
    private static final String OTP_ATTEMPTS_PREFIX = "otp_attempts";
    private static final String RESET_TOKEN_PREFIX = "reset_token";

    public static String otp(String scope, String email) {
        return String.format("%s:%s:%s", OTP_PREFIX, scope, normalizeEmail(email));
    }

    public static String otpCooldown(String scope, String email) {
        return String.format("%s:%s:%s", OTP_COOLDOWN_PREFIX, scope, normalizeEmail(email));
    }

    public static String otpAttempts(String scope, String email) {
        return String.format("%s:%s:%s", OTP_ATTEMPTS_PREFIX, scope, normalizeEmail(email));
    }

    public static String resetToken(String email) {
        return String.format("%s:%s", RESET_TOKEN_PREFIX, normalizeEmail(email));
    }

    private static String normalizeEmail(String email) {
        return email != null ? email.toLowerCase().trim() : "";
    }
}
