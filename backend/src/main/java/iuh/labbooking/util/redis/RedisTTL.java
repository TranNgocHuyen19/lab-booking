package iuh.labbooking.util.redis;

public final class RedisTTL {

    private RedisTTL() {}

    public static final int OTP_EXPIRY_MINUTES = 5;
    public static final int OTP_COOLDOWN_SECONDS = 60;
    public static final int MAX_OTP_ATTEMPTS = 5;
    public static final int OTP_LOCKOUT_MINUTES = 15;
    public static final int RESET_TOKEN_EXPIRY_MINUTES = 10;
}
